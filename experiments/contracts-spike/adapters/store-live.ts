// Client-side live cache: a ClientStore decorator over any other ClientStore (memory, http, ...).
//   - keeps a per-entity cache of every row it has seen
//   - applies create/update/remove optimistically (temporary id for create), rolls back on reject,
//     reconciles with the returned row
//   - folds the inner change feed (`inner.subscribe(null)`, once) into the cache, deduped by `seq`
//   - `watch(entity, query, listener)` re-evaluates a ListQuery locally over the cache on every
//     change, using the shared evaluator so semantics match the adapters
// An entity is "complete" once one unfiltered list at offset 0 fetched every row; from then on
// `list`/`watch` for it are served locally and stay current through the feed. Until then `list`
// goes to the inner store and a watcher refetches on every change. `include` is served locally
// only when every target entity is complete too, so titles are never guessed.
import type { Entity, Input, Row } from "../contracts/entity";
import { type ChangeEvent, type ClientStore, type ListQuery, type Page, validate } from "../contracts/store";
import { evaluate } from "./query";

export interface LiveStore extends ClientStore {
  /** Observe a query. Fires with the seeded page, then on every cache change that affects the entity. */
  watch(entity: Entity, query: ListQuery, listener: (page: Page) => void): () => void;
  /** True while `id` is the temporary id of a create still in flight. */
  isPending(id: string): boolean;
  /** Stop listening to the inner feed. */
  dispose(): void;
}

export interface LiveStoreOptions {
  tempId?: () => string;
  /** Seed/refetch failures inside `watch` are reported here (default: console.error). */
  onError?: (error: unknown) => void;
}

const TEMP = "tmp:";
export const isTempId = (id: string): boolean => id.startsWith(TEMP);

interface Watcher {
  entity: Entity;
  query: ListQuery;
  listener: (page: Page) => void;
  ready: boolean;
  last?: Page;
  token: number;
}

/** Field-wise equality ignoring `id`: matches a server `created` event to its optimistic temp row. */
function sameContent(a: Row, b: Row): boolean {
  const { id: _a, ...ra } = a;
  const { id: _b, ...rb } = b;
  return JSON.stringify(ra) === JSON.stringify(rb);
}

export function createLiveStore(inner: ClientStore, options: LiveStoreOptions = {}): LiveStore {
  const tempId = options.tempId ?? (() => `${TEMP}${crypto.randomUUID()}`);
  const onError = options.onError ?? ((e: unknown) => console.error("live store:", e));
  const tables = new Map<string, Map<string, Row>>();
  const entities = new Map<string, Entity>();
  const complete = new Set<string>();
  const pending = new Set<string>();
  const watchers = new Set<Watcher>();
  const dirty = new Set<string>();
  let flushScheduled = false;
  let lastSeq = 0;

  const table = (name: string) => {
    let t = tables.get(name);
    if (!t) tables.set(name, (t = new Map()));
    return t;
  };

  function mark(name: string) {
    dirty.add(name);
    if (flushScheduled) return;
    flushScheduled = true;
    queueMicrotask(flush);
  }
  function flush() {
    flushScheduled = false;
    const names = new Set(dirty);
    dirty.clear();
    for (const w of watchers) if (w.ready && names.has(w.entity.name)) run(w);
  }

  /** Put a row in the cache; returns whether anything changed. */
  function set(name: string, row: Row, notify = true): boolean {
    const t = table(name);
    const prev = t.get(row.id);
    if (prev && JSON.stringify(prev) === JSON.stringify(row)) return false;
    t.set(row.id, row);
    if (notify) mark(name);
    return true;
  }
  function del(name: string, id: string, notify = true): Row | undefined {
    const t = table(name);
    const prev = t.get(id);
    if (prev === undefined) return undefined;
    t.delete(id);
    if (notify) mark(name);
    return prev;
  }

  function servable(entity: Entity, query: ListQuery): boolean {
    if (!complete.has(entity.name)) return false;
    for (const name of query.include ?? []) {
      const f = entity.fields.find((x) => x.name === name);
      if (f?.kind === "relation" && !f.many && !complete.has(f.to)) return false;
    }
    return true;
  }
  // Cache rows are canonical (relation fields hold ids); `include` is re-resolved locally.
  function canonical(row: Row, include: string[] | undefined): Row {
    if (!include?.length) return row;
    const out = { ...row };
    for (const name of include) {
      const v = out[name];
      if (v && typeof v === "object" && "id" in v) out[name] = v.id;
    }
    return out;
  }
  function local(entity: Entity, query: ListQuery): Page {
    const page = evaluate(entity, [...table(entity.name).values()], query);
    if (!query.include?.length) return page;
    const rows = page.rows.map((row) => {
      const out = { ...row };
      for (const name of query.include!) {
        const f = entity.fields.find((x) => x.name === name);
        const id = row[name];
        if (!f || f.kind !== "relation" || f.many || typeof id !== "string") continue;
        const target = entities.get(f.to);
        const t = tables.get(f.to)?.get(id);
        out[name] = { id, title: target && t ? t[target.title] : undefined };
      }
      return out;
    });
    return { rows, total: page.total };
  }
  function merge(entity: Entity, page: Page, query: ListQuery, notify: boolean) {
    for (const row of page.rows) set(entity.name, canonical(row, query.include), notify);
    const unfiltered = !query.search && Object.keys(query.where ?? {}).length === 0 && (query.offset ?? 0) === 0;
    if (!unfiltered || page.rows.length !== page.total) return;
    // Rows the server no longer has must leave the cache too (a reconnect-style refresh).
    const keep = new Set(page.rows.map((r) => r.id));
    for (const id of [...table(entity.name).keys()]) if (!keep.has(id) && !pending.has(id)) del(entity.name, id, notify);
    complete.add(entity.name);
  }

  function deliver(w: Watcher, page: Page) {
    const last = w.last;
    if (last && last.total === page.total && last.rows.length === page.rows.length && last.rows.every((r, i) => r === page.rows[i])) return;
    w.last = page;
    w.listener(page);
  }
  function run(w: Watcher) {
    if (servable(w.entity, w.query)) deliver(w, local(w.entity, w.query));
    else refetch(w);
  }
  function refetch(w: Watcher) {
    const token = ++w.token;
    inner.list(w.entity, w.query).then(
      (page) => {
        if (!watchers.has(w) || token !== w.token) return;
        merge(w.entity, page, w.query, false);
        w.ready = true;
        deliver(w, servable(w.entity, w.query) ? local(w.entity, w.query) : page);
      },
      (e) => {
        if (watchers.has(w) && token === w.token) onError(e);
      },
    );
  }

  function apply(event: ChangeEvent) {
    if (event.seq <= lastSeq) return; // duplicate or stale delivery
    lastSeq = event.seq;
    if (event.kind === "removed") {
      del(event.entity, event.id);
      return;
    }
    if (!event.row) return;
    if (event.kind === "created") {
      // Our own create echoed back before the call resolved: swap the temp row out now so the
      // list never shows both. The resolving call finds nothing left to delete.
      const t = table(event.entity);
      for (const id of pending) {
        const temp = t.get(id);
        if (temp && sameContent(temp, event.row)) {
          pending.delete(id);
          del(event.entity, id);
          break;
        }
      }
    }
    set(event.entity, event.row);
  }
  const unsubscribe = inner.subscribe(null, apply);

  return {
    async list(entity, query = {}) {
      entities.set(entity.name, entity);
      if (servable(entity, query)) return local(entity, query);
      const page = await inner.list(entity, query);
      merge(entity, page, query, true);
      return servable(entity, query) ? local(entity, query) : page;
    },

    async get(entity, id) {
      entities.set(entity.name, entity);
      const hit = table(entity.name).get(id);
      if (hit) return hit;
      if (complete.has(entity.name)) return undefined;
      const row = await inner.get(entity, id);
      if (row) set(entity.name, row);
      return row;
    },

    async create(entity, input: Input) {
      entities.set(entity.name, entity);
      let temp: Row | undefined;
      try {
        temp = { id: tempId(), ...validate(entity, input) };
        pending.add(temp.id);
        set(entity.name, temp);
      } catch {
        temp = undefined; // invalid locally: let the server answer, show nothing meanwhile
      }
      const settle = () => {
        if (temp && pending.delete(temp.id)) del(entity.name, temp.id);
      };
      try {
        const row = await inner.create(entity, input);
        settle();
        set(entity.name, row);
        return row;
      } catch (e) {
        settle();
        throw e;
      }
    },

    async update(entity, id, patch: Input) {
      entities.set(entity.name, entity);
      const prev = table(entity.name).get(id);
      let optimistic: Row | undefined;
      if (prev) {
        try {
          const next = { ...prev };
          for (const [k, v] of Object.entries(validate(entity, patch, true))) if (v !== undefined) next[k] = v;
          optimistic = next;
          set(entity.name, next);
        } catch {
          optimistic = undefined;
        }
      }
      try {
        const row = await inner.update(entity, id, patch);
        set(entity.name, row);
        return row;
      } catch (e) {
        // Roll back only if nothing newer (a feed event) replaced our optimistic row meanwhile.
        if (prev && optimistic && table(entity.name).get(id) === optimistic) set(entity.name, prev);
        throw e;
      }
    },

    async remove(entity, id) {
      entities.set(entity.name, entity);
      const prev = del(entity.name, id);
      try {
        await inner.remove(entity, id);
      } catch (e) {
        if (prev && !table(entity.name).has(id)) set(entity.name, prev);
        throw e;
      }
    },

    subscribe: (entity, fn) => inner.subscribe(entity, fn),

    watch(entity, query, listener) {
      entities.set(entity.name, entity);
      const w: Watcher = { entity, query, listener, ready: false, token: 0 };
      watchers.add(w);
      if (servable(entity, query)) {
        w.ready = true;
        deliver(w, local(entity, query));
      } else refetch(w);
      return () => watchers.delete(w);
    },

    isPending: (id) => pending.has(id),
    dispose: () => unsubscribe(),
  };
}

export const isLiveStore = (store: ClientStore): store is LiveStore => typeof (store as Partial<LiveStore>).watch === "function";

const wrapped = new WeakMap<ClientStore, LiveStore>();
/** The live view of any ClientStore; one per store, created on first use. */
export function liveOf(store: ClientStore): LiveStore {
  if (isLiveStore(store)) return store;
  let live = wrapped.get(store);
  if (!live) wrapped.set(store, (live = createLiveStore(store)));
  return live;
}

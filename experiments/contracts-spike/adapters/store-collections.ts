// Client collections adapter: TanStack DB under the ClientStore contract.
//
// One collection per entity (lazily). Rows load once via `queryFn` (the inner store's list),
// mutations are optimistic through the collection and persisted by `onInsert/onUpdate/onDelete`
// (a rejected persist rolls the optimistic state back, built into TanStack DB), and ONE
// `inner.subscribe(null)` applies incoming ChangeEvents straight into the collections with
// `utils.write*`, so nothing refetches on change. Views use live queries over the collections;
// `store` is a ClientStore facade over the same collections so the conformance suite proves it.
import { QueryClient } from "@tanstack/query-core";
import { createCollection, type Collection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { Entity, Input, Row } from "../contracts/entity";
import {
  type ChangeEvent,
  type ClientStore,
  createChangeBus,
  type ListQuery,
  StoreNotFoundError,
  validate,
} from "../contracts/store";
import { evaluate } from "./query";

export interface CollectionsOptions {
  /** Identifies this client so the server drops its own SSE echoes (the inner store must pass it on). */
  origin?: string;
  queryClient?: QueryClient;
  /** Rows loaded per collection on first use. */
  loadLimit?: number;
}

/** A row as held by a collection: server rows, or an optimistic insert before its id is known. */
export type CollectionRow = Row;

export interface Collections {
  /** The TanStack DB collection for an entity; created on first use. */
  collection(entity: Entity): Collection<CollectionRow, string>;
  /** Wait until the collection has loaded its initial rows. */
  ready(entity: Entity): Promise<void>;
  /** ClientStore facade over the collections: reads are local, writes are optimistic. */
  store: ClientStore;
  /** Stop the change feed and drop every collection. */
  dispose(): void;
}

const TEMP = "tmp:";
export const isTempId = (id: string): boolean => id.startsWith(TEMP);

/** Collections decorate rows with `$collectionId`/`$key`/`$origin`/`$synced`; the contract does not. */
export function plain(row: object): Row {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) if (!k.startsWith("$")) out[k] = v;
  return out as Row;
}

export function createCollections(inner: ClientStore, options: CollectionsOptions = {}): Collections {
  const queryClient = options.queryClient ?? new QueryClient();
  const loadLimit = options.loadLimit ?? 10_000;
  const collections = new Map<string, Collection<CollectionRow, string>>();
  const entities = new Map<string, Entity>();
  const bus = createChangeBus();
  const seen = new Set<string>(); // `${entity}:${seq}` dedupe for duplicate SSE delivery
  const pendingCreated = new Map<string, Row>(); // temp id -> server row, handed from onInsert to create
  let unsubscribe: (() => void) | undefined;

  function applyEvent(event: ChangeEvent) {
    const key = `${event.entity}:${event.seq}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (seen.size > 10_000) seen.clear();
    const c = collections.get(event.entity);
    if (!c) return;
    const utils = c.utils as unknown as {
      writeUpsert: (row: Partial<CollectionRow>) => void;
      writeDelete: (key: string) => void;
    };
    if (event.kind === "removed") {
      if (c.has(event.id)) utils.writeDelete(event.id);
    } else if (event.row) {
      utils.writeUpsert(event.row);
    }
    bus.emit(event);
  }

  function ensureFeed() {
    if (unsubscribe) return;
    unsubscribe = inner.subscribe(null, applyEvent);
  }

  function collection(entity: Entity): Collection<CollectionRow, string> {
    const existing = collections.get(entity.name);
    if (existing) return existing;
    entities.set(entity.name, entity);
    // eslint-disable-next-line prefer-const
    let c: Collection<CollectionRow, string> | undefined;
    const created = createCollection(
      queryCollectionOptions<CollectionRow, unknown, [string, string], string>({
        id: `texo:${entity.name}`,
        queryKey: ["texo", entity.name],
        queryClient,
        queryFn: async () => (await inner.list(entity, { limit: loadLimit })).rows,
        getKey: (row) => row.id,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onInsert: async ({ transaction }) => {
          // Persist each optimistic insert. The server row is written into synced data by the
          // facade AFTER the transaction settles, so the temp row and the real one never coexist.
          for (const m of transaction.mutations) {
            const { id: _temp, ...input } = m.modified as CollectionRow;
            const row = await inner.create(entity, input as Input);
            pendingCreated.set(m.key as string, row);
          }
          return { refetch: false };
        },
        onUpdate: async ({ transaction }) => {
          for (const m of transaction.mutations) {
            const row = await inner.update(entity, m.key as string, m.changes as Input);
            (c!.utils as unknown as { writeUpsert: (r: Partial<CollectionRow>) => void }).writeUpsert(row);
          }
          return { refetch: false };
        },
        onDelete: async ({ transaction }) => {
          for (const m of transaction.mutations) await inner.remove(entity, m.key as string);
          return { refetch: false };
        },
      }),
    ) as unknown as Collection<CollectionRow, string>;
    c = created;
    collections.set(entity.name, created);
    ensureFeed();
    return created;
  }

  async function ready(entity: Entity) {
    await collection(entity).preload();
  }

  const store: ClientStore = {
    async list(entity, query: ListQuery = {}) {
      await ready(entity);
      const rows = collection(entity).toArray.map(plain);
      const page = evaluate(entity, rows, query);
      return { ...page, rows: includeFrom(page.rows, entity, query.include) };
    },
    async get(entity, id) {
      await ready(entity);
      const r = collection(entity).get(id);
      return r ? plain(r) : undefined;
    },
    async create(entity, input: Input) {
      await ready(entity);
      const data = validate(entity, input); // validate locally first: a 422 never becomes optimistic
      const temp = `${TEMP}${crypto.randomUUID()}`;
      const c = collection(entity);
      const tx = c.insert({ id: temp, ...data } as CollectionRow);
      await tx.isPersisted.promise;
      const created = pendingCreated.get(temp);
      pendingCreated.delete(temp);
      if (!created) throw new Error(`${entity.name}: create persisted without a row`);
      (c.utils as unknown as { writeUpsert: (r: Partial<CollectionRow>) => void }).writeUpsert(created);
      return created;
    },
    async update(entity, id, patch: Input) {
      await ready(entity);
      const c = collection(entity);
      if (!c.has(id)) throw new StoreNotFoundError(entity.name, id);
      const data = validate(entity, patch, true);
      const tx = c.update(id, (draft) => {
        for (const [k, v] of Object.entries(data)) if (v !== undefined) (draft as Record<string, unknown>)[k] = v;
      });
      await tx.isPersisted.promise;
      return plain(c.get(id) as object);
    },
    async remove(entity, id) {
      await ready(entity);
      const c = collection(entity);
      if (!c.has(id)) return;
      await c.delete(id).isPersisted.promise;
    },
    subscribe: (entity, fn) => {
      ensureFeed();
      return bus.subscribe(entity, fn);
    },
  };


  function includeFrom(rows: Row[], entity: Entity, fields: string[] | undefined): Row[] {
    if (!fields?.length) return rows;
    return rows.map((row) => {
      const out = { ...row };
      for (const name of fields) {
        const f = entity.fields.find((x) => x.name === name);
        if (!f || f.kind !== "relation" || f.many) continue;
        const target = entities.get(f.to);
        const id = row[name];
        if (!target || typeof id !== "string") continue;
        const t = collections.get(target.name)?.get(id) as CollectionRow | undefined;
        out[name] = { id, title: t?.[target.title] };
      }
      return out;
    });
  }

  return {
    collection,
    ready,
    store,
    dispose() {
      unsubscribe?.();
      unsubscribe = undefined;
      for (const c of collections.values()) c.cleanup();
      collections.clear();
    },
  };
}

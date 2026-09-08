// The live cache is a ClientStore: wrapped around memory it must pass the suite unchanged.
// Then the parts the suite cannot see: optimistic state, rollback, feed routing, dedupe.
import { describe, expect, test } from "bun:test";
import { conformanceEntities, conformanceTask as task, runClientStoreConformance } from "../contracts/store.conformance";
import type { ChangeEvent, ClientStore, ListQuery, Page } from "../contracts/store";
import { createLiveStore, isTempId, type LiveStore } from "./store-live";
import { createMemoryStore } from "./store-memory";

runClientStoreConformance("live→memory", async () => {
  const memory = createMemoryStore();
  for (const e of conformanceEntities) await memory.migrate(e);
  return createLiveStore(memory);
});

const titles = (p: Page) => p.rows.map((r) => r.title);

/** "Nothing else arrives": one macrotask lets every pending microtask chain (list -> merge -> deliver) drain. */
const settle = () => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, 0);
  return promise;
};

/** Collect watcher pages; `next()` resolves on the following delivery. */
function observe(live: LiveStore, query: ListQuery) {
  const pages: Page[] = [];
  let waiter: ((p: Page) => void) | undefined;
  live.watch(task, query, (p) => {
    pages.push(p);
    waiter?.(p);
    waiter = undefined;
  });
  return {
    pages,
    latest: () => pages.at(-1)!,
    next: () => {
      const { promise, resolve } = Promise.withResolvers<Page>();
      waiter = resolve;
      return promise;
    },
  };
}

/** Memory store whose writes wait for `release()` and can be made to fail; the feed is ours to replay. */
async function harness() {
  const memory = createMemoryStore();
  for (const e of conformanceEntities) await memory.migrate(e);
  let gate = Promise.resolve();
  let open = () => {};
  let failing = false;
  const listeners = new Set<(e: ChangeEvent) => void>();
  memory.subscribe(null, (e) => {
    for (const fn of listeners) fn(e);
  });
  const write = async <T>(run: () => Promise<T>) => {
    await gate;
    if (failing) throw new Error("server down");
    return run();
  };
  const inner: ClientStore = {
    list: (e, q) => memory.list(e, q),
    get: (e, id) => memory.get(e, id),
    create: (e, input) => write(() => memory.create(e, input)),
    update: (e, id, patch) => write(() => memory.update(e, id, patch)),
    remove: (e, id) => write(() => memory.remove(e, id)),
    subscribe: (_entity, fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
  return {
    memory,
    inner,
    live: createLiveStore(inner),
    hold: () => {
      ({ promise: gate, resolve: open } = Promise.withResolvers<void>());
    },
    release: () => open(),
    fail: (on: boolean) => {
      failing = on;
    },
    replay: (e: ChangeEvent) => {
      for (const fn of listeners) fn(e);
    },
  };
}

describe("live store: optimistic state", () => {
  test("create is visible to a watcher before the inner promise resolves, then reconciles to the server row", async () => {
    const h = await harness();
    const w = observe(h.live, { orderBy: { field: "title", direction: "asc" } });
    expect((await w.next()).total).toBe(0);

    h.hold();
    const shownSoon = w.next();
    const creating = h.live.create(task, { title: "optimistic", priority: 1, status: "todo" });
    const shown = await shownSoon;
    expect(titles(shown)).toEqual(["optimistic"]);
    expect(isTempId(shown.rows[0]!.id)).toBe(true);
    expect(h.live.isPending(shown.rows[0]!.id)).toBe(true);
    expect(shown.rows[0]!.done).toBe(false); // defaults applied locally

    const settledSoon = w.next();
    h.release();
    const row = await creating;
    const settled = await settledSoon;
    expect(settled.rows.map((r) => r.id)).toEqual([row.id]);
    expect(isTempId(row.id)).toBe(false);
    expect(h.live.isPending(shown.rows[0]!.id)).toBe(false);
    expect((await h.memory.list(task)).total).toBe(1);
  });

  test("rollback on reject restores the previous list for create, update and remove", async () => {
    const h = await harness();
    const seeded = await h.live.create(task, { title: "keep", priority: 1, status: "todo" });
    const w = observe(h.live, { orderBy: { field: "title", direction: "asc" } });
    expect(titles(await w.next())).toEqual(["keep"]);
    h.fail(true);

    h.hold();
    let soon = w.next();
    const c = h.live.create(task, { title: "ghost", priority: 1, status: "todo" });
    expect(titles(await soon)).toEqual(["ghost", "keep"]);
    soon = w.next();
    h.release();
    await expect(c).rejects.toThrow("server down");
    expect(titles(await soon)).toEqual(["keep"]);

    h.hold();
    soon = w.next();
    const u = h.live.update(task, seeded.id, { title: "renamed" });
    expect(titles(await soon)).toEqual(["renamed"]);
    soon = w.next();
    h.release();
    await expect(u).rejects.toThrow("server down");
    expect(titles(await soon)).toEqual(["keep"]);

    h.hold();
    soon = w.next();
    const r = h.live.remove(task, seeded.id);
    expect((await soon).total).toBe(0);
    soon = w.next();
    h.release();
    await expect(r).rejects.toThrow("server down");
    expect(titles(await soon)).toEqual(["keep"]);
    expect((await h.memory.get(task, seeded.id))!.title).toBe("keep");
  });
});

describe("live store: change feed", () => {
  test("an incoming updated event moves a row between two watched queries", async () => {
    const h = await harness();
    const row = await h.memory.create(task, { title: "move me", priority: 1, status: "todo" });
    const todo = observe(h.live, { where: { status: "todo" } });
    const done = observe(h.live, { where: { status: "done" } });
    expect(titles(await todo.next())).toEqual(["move me"]);
    await settle();
    expect(done.latest().total).toBe(0);

    let moved = Promise.all([todo.next(), done.next()]);
    await h.memory.update(task, row.id, { status: "done" }); // another client's write, seen via the feed
    const [t, d] = await moved;
    expect(t.total).toBe(0);
    expect(titles(d)).toEqual(["move me"]);
    expect(d.rows[0]!.status).toBe("done");

    const gone = done.next();
    await h.memory.remove(task, row.id);
    expect((await gone).total).toBe(0);
    await settle();
    expect(todo.pages).toHaveLength(2); // the todo query was not affected by the removal
  });

  test("duplicate delivery (same seq) and stale seq are idempotent", async () => {
    const h = await harness();
    const row = await h.memory.create(task, { title: "once", priority: 1, status: "todo" });
    const w = observe(h.live, {});
    await w.next();
    expect(w.pages).toHaveLength(1);

    const updated: ChangeEvent = { entity: task.name, kind: "updated", id: row.id, row: { ...row, title: "twice" }, seq: 7 };
    const soon = w.next();
    h.replay(updated);
    h.replay(updated);
    h.replay({ ...updated, row: { ...row, title: "thrice" } }); // same seq, must be ignored
    expect(titles(await soon)).toEqual(["twice"]);
    await settle();
    expect(w.pages).toHaveLength(2);

    h.replay({ entity: task.name, kind: "removed", id: row.id, seq: 6 }); // older than what we have seen
    await settle();
    expect(w.pages).toHaveLength(2);
    expect(titles(w.latest())).toEqual(["twice"]);
  });

  test("own created echo arriving before the call resolves does not double the row", async () => {
    const h = await harness();
    const w = observe(h.live, {});
    await w.next();
    const row = await h.live.create(task, { title: "echo", priority: 1, status: "todo" });
    await settle();
    expect(w.latest().rows.map((r) => r.id)).toEqual([row.id]);
    expect(w.pages.every((p) => p.total <= 1)).toBe(true);
  });

  test("list is served from the cache once the entity is complete", async () => {
    const h = await harness();
    await h.memory.create(task, { title: "a", priority: 2, status: "todo" });
    let calls = 0;
    const live = createLiveStore({
      ...h.inner,
      list: (e, q) => {
        calls++;
        return h.inner.list(e, q);
      },
    });
    expect((await live.list(task)).total).toBe(1);
    expect(calls).toBe(1);
    await h.memory.create(task, { title: "b", priority: 1, status: "todo" });
    const page = await live.list(task, { orderBy: { field: "priority", direction: "asc" } });
    expect(titles(page)).toEqual(["b", "a"]);
    expect(calls).toBe(1);
  });
});

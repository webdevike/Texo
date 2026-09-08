// The collections facade must be a ClientStore (conformance over memory) AND keep the live
// behaviors the hand-rolled live store proved: optimistic before persist, rollback on reject,
// event routing between live views, idempotent duplicate delivery.
import { describe, expect, test } from "bun:test";
import { type ChangeEvent, type ClientStore, StoreValidationError } from "../contracts/store";
import { conformanceEntities, conformanceTask, runClientStoreConformance } from "../contracts/store.conformance";
import { createCollections } from "./store-collections";
import { createMemoryStore } from "./store-memory";

async function memoryBacked() {
  const inner = createMemoryStore();
  for (const e of conformanceEntities) await inner.migrate(e);
  return inner;
}

runClientStoreConformance("collections→memory", async () => createCollections(await memoryBacked()).store);

describe("collections: live behaviors", () => {
  const task = conformanceTask;

  test("optimistic insert is visible in the collection before the inner create resolves", async () => {
    const inner = await memoryBacked();
    const gate = Promise.withResolvers<void>();
    const slow: ClientStore = { ...inner, create: async (e, i) => { await gate.promise; return inner.create(e, i); } };
    const cols = createCollections(slow);
    await cols.ready(task);
    const pending = cols.store.create(task, { title: "optimistic", priority: 1, status: "todo" });
    await new Promise((r) => setTimeout(r, 20));
    expect(cols.collection(task).toArray.map((r) => r.title)).toEqual(["optimistic"]);
    gate.resolve();
    const row = await pending;
    expect(row.id.startsWith("tmp:")).toBe(false);
    expect(cols.collection(task).toArray.map((r) => r.id)).toEqual([row.id]);
    cols.dispose();
  });

  test("rollback on reject restores the previous rows", async () => {
    const inner = await memoryBacked();
    const cols = createCollections(inner);
    const row = await cols.store.create(task, { title: "keep", priority: 1, status: "todo" });
    const rejecting: ClientStore = { ...inner, update: async () => { throw new StoreValidationError([{ path: ["priority"], message: "nope" }]); } };
    const cols2 = createCollections(rejecting);
    await cols2.ready(task);
    await expect(cols2.store.update(task, row.id, { priority: 3 })).rejects.toBeInstanceOf(StoreValidationError);
    expect(cols2.collection(task).get(row.id)?.priority).toBe(1);
    cols.dispose();
    cols2.dispose();
  });

  test("an incoming updated event moves a row between two filtered views without a refetch", async () => {
    const inner = await memoryBacked();
    let lists = 0;
    const counting: ClientStore = { ...inner, list: (e, q) => { lists++; return inner.list(e, q); } };
    const cols = createCollections(counting);
    await cols.ready(task);
    const row = await inner.create(task, { title: "mover", priority: 1, status: "todo" }); // external write
    await new Promise((r) => setTimeout(r, 20));
    const listsAfterLoad = lists;
    const todo = () => cols.collection(task).toArray.filter((r) => r.status === "todo").map((r) => r.id);
    const done = () => cols.collection(task).toArray.filter((r) => r.status === "done").map((r) => r.id);
    expect(todo()).toEqual([row.id]);
    await inner.update(task, row.id, { status: "done" }); // external, arrives via subscribe
    await new Promise((r) => setTimeout(r, 20));
    expect(todo()).toEqual([]);
    expect(done()).toEqual([row.id]);
    expect(lists).toBe(listsAfterLoad);
    cols.dispose();
  });

  test("duplicate delivery of the same event is idempotent", async () => {
    const inner = await memoryBacked();
    const listeners: ((e: ChangeEvent) => void)[] = [];
    const replaying: ClientStore = { ...inner, subscribe: (_e, fn) => { listeners.push(fn); return () => {}; } };
    const cols = createCollections(replaying);
    await cols.ready(task);
    const ev: ChangeEvent = { entity: task.name, kind: "created", id: "x1", seq: 7, row: { id: "x1", title: "dup", priority: 1, status: "todo", done: false } };
    for (const fn of listeners) { fn(ev); fn(ev); fn({ ...ev }); }
    expect(cols.collection(task).toArray.filter((r) => r.id === "x1")).toHaveLength(1);
    cols.dispose();
  });
});

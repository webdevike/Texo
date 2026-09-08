// Adapter-agnostic behavioral suite. Every Store adapter must pass it unchanged.
//   runStoreConformance("sqlite", () => createSqliteStore(":memory:"))
// `runClientStoreConformance` covers the ClientStore surface only (transports).
// The factory must return a FRESH store per call; entities used here are migrated by the
// suite via `prepare` (a Store) or assumed migrated by the host (a ClientStore).
import { describe, expect, test } from "bun:test";
import { defineEntity, type Entity, type Row } from "./entity";
import {
  type ChangeEvent,
  type ClientStore,
  type Store,
  StoreNotFoundError,
  StoreReferenceError,
  StoreSchemaError,
  StoreValidationError,
} from "./store";

export const conformanceTask = defineEntity({
  name: "conformance_task",
  title: "title",
  fields: [
    { name: "title", kind: "string", min: 1 },
    { name: "done", kind: "boolean", default: false },
    { name: "priority", kind: "number", integer: true },
    { name: "status", kind: "enum", options: ["todo", "doing", "done"] },
    { name: "note", kind: "string", optional: true },
    { name: "due", kind: "date", optional: true },
    { name: "meta", kind: "group", optional: true, fields: [{ name: "tag", kind: "string" }, { name: "weight", kind: "number" }] },
    { name: "steps", kind: "group", optional: true, repeatable: true, fields: [{ name: "text", kind: "string" }, { name: "ok", kind: "boolean", default: false }] },
  ],
});
export const conformanceProject = defineEntity({
  name: "conformance_project",
  title: "name",
  fields: [{ name: "name", kind: "string", min: 1 }],
});
export const conformanceIssue = defineEntity({
  name: "conformance_issue",
  title: "title",
  fields: [
    { name: "title", kind: "string", min: 1 },
    { name: "project", kind: "relation", to: "conformance_project", optional: true },
    { name: "labels", kind: "relation", to: "conformance_project", many: true, optional: true },
  ],
});
/** Every entity the ClientStore suite touches; a host serving a ClientStore must have these migrated. */
export const conformanceEntities: Entity[] = [conformanceTask, conformanceProject, conformanceIssue];

const task = conformanceTask;
const project = conformanceProject;
const issue = conformanceIssue;

const seed = async (store: ClientStore) => {
  await store.create(task, { title: "alpha", priority: 1, status: "todo" });
  await store.create(task, { title: "beta", priority: 2, status: "doing", done: true, note: "hello world" });
  await store.create(task, { title: "gamma", priority: 3, status: "doing", done: true, due: "2026-01-02" });
  await store.create(task, { title: "delta", priority: 4, status: "done", due: "2026-03-04" });
};
const titles = (rows: Row[]) => rows.map((r) => r.title);

export function runClientStoreConformance(label: string, make: () => ClientStore | Promise<ClientStore>) {
  describe(`ClientStore conformance: ${label}`, () => {
    test("create returns a row with an id and applied defaults", async () => {
      const store = await make();
      const row = await store.create(task, { title: "a", priority: 1, status: "todo" });
      expect(typeof row.id).toBe("string");
      expect(row.id.length).toBeGreaterThan(0);
      expect(row.done).toBe(false);
      expect(row.title).toBe("a");
    });

    test("create rejects invalid input with StoreValidationError and stores nothing", async () => {
      const store = await make();
      await expect(store.create(task, { title: "", priority: 1, status: "todo" })).rejects.toBeInstanceOf(StoreValidationError);
      await expect(store.create(task, { title: "x", priority: 1.5, status: "todo" })).rejects.toBeInstanceOf(StoreValidationError);
      await expect(store.create(task, { title: "x", priority: 1, status: "nope" })).rejects.toBeInstanceOf(StoreValidationError);
      await expect(store.create(task, { title: "x", priority: 1, status: "todo", due: "yesterday" })).rejects.toBeInstanceOf(StoreValidationError);
      expect((await store.list(task)).total).toBe(0);
    });

    test("get returns the created row, undefined for unknown id", async () => {
      const store = await make();
      const row = await store.create(task, { title: "a", priority: 1, status: "todo", note: "n" });
      expect(await store.get(task, row.id)).toEqual(row);
      expect(await store.get(task, "missing")).toBeUndefined();
    });

    test("list returns a Page with rows and total; ids unique", async () => {
      const store = await make();
      await seed(store);
      const page = await store.list(task);
      expect(page.total).toBe(4);
      expect(page.rows).toHaveLength(4);
      expect(new Set(page.rows.map((r) => r.id)).size).toBe(4);
    });

    test("where: bare value is equality, AND across keys, boolean and enum included", async () => {
      const store = await make();
      await seed(store);
      expect(titles((await store.list(task, { where: { status: "doing" } })).rows).sort()).toEqual(["beta", "gamma"]);
      expect(titles((await store.list(task, { where: { status: "doing", priority: 2 } })).rows)).toEqual(["beta"]);
      expect(titles((await store.list(task, { where: { done: false } })).rows).sort()).toEqual(["alpha", "delta"]);
    });

    test("where: operators ne/in/nin/lt/lte/gt/gte/contains/isNull", async () => {
      const store = await make();
      await seed(store);
      const q = async (where: Record<string, unknown>) => titles((await store.list(task, { where, orderBy: { field: "priority", direction: "asc" } })).rows);
      expect(await q({ status: { op: "ne", value: "doing" } })).toEqual(["alpha", "delta"]);
      expect(await q({ status: { op: "in", value: ["todo", "done"] } })).toEqual(["alpha", "delta"]);
      expect(await q({ status: { op: "nin", value: ["todo", "done"] } })).toEqual(["beta", "gamma"]);
      expect(await q({ priority: { op: "lt", value: 3 } })).toEqual(["alpha", "beta"]);
      expect(await q({ priority: { op: "lte", value: 3 } })).toEqual(["alpha", "beta", "gamma"]);
      expect(await q({ priority: { op: "gt", value: 3 } })).toEqual(["delta"]);
      expect(await q({ priority: { op: "gte", value: 3 } })).toEqual(["gamma", "delta"]);
      expect(await q({ note: { op: "contains", value: "WORLD" } })).toEqual(["beta"]);
      expect(await q({ due: { op: "isNull" } })).toEqual(["alpha", "beta"]);
      expect(await q({ due: { op: "isNull", value: false } })).toEqual(["gamma", "delta"]);
      expect(await q({ due: { op: "gte", value: "2026-02-01" } })).toEqual(["delta"]);
      expect(await q({ status: { op: "in", value: [] } })).toEqual([]);
    });

    test("search matches case-insensitively across string fields; total reflects the filter", async () => {
      const store = await make();
      await seed(store);
      const page = await store.list(task, { search: "ALPH" });
      expect(titles(page.rows)).toEqual(["alpha"]);
      expect(page.total).toBe(1);
      expect((await store.list(task, { search: "hello" })).total).toBe(1);
    });

    test("orderBy: single and multi-key, asc/desc, nulls last", async () => {
      const store = await make();
      await seed(store);
      expect(titles((await store.list(task, { orderBy: { field: "priority", direction: "desc" } })).rows)).toEqual(["delta", "gamma", "beta", "alpha"]);
      expect(titles((await store.list(task, { orderBy: { field: "title", direction: "asc" } })).rows)).toEqual(["alpha", "beta", "delta", "gamma"]);
      expect(titles((await store.list(task, { orderBy: [{ field: "status", direction: "asc" }, { field: "priority", direction: "desc" }] })).rows)).toEqual(["gamma", "beta", "delta", "alpha"]);
      expect(titles((await store.list(task, { orderBy: { field: "due", direction: "asc" } })).rows).slice(0, 2)).toEqual(["gamma", "delta"]);
    });

    test("paging: offset/limit slice the ordered result; total is unaffected", async () => {
      const store = await make();
      await seed(store);
      const p1 = await store.list(task, { orderBy: { field: "priority", direction: "asc" }, limit: 2 });
      const p2 = await store.list(task, { orderBy: { field: "priority", direction: "asc" }, limit: 2, offset: 2 });
      expect(titles(p1.rows)).toEqual(["alpha", "beta"]);
      expect(titles(p2.rows)).toEqual(["gamma", "delta"]);
      expect(p1.total).toBe(4);
      expect(p2.total).toBe(4);
    });

    test("default page limit is 50 and total still counts everything", async () => {
      const store = await make();
      for (let i = 0; i < 60; i++) await store.create(task, { title: `t${i}`, priority: i, status: "todo" });
      const page = await store.list(task);
      expect(page.rows).toHaveLength(50);
      expect(page.total).toBe(60);
    });

    test("update applies a partial patch, validates it, and preserves other fields", async () => {
      const store = await make();
      const row = await store.create(task, { title: "a", priority: 1, status: "todo", note: "keep" });
      const updated = await store.update(task, row.id, { status: "done", done: true });
      expect(updated).toEqual({ ...row, status: "done", done: true });
      expect(await store.get(task, row.id)).toEqual(updated);
      await expect(store.update(task, row.id, { priority: 2.5 })).rejects.toBeInstanceOf(StoreValidationError);
      expect((await store.get(task, row.id))!.priority).toBe(1);
    });

    test("update of unknown id rejects with StoreNotFoundError", async () => {
      const store = await make();
      await expect(store.update(task, "missing", { title: "x" })).rejects.toBeInstanceOf(StoreNotFoundError);
    });

    test("remove deletes the row and is idempotent", async () => {
      const store = await make();
      const row = await store.create(task, { title: "a", priority: 1, status: "todo" });
      await store.remove(task, row.id);
      expect(await store.get(task, row.id)).toBeUndefined();
      expect((await store.list(task)).total).toBe(0);
      await expect(store.remove(task, row.id)).resolves.toBeUndefined();
    });

    test("optional fields round-trip as undefined when absent", async () => {
      const store = await make();
      const row = await store.create(task, { title: "a", priority: 1, status: "todo" });
      expect(row.note).toBeUndefined();
      expect((await store.get(task, row.id))!.note).toBeUndefined();
    });

    test("group and repeatable group values round-trip and validate", async () => {
      const store = await make();
      const row = await store.create(task, {
        title: "g",
        priority: 1,
        status: "todo",
        meta: { tag: "x", weight: 2 },
        steps: [{ text: "one" }, { text: "two", ok: true }],
      });
      expect(row.meta).toEqual({ tag: "x", weight: 2 });
      expect(row.steps).toEqual([{ text: "one", ok: false }, { text: "two", ok: true }]);
      expect((await store.get(task, row.id))!.steps).toEqual([{ text: "one", ok: false }, { text: "two", ok: true }]);
      await expect(store.create(task, { title: "bad", priority: 1, status: "todo", meta: { tag: 5 } })).rejects.toBeInstanceOf(StoreValidationError);
      const updated = await store.update(task, row.id, { steps: [] });
      expect(updated.steps).toEqual([]);
    });

    test("relations: dangling ids are refused, include resolves {id,title}, many relations round-trip", async () => {
      const store = await make();
      const p = await store.create(project, { name: "Apollo" });
      await expect(store.create(issue, { title: "x", project: "nope" })).rejects.toBeInstanceOf(StoreReferenceError);
      const i = await store.create(issue, { title: "x", project: p.id, labels: [p.id] });
      expect(i.project).toBe(p.id);
      expect(i.labels).toEqual([p.id]);
      const page = await store.list(issue, { include: ["project"] });
      expect(page.rows[0]!.project).toEqual({ id: p.id, title: "Apollo" });
      expect(titles((await store.list(issue, { where: { project: p.id } })).rows)).toEqual(["x"]);
      await expect(store.update(issue, i.id, { project: "nope" })).rejects.toBeInstanceOf(StoreReferenceError);
    });

    test("relations: removing a referenced row is refused with StoreReferenceError; unreferenced removes", async () => {
      const store = await make();
      const p = await store.create(project, { name: "Apollo" });
      const q = await store.create(project, { name: "Gemini" });
      await store.create(issue, { title: "x", project: p.id });
      await expect(store.remove(project, p.id)).rejects.toBeInstanceOf(StoreReferenceError);
      await expect(store.remove(project, q.id)).resolves.toBeUndefined();
    });

    test("subscribe: create/update/remove emit ordered events with rows; unsubscribe stops delivery", async () => {
      const store = await make();
      const events: ChangeEvent[] = [];
      const stop = store.subscribe(task, (e) => events.push(e));
      const row = await store.create(task, { title: "s", priority: 1, status: "todo" });
      await store.update(task, row.id, { done: true });
      await store.remove(task, row.id);
      await new Promise((r) => setTimeout(r, 50));
      expect(events.map((e) => e.kind)).toEqual(["created", "updated", "removed"]);
      expect(events[0]!.row?.title).toBe("s");
      expect(events[1]!.row?.done).toBe(true);
      expect(events.every((e) => e.entity === task.name && e.id === row.id)).toBe(true);
      expect(events[1]!.seq).toBeGreaterThan(events[0]!.seq);
      stop();
      await store.create(task, { title: "after", priority: 1, status: "todo" });
      await new Promise((r) => setTimeout(r, 50));
      expect(events).toHaveLength(3);
    });

    test("subscribe(null) receives events for every entity", async () => {
      const store = await make();
      const seen: string[] = [];
      const stop = store.subscribe(null, (e) => seen.push(e.entity));
      await store.create(project, { name: "P" });
      await store.create(task, { title: "T", priority: 1, status: "todo" });
      await new Promise((r) => setTimeout(r, 50));
      stop();
      expect(seen).toEqual([project.name, task.name]);
    });
  });
}

export function runStoreConformance(label: string, make: () => Store | Promise<Store>) {
  const prepared = async () => {
    const store = await make();
    for (const e of conformanceEntities) await store.migrate(e);
    return store;
  };
  runClientStoreConformance(label, prepared);

  describe(`Store conformance: ${label}`, () => {
    // Schema evolution: the same entity name with a changed shape against the same store.
    // A memory store passes these trivially; a persistent one must reconcile.
    const v1 = defineEntity({ name: "conformance_evolve", title: "title", fields: [{ name: "title", kind: "string" }] });

    test("migrate is idempotent and additive optional/defaulted fields keep existing rows readable", async () => {
      const store = await make();
      await store.migrate(v1);
      await store.migrate(v1);
      const row = await store.create(v1, { title: "old" });
      const v2 = defineEntity({
        name: "conformance_evolve",
        title: "title",
        fields: [{ name: "title", kind: "string" }, { name: "note", kind: "string", optional: true }, { name: "flag", kind: "boolean", default: true }],
      });
      await store.migrate(v2);
      const page = await store.list(v2);
      expect(page.rows).toHaveLength(1);
      expect(page.rows[0]!.id).toBe(row.id);
      expect(page.rows[0]!.title).toBe("old");
      expect(page.rows[0]!.note).toBeUndefined();
      const created = await store.create(v2, { title: "new", note: "n" });
      expect(created.flag).toBe(true);
      expect(created.note).toBe("n");
    });

    test("migrate rejects a new required field without a default when rows exist, with StoreSchemaError", async () => {
      const store = await make();
      await store.migrate(v1);
      await store.create(v1, { title: "old" });
      const v2 = defineEntity({ name: "conformance_evolve", title: "title", fields: [{ name: "title", kind: "string" }, { name: "must", kind: "number" }] });
      await expect(store.migrate(v2)).rejects.toBeInstanceOf(StoreSchemaError);
    });

    test("migrate accepts a new required field when the table is empty", async () => {
      const store = await make();
      await store.migrate(v1);
      const v2 = defineEntity({ name: "conformance_evolve", title: "title", fields: [{ name: "title", kind: "string" }, { name: "must", kind: "number" }] });
      await store.migrate(v2);
      const row = await store.create(v2, { title: "x", must: 1 });
      expect(row.must).toBe(1);
    });

    test("migrate after removing a field keeps remaining data readable", async () => {
      const store = await make();
      const wide = defineEntity({ name: "conformance_evolve", title: "title", fields: [{ name: "title", kind: "string" }, { name: "extra", kind: "string", optional: true }] });
      await store.migrate(wide);
      const row = await store.create(wide, { title: "keep", extra: "gone" });
      await store.migrate(v1);
      expect((await store.list(v1)).rows).toEqual([{ id: row.id, title: "keep" }]);
    });

    test("migrate refuses a relation to an entity the store has not seen", async () => {
      const store = await make();
      const bad = defineEntity({ name: "conformance_bad", title: "title", fields: [{ name: "title", kind: "string" }, { name: "ref", kind: "relation", to: "conformance_ghost" }] });
      await expect(store.migrate(bad)).rejects.toBeInstanceOf(StoreSchemaError);
    });

    test("scoped: rows are partitioned per workspace; ids do not leak across scopes", async () => {
      const store = await prepared();
      const a = store.scoped({ workspaceId: "a" });
      const b = store.scoped({ workspaceId: "b" });
      const row = await a.create(task, { title: "in-a", priority: 1, status: "todo" });
      expect((await b.list(task)).total).toBe(0);
      expect(await b.get(task, row.id)).toBeUndefined();
      await expect(b.update(task, row.id, { done: true })).rejects.toBeInstanceOf(StoreNotFoundError);
      expect((await a.list(task)).total).toBe(1);
      expect((await store.list(task)).total).toBe(0); // default scope is its own partition
    });

    test("scoped: relation checks and referential integrity stay inside the scope", async () => {
      const store = await prepared();
      const a = store.scoped({ workspaceId: "a" });
      const b = store.scoped({ workspaceId: "b" });
      const p = await a.create(project, { name: "A-proj" });
      await expect(b.create(issue, { title: "x", project: p.id })).rejects.toBeInstanceOf(StoreReferenceError);
      await a.create(issue, { title: "x", project: p.id });
      await expect(a.remove(project, p.id)).rejects.toBeInstanceOf(StoreReferenceError);
    });
  });
}

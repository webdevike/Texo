// Adapter-agnostic behavioral suite. Every Store adapter must pass it unchanged.
// Usage in an adapter's test file:
//   runStoreConformance("sqlite", () => createSqliteStore(":memory:"))
import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { defineEntity } from "./entity";
import { type Store, StoreNotFoundError, StoreSchemaError, StoreValidationError } from "./store";

const task = defineEntity({
  name: "conformance_task",
  title: "title",
  fields: {
    title: z.string().min(1),
    done: z.boolean().default(false),
    priority: z.number().int(),
    status: z.enum(["todo", "doing", "done"]),
    note: z.string().optional(),
  },
});

export function runStoreConformance(label: string, make: () => Store | Promise<Store>) {
  describe(`Store conformance: ${label}`, () => {
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
      await expect(store.create(task, { title: "x", priority: 1, status: "nope" as never })).rejects.toBeInstanceOf(StoreValidationError);
      expect(await store.list(task)).toEqual([]);
    });

    test("get returns the created row, undefined for unknown id", async () => {
      const store = await make();
      const row = await store.create(task, { title: "a", priority: 1, status: "todo", note: "n" });
      expect(await store.get(task, row.id)).toEqual(row);
      expect(await store.get(task, "missing")).toBeUndefined();
    });

    test("list reflects creates, ids are unique", async () => {
      const store = await make();
      const a = await store.create(task, { title: "a", priority: 1, status: "todo" });
      const b = await store.create(task, { title: "b", priority: 2, status: "doing" });
      const rows = await store.list(task);
      expect(rows).toHaveLength(2);
      expect(new Set(rows.map((r) => r.id)).size).toBe(2);
      expect(rows.map((r) => r.title).sort()).toEqual(["a", "b"]);
      expect(a.id).not.toBe(b.id);
    });

    test("list where filters by equality across keys (boolean and enum included)", async () => {
      const store = await make();
      await store.create(task, { title: "a", priority: 1, status: "todo" });
      await store.create(task, { title: "b", priority: 1, status: "doing", done: true });
      await store.create(task, { title: "c", priority: 2, status: "doing", done: true });
      expect((await store.list(task, { where: { status: "doing" } })).map((r) => r.title).sort()).toEqual(["b", "c"]);
      expect((await store.list(task, { where: { status: "doing", priority: 1 } })).map((r) => r.title)).toEqual(["b"]);
      expect((await store.list(task, { where: { done: false } })).map((r) => r.title)).toEqual(["a"]);
    });

    test("list orderBy sorts asc and desc on number and string fields", async () => {
      const store = await make();
      await store.create(task, { title: "b", priority: 2, status: "todo" });
      await store.create(task, { title: "c", priority: 1, status: "todo" });
      await store.create(task, { title: "a", priority: 3, status: "todo" });
      expect((await store.list(task, { orderBy: { field: "priority", direction: "asc" } })).map((r) => r.priority)).toEqual([1, 2, 3]);
      expect((await store.list(task, { orderBy: { field: "priority", direction: "desc" } })).map((r) => r.priority)).toEqual([3, 2, 1]);
      expect((await store.list(task, { orderBy: { field: "title", direction: "asc" } })).map((r) => r.title)).toEqual(["a", "b", "c"]);
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
      expect(await store.list(task)).toEqual([]);
      await expect(store.remove(task, row.id)).resolves.toBeUndefined();
    });

    test("optional fields round-trip as undefined when absent", async () => {
      const store = await make();
      const row = await store.create(task, { title: "a", priority: 1, status: "todo" });
      expect(row.note).toBeUndefined();
      expect((await store.get(task, row.id))!.note).toBeUndefined();
    });
    // Schema evolution: the same entity name with a changed shape against the same store.
    // A memory store passes these trivially; a persistent one must reconcile.
    const v1 = defineEntity({ name: "conformance_evolve", title: "title", fields: { title: z.string() } });

    test("migrate is idempotent and additive optional/defaulted fields keep existing rows readable", async () => {
      const store = await make();
      await store.migrate(v1);
      await store.migrate(v1);
      const row = await store.create(v1, { title: "old" });
      const v2 = defineEntity({
        name: "conformance_evolve",
        title: "title",
        fields: { title: z.string(), note: z.string().optional(), flag: z.boolean().default(true) },
      });
      await store.migrate(v2);
      const rows = await store.list(v2);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.id).toBe(row.id);
      expect(rows[0]!.title).toBe("old");
      expect(rows[0]!.note).toBeUndefined();
      const created = await store.create(v2, { title: "new", note: "n" });
      expect(created.flag).toBe(true);
      expect(created.note).toBe("n");
    });

    test("migrate rejects a new required field without a default when rows exist, with StoreSchemaError", async () => {
      const store = await make();
      await store.migrate(v1);
      await store.create(v1, { title: "old" });
      const v2 = defineEntity({ name: "conformance_evolve", title: "title", fields: { title: z.string(), must: z.number() } });
      await expect(store.migrate(v2)).rejects.toBeInstanceOf(StoreSchemaError);
    });
  });
}

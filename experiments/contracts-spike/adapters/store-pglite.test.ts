import { afterAll, describe, expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { defineEntity } from "../contracts/entity";
import { runStoreConformance } from "../contracts/store.conformance";
import { StoreSchemaError } from "../contracts/store";
import { createPgliteStore } from "./store-pglite";

// One in-memory Postgres for the file (a PGlite boot is ~1s); every store gets its own schema so
// tests never share tables. Fresh instance per test would be the same contract, only slower.
const db = new PGlite();
let n = 0;
const fresh = () => createPgliteStore(db, { schema: `t${++n}` });
afterAll(() => db.close());

runStoreConformance("pglite", fresh);

describe("pglite specifics", () => {
  test("retyping a column is refused with StoreSchemaError", async () => {
    const store = fresh();
    await store.migrate(defineEntity({ name: "retype", title: "title", fields: [{ name: "title", kind: "string" }, { name: "n", kind: "number", optional: true }] }));
    const flipped = defineEntity({ name: "retype", title: "title", fields: [{ name: "title", kind: "string" }, { name: "n", kind: "string", optional: true }] });
    await expect(store.migrate(flipped)).rejects.toBeInstanceOf(StoreSchemaError);
  });

  test("tables use real Postgres column types", async () => {
    const store = fresh();
    const e = defineEntity({
      name: "typed",
      title: "title",
      fields: [
        { name: "title", kind: "string" },
        { name: "n", kind: "number" },
        { name: "b", kind: "boolean", default: false },
        { name: "g", kind: "group", optional: true, fields: [{ name: "x", kind: "string" }] },
        { name: "one", kind: "relation", to: "typed", optional: true },
        { name: "many", kind: "relation", to: "typed", many: true, optional: true },
      ],
    });
    await store.migrate(e);
    const cols = await db.query<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'typed' ORDER BY ordinal_position`,
      [`t${n}`],
    );
    expect(Object.fromEntries(cols.rows.map((c) => [c.column_name, c.data_type]))).toEqual({
      id: "text",
      _ws: "text",
      title: "text",
      n: "double precision",
      b: "boolean",
      g: "jsonb",
      one: "text",
      many: "jsonb",
    });
  });

  test("a persisted directory survives a reopen", async () => {
    const dir = `${import.meta.dir}/../.tmp-pglite-${process.pid}`;
    const e = defineEntity({ name: "durable", title: "title", fields: [{ name: "title", kind: "string" }] });
    const first = new PGlite(dir);
    const a = createPgliteStore(first);
    await a.migrate(e);
    const row = await a.create(e, { title: "kept" });
    await first.close();
    const second = new PGlite(dir);
    const b = createPgliteStore(second);
    await b.migrate(e);
    expect((await b.list(e)).rows).toEqual([row]);
    await second.close();
    await Bun.$`rm -rf ${dir}`.quiet();
  });
});

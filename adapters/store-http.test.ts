// The http proxy over the sqlite store must pass the same suite: transport adds no semantics.
import { afterAll } from "bun:test";
import { z } from "zod";
import { defineEntity } from "../contracts/entity";
import { runStoreConformance } from "../contracts/store.conformance";
import { createHttpStore, storeHandler } from "./store-http";
import { createSqliteStore } from "./store-sqlite";

// The conformance suite's entity, redeclared so the server knows it. Same shape as the suite's.
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

let store = createSqliteStore(":memory:");
const server = Bun.serve({ port: 0, fetch: (req) => storeHandler(store, { [task.name]: task })(req) });
afterAll(() => server.stop());

runStoreConformance("http→sqlite", () => {
  store = createSqliteStore(":memory:"); // fresh backing store per test
  return createHttpStore(`http://localhost:${server.port}`);
});

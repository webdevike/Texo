// The http proxy over the sqlite store must pass the ClientStore suite: transport adds no semantics.
import { afterAll } from "bun:test";
import { conformanceTask, runClientStoreConformance } from "../contracts/store.conformance";
import { createHttpStore, storeHandler } from "./store-http";
import { createSqliteStore } from "./store-sqlite";

let store = createSqliteStore(":memory:");
const server = Bun.serve({ port: 0, fetch: (req) => storeHandler(store, (name) => (name === conformanceTask.name ? conformanceTask : undefined))(req) });
afterAll(() => server.stop());

runClientStoreConformance("http→sqlite", () => {
  store = createSqliteStore(":memory:"); // fresh backing store per test
  return createHttpStore(`http://localhost:${server.port}`);
});

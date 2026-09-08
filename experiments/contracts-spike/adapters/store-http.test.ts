// The http proxy over the sqlite store must pass the ClientStore suite: transport adds no semantics.
// SSE under bun:test uses undici's EventSource polyfill via `eventsource` if global is missing.
import { afterAll } from "bun:test";
import { conformanceEntities, runClientStoreConformance } from "../contracts/store.conformance";
import { createHttpStore, storeHandler } from "./store-http";
import { createSqliteStore } from "./store-sqlite";

let store = createSqliteStore(":memory:");
const server = Bun.serve({
  port: 0,
  fetch: (req) => storeHandler(() => store, (name) => conformanceEntities.find((e) => e.name === name))(req),
});
afterAll(() => server.stop(true));

runClientStoreConformance("http→sqlite", async () => {
  store = createSqliteStore(":memory:"); // fresh backing store per test
  for (const e of conformanceEntities) await store.migrate(e);
  return createHttpStore(`http://localhost:${server.port}`);
});

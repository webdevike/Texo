import { runStoreConformance } from "../contracts/store.conformance";
import { createMemoryStore } from "./store-memory";
import { createSqliteStore } from "./store-sqlite";

runStoreConformance("sqlite", () => createSqliteStore(":memory:"));
runStoreConformance("memory", () => createMemoryStore());

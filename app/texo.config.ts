// The only place adapters are chosen. Server side.
import { createSqliteStore } from "../adapters/store-sqlite";
import { entities as registry } from "./entities";

export const entities = Object.fromEntries(registry.map((e) => [e.name, e]));
export const store = createSqliteStore("app/data.sqlite");

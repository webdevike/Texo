// The only place adapters are chosen. Server side.
import { createSqliteStore } from "../adapters/store-sqlite";

export const store = createSqliteStore("app/data.sqlite");
export const specsDir = "app/entities";

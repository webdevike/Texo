// The only place adapters are chosen. Server side.
import { createSqliteStore } from "../adapters/store-sqlite";
import { issue } from "./entities/issue";

export const entities = { [issue.name]: issue };
export const store = createSqliteStore("app/data.sqlite");

// Store adapter: PGlite (in-process Postgres in WASM). Table per entity inside one Postgres
// schema, columns derived from the spec with real Postgres types (text, double precision,
// boolean, jsonb for group/many-relation). Operators/search/paging pushed to SQL, ILIKE for
// case-insensitive matching, native NULLS LAST, `_ws` column for workspace scoping, referential
// integrity by query (jsonb containment for many-relations), subscribe via the shared change bus
// (own writes only). Group/many-relation values are jsonb and not queryable.
//
// `createPgliteStore()`            in-memory Postgres (fresh per call)
// `createPgliteStore("dir")`       persisted to a directory
// `createPgliteStore(db, { schema })`  share one PGlite, isolate by schema (tests)
import { PGlite } from "@electric-sql/pglite";
import { type Entity, type FieldSpec, fieldIsAdditive, fieldIsQueryable, type Input, type Row } from "../contracts/entity";
import {
  type ChangeBus,
  conditionOf,
  createChangeBus,
  DEFAULT_SCOPE,
  type ListQuery,
  orderOf,
  type Scope,
  type Store,
  StoreNotFoundError,
  StoreReferenceError,
  StoreSchemaError,
  validate,
} from "../contracts/store";
import { DEFAULT_LIMIT, searchable } from "./query";

/** Postgres type per field, as `information_schema.columns.data_type` reports it back. */
function columnType(f: FieldSpec): string {
  switch (f.kind) {
    case "number":
      return "double precision";
    case "boolean":
      return "boolean";
    case "group":
      return "jsonb";
    case "relation":
      return f.many ? "jsonb" : "text";
    default:
      return "text";
  }
}

function toDb(field: FieldSpec, value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (field.kind === "group" || (field.kind === "relation" && field.many === true)) return JSON.stringify(value);
  return value;
}

function fromDb(entity: Entity, raw: Record<string, unknown>): Row {
  const row: Row = { id: String(raw.id) };
  for (const f of entity.fields) {
    const v = raw[f.name];
    if (v === null || v === undefined) continue; // absent optional: leave undefined
    row[f.name] = v;
  }
  return row;
}

const NAME = /^_?[a-z][a-z0-9_]*$/;
const q = (ident: string) => `"${ident}"`;

interface Shared {
  db: Promise<PGlite>;
  schema: string;
  ready: Set<string>;
  known: Map<string, Entity>;
  bus: ChangeBus;
  label: string;
}

export interface PgliteStoreOptions {
  /** Postgres schema that owns the entity tables. Default "public". */
  schema?: string;
}

export function createPgliteStore(target: string | PGlite = "memory://", options: PgliteStoreOptions = {}): Store {
  const schema = options.schema ?? "public";
  if (!NAME.test(schema)) throw new Error(`pglite: schema "${schema}" must be lowercase snake_case`);
  const instance = typeof target === "string" ? new PGlite(target) : target;
  const db = instance.waitReady.then(async () => {
    if (schema !== "public") await instance.exec(`CREATE SCHEMA IF NOT EXISTS ${q(schema)}`);
    return instance;
  });
  const label = typeof target === "string" ? target : (target.dataDir ?? "memory://");
  return bind({ db, schema, ready: new Set(), known: new Map(), bus: createChangeBus(), label }, DEFAULT_SCOPE);
}

function bind(shared: Shared, scope: Scope): Store {
  const { ready, known, bus, schema } = shared;
  const signature = (entity: Entity) => `${entity.name}:${entity.fields.map((f) => `${f.name}/${columnType(f)}`).join(",")}`;
  const ws = scope.workspaceId;
  const table = (name: string) => `${q(schema)}.${q(name)}`;

  const run = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> => {
    const db = await shared.db;
    return (await db.query<T>(sql, params)).rows;
  };
  const one = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | undefined> => (await run<T>(sql, params))[0];

  async function ensure(entity: Entity): Promise<void> {
    known.set(entity.name, entity);
    if (ready.has(signature(entity))) return;
    const cols = entity.fields.map((f) => `${q(f.name)} ${columnType(f)}`).join(", ");
    await run(`CREATE TABLE IF NOT EXISTS ${table(entity.name)} (id text PRIMARY KEY, _ws text NOT NULL DEFAULT 'default'${cols ? `, ${cols}` : ""})`);
    const existing = await run<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
      [schema, entity.name],
    );
    const byName = Object.fromEntries(existing.map((c) => [c.column_name, c.data_type]));
    if (byName._ws === undefined) await run(`ALTER TABLE ${table(entity.name)} ADD COLUMN _ws text NOT NULL DEFAULT 'default'`);
    const hasRows = (await one(`SELECT 1 AS x FROM ${table(entity.name)} LIMIT 1`)) !== undefined;
    for (const f of entity.fields) {
      const want = columnType(f);
      const have = byName[f.name];
      if (have === undefined) {
        if (hasRows && !fieldIsAdditive(f)) {
          throw new StoreSchemaError(entity.name, `new required field "${f.name}" has no default; existing rows cannot satisfy it`);
        }
        await run(`ALTER TABLE ${table(entity.name)} ADD COLUMN ${q(f.name)} ${want}`);
      } else if (have !== want) {
        throw new StoreSchemaError(entity.name, `field "${f.name}" is ${have} in storage but the entity declares ${f.kind} (${want}); retyping is not automatic`);
      }
    }
    await run(`CREATE INDEX IF NOT EXISTS ${q(`${entity.name}__ws`)} ON ${table(entity.name)} (_ws)`);
    // Columns no longer in the entity are left in place: reads ignore them, nothing is destroyed.
    ready.add(signature(entity));
  }

  function fieldOf(entity: Entity, name: string): FieldSpec {
    const f = entity.fields.find((f) => f.name === name);
    if (!f) throw new Error(`${entity.name}: unknown field "${name}"`);
    return f;
  }

  const get = async (entity: Entity, id: string): Promise<Row | undefined> => {
    const raw = await one(`SELECT * FROM ${table(entity.name)} WHERE id = $1 AND _ws = $2`, [id, ws]);
    return raw ? fromDb(entity, raw) : undefined;
  };

  async function checkReferences(entity: Entity, data: Record<string, unknown>): Promise<void> {
    for (const f of entity.fields) {
      if (f.kind !== "relation") continue;
      const v = data[f.name];
      if (v === undefined || v === null) continue;
      const target = known.get(f.to);
      if (!target) throw new StoreSchemaError(entity.name, `relation "${f.name}" targets unknown entity "${f.to}"`);
      await ensure(target);
      for (const id of Array.isArray(v) ? v : [v]) {
        const hit = await one(`SELECT 1 AS x FROM ${table(target.name)} WHERE id = $1 AND _ws = $2`, [String(id), ws]);
        if (!hit) throw new StoreReferenceError(entity.name, `${f.name} references missing ${f.to} ${id}`);
      }
    }
  }

  async function referencedBy(entity: Entity, id: string): Promise<string | undefined> {
    for (const other of known.values()) {
      for (const f of other.fields) {
        if (f.kind !== "relation" || f.to !== entity.name) continue;
        await ensure(other);
        const hit = f.many
          ? await one<{ id: string }>(`SELECT id FROM ${table(other.name)} WHERE _ws = $1 AND ${q(f.name)} @> $2::jsonb LIMIT 1`, [ws, JSON.stringify([id])])
          : await one<{ id: string }>(`SELECT id FROM ${table(other.name)} WHERE _ws = $1 AND ${q(f.name)} = $2 LIMIT 1`, [ws, id]);
        if (hit) return `${other.name}.${f.name} (${hit.id})`;
      }
    }
    return undefined;
  }

  async function include(entity: Entity, rows: Row[], fields: string[] | undefined): Promise<Row[]> {
    if (!fields?.length || !rows.length) return rows;
    const out = rows.map((r) => ({ ...r }));
    for (const name of fields) {
      const f = entity.fields.find((x) => x.name === name);
      if (!f || f.kind !== "relation" || f.many) continue;
      const target = known.get(f.to);
      if (!target) continue;
      await ensure(target);
      const ids = [...new Set(rows.map((r) => r[name]).filter((v): v is string => typeof v === "string"))];
      if (!ids.length) continue;
      const hits = await run<{ id: string; title: unknown }>(
        `SELECT id, ${q(target.title)} AS title FROM ${table(target.name)} WHERE _ws = $1 AND id IN (${ids.map((_, i) => `$${i + 2}`).join(", ")})`,
        [ws, ...ids],
      );
      const titles = new Map(hits.map((h) => [h.id, h.title]));
      for (const row of out) {
        const id = row[name];
        if (typeof id === "string") row[name] = { id, title: titles.get(id) };
      }
    }
    return out;
  }

  function compile(entity: Entity, query: ListQuery): { where: string; params: unknown[] } {
    const params: unknown[] = [ws];
    const clauses = ["_ws = $1"];
    const param = (value: unknown) => {
      params.push(value);
      return `$${params.length}`;
    };
    for (const [k, raw] of Object.entries(query.where ?? {})) {
      if (raw === undefined) continue;
      const f = k === "id" ? undefined : fieldOf(entity, k);
      if (f && !fieldIsQueryable(f)) throw new Error(`${entity.name}: field "${k}" is not queryable`);
      const col = q(k);
      const { op, value } = conditionOf(raw);
      const v = (x: unknown) => (f ? toDb(f, x) : x);
      switch (op) {
        case "eq":
          clauses.push(`${col} = ${param(v(value))}`);
          break;
        case "ne":
          clauses.push(`(${col} IS NULL OR ${col} <> ${param(v(value))})`);
          break;
        case "in":
        case "nin": {
          const list = Array.isArray(value) ? value : [];
          if (list.length === 0) {
            clauses.push(op === "in" ? "false" : "true");
            break;
          }
          clauses.push(`${col} ${op === "nin" ? "NOT IN" : "IN"} (${list.map((x) => param(v(x))).join(", ")})`);
          break;
        }
        case "lt":
        case "lte":
        case "gt":
        case "gte": {
          const sym = { lt: "<", lte: "<=", gt: ">", gte: ">=" }[op];
          clauses.push(`${col} ${sym} ${param(v(value))}`);
          break;
        }
        case "contains":
          clauses.push(`${col}::text ILIKE ${param(`%${String(value)}%`)}`);
          break;
        case "isNull":
          clauses.push(value === undefined || value ? `${col} IS NULL` : `${col} IS NOT NULL`);
          break;
      }
    }
    if (query.search) {
      const fields = searchable(entity);
      if (fields.length) {
        const pattern = param(`%${query.search}%`);
        clauses.push(`(${fields.map((f) => `${q(f)} ILIKE ${pattern}`).join(" OR ")})`);
      }
    }
    return { where: ` WHERE ${clauses.join(" AND ")}`, params };
  }

  return {
    kind: `pglite (${shared.label}${schema === "public" ? "" : `, schema ${schema}`})`,

    scoped: (next) => bind(shared, next),
    subscribe: (entity, fn) => bus.subscribe(entity, fn),

    async migrate(entity) {
      for (const f of entity.fields) {
        if (f.kind === "relation" && f.to !== entity.name && !known.has(f.to)) {
          throw new StoreSchemaError(entity.name, `relation "${f.name}" targets unknown entity "${f.to}"`);
        }
      }
      await ensure(entity);
    },

    async list(entity, query: ListQuery = {}) {
      await ensure(entity);
      const { where, params } = compile(entity, query);
      const order = orderOf(query);
      for (const o of order) if (o.field !== "id" && !fieldIsQueryable(fieldOf(entity, o.field))) throw new Error(`${entity.name}: field "${o.field}" is not sortable`);
      const orderSql = order.length ? ` ORDER BY ${order.map((o) => `${q(o.field)} ${o.direction === "desc" ? "DESC" : "ASC"} NULLS LAST`).join(", ")}` : "";
      const limit = query.limit ?? DEFAULT_LIMIT;
      const offset = query.offset ?? 0;
      const count = await one<{ n: number }>(`SELECT COUNT(*)::int AS n FROM ${table(entity.name)}${where}`, params);
      const raw = await run(`SELECT * FROM ${table(entity.name)}${where}${orderSql} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
      return { rows: await include(entity, raw.map((r) => fromDb(entity, r)), query.include), total: count?.n ?? 0 };
    },

    async get(entity, id) {
      await ensure(entity);
      return get(entity, id);
    },

    async create(entity, input: Input) {
      await ensure(entity);
      const data = validate(entity, input);
      await checkReferences(entity, data);
      const id = crypto.randomUUID();
      const names = ["id", "_ws", ...entity.fields.map((f) => q(f.name))];
      const values = [id, ws, ...entity.fields.map((f) => toDb(f, data[f.name]))];
      await run(`INSERT INTO ${table(entity.name)} (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")})`, values);
      const row = (await get(entity, id))!;
      bus.emit({ entity: entity.name, kind: "created", id, row, origin: scope.actorId });
      return row;
    },

    async update(entity, id, patch: Input) {
      await ensure(entity);
      const data = validate(entity, patch, true);
      if (!(await get(entity, id))) throw new StoreNotFoundError(entity.name, id);
      await checkReferences(entity, data);
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      if (keys.length) {
        const sets = keys.map((k, i) => `${q(k)} = $${i + 1}`).join(", ");
        const values = keys.map((k) => toDb(fieldOf(entity, k), data[k]));
        await run(`UPDATE ${table(entity.name)} SET ${sets} WHERE id = $${keys.length + 1} AND _ws = $${keys.length + 2}`, [...values, id, ws]);
      }
      const row = (await get(entity, id))!;
      bus.emit({ entity: entity.name, kind: "updated", id, row, origin: scope.actorId });
      return row;
    },

    async remove(entity, id) {
      await ensure(entity);
      if (!(await get(entity, id))) return;
      const ref = await referencedBy(entity, id);
      if (ref) throw new StoreReferenceError(entity.name, `${id} is referenced by ${ref}`);
      await run(`DELETE FROM ${table(entity.name)} WHERE id = $1 AND _ws = $2`, [id, ws]);
      bus.emit({ entity: entity.name, kind: "removed", id, origin: scope.actorId });
    },
  };
}

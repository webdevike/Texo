// Reference Store adapter: bun:sqlite. Table per entity, columns derived from the spec.
// Frozen surface: operators/search/paging pushed to SQL, include via lookup, subscribe via the
// shared change bus (own writes only), referential integrity by query, workspace scoping via a
// `_ws` column on every table. Group/many-relation values are JSON TEXT and not queryable.
import { Database } from "bun:sqlite";
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

const columnType: Record<FieldSpec["kind"], string> = {
  string: "TEXT",
  number: "REAL",
  boolean: "INTEGER",
  enum: "TEXT",
  date: "TEXT",
  relation: "TEXT",
  group: "TEXT",
};

const isJson = (f: FieldSpec) => f.kind === "group" || (f.kind === "relation" && f.many === true);

function toDb(field: FieldSpec, value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (field.kind === "boolean") return value ? 1 : 0;
  if (isJson(field)) return JSON.stringify(value);
  return value;
}

function fromDb(entity: Entity, raw: Record<string, unknown>): Row {
  const row: Row = { id: String(raw.id) };
  for (const f of entity.fields) {
    const v = raw[f.name];
    if (v === null || v === undefined) continue; // absent optional: leave undefined
    row[f.name] = f.kind === "boolean" ? v === 1 : isJson(f) ? JSON.parse(String(v)) : v;
  }
  return row;
}

interface Shared {
  db: Database;
  ready: Set<string>;
  known: Map<string, Entity>;
  bus: ChangeBus;
  path: string;
}

export function createSqliteStore(path = ":memory:"): Store {
  return bind({ db: new Database(path), ready: new Set(), known: new Map(), bus: createChangeBus(), path }, DEFAULT_SCOPE);
}

function bind(shared: Shared, scope: Scope): Store {
  const { db, ready, known, bus } = shared;
  const signature = (entity: Entity) => `${entity.name}:${entity.fields.map((f) => `${f.name}/${f.kind}`).join(",")}`;
  const ws = scope.workspaceId;

  function ensure(entity: Entity) {
    known.set(entity.name, entity);
    if (ready.has(signature(entity))) return;
    const cols = entity.fields.map((f) => `"${f.name}" ${columnType[f.kind]}`).join(", ");
    db.run(`CREATE TABLE IF NOT EXISTS "${entity.name}" (id TEXT PRIMARY KEY, _ws TEXT NOT NULL DEFAULT 'default'${cols ? `, ${cols}` : ""})`);
    const existing = db.prepare(`PRAGMA table_info("${entity.name}")`).all() as { name: string; type: string }[];
    const byName = Object.fromEntries(existing.map((c) => [c.name, c.type]));
    if (byName._ws === undefined) db.run(`ALTER TABLE "${entity.name}" ADD COLUMN _ws TEXT NOT NULL DEFAULT 'default'`);
    const hasRows = (db.prepare(`SELECT 1 FROM "${entity.name}" LIMIT 1`).get() ?? null) !== null;
    for (const f of entity.fields) {
      const have = byName[f.name];
      if (have === undefined) {
        if (hasRows && !fieldIsAdditive(f)) {
          throw new StoreSchemaError(entity.name, `new required field "${f.name}" has no default; existing rows cannot satisfy it`);
        }
        db.run(`ALTER TABLE "${entity.name}" ADD COLUMN "${f.name}" ${columnType[f.kind]}`);
      } else if (have !== columnType[f.kind]) {
        throw new StoreSchemaError(entity.name, `field "${f.name}" is ${have} in storage but the entity declares ${f.kind} (${columnType[f.kind]}); retyping is not automatic`);
      }
    }
    db.run(`CREATE INDEX IF NOT EXISTS "${entity.name}__ws" ON "${entity.name}" (_ws)`);
    // Columns no longer in the entity are left in place: reads ignore them, nothing is destroyed.
    ready.add(signature(entity));
  }

  function fieldOf(entity: Entity, name: string): FieldSpec {
    const f = entity.fields.find((f) => f.name === name);
    if (!f) throw new Error(`${entity.name}: unknown field "${name}"`);
    return f;
  }

  const get = (entity: Entity, id: string): Row | undefined => {
    const raw = db.prepare(`SELECT * FROM "${entity.name}" WHERE id = ? AND _ws = ?`).get(id, ws) as Record<string, unknown> | null;
    return raw ? fromDb(entity, raw) : undefined;
  };

  function checkReferences(entity: Entity, data: Record<string, unknown>) {
    for (const f of entity.fields) {
      if (f.kind !== "relation") continue;
      const v = data[f.name];
      if (v === undefined || v === null) continue;
      const target = known.get(f.to);
      if (!target) throw new StoreSchemaError(entity.name, `relation "${f.name}" targets unknown entity "${f.to}"`);
      ensure(target);
      for (const id of Array.isArray(v) ? v : [v]) {
        const hit = db.prepare(`SELECT 1 FROM "${target.name}" WHERE id = ? AND _ws = ?`).get(String(id), ws);
        if (!hit) throw new StoreReferenceError(entity.name, `${f.name} references missing ${f.to} ${id}`);
      }
    }
  }

  function referencedBy(entity: Entity, id: string): string | undefined {
    for (const other of known.values()) {
      for (const f of other.fields) {
        if (f.kind !== "relation" || f.to !== entity.name) continue;
        ensure(other);
        const hit = f.many
          ? (db.prepare(`SELECT id FROM "${other.name}" WHERE _ws = ? AND "${f.name}" LIKE ?`).get(ws, `%"${id}"%`) as { id: string } | null)
          : (db.prepare(`SELECT id FROM "${other.name}" WHERE _ws = ? AND "${f.name}" = ?`).get(ws, id) as { id: string } | null);
        if (hit) return `${other.name}.${f.name} (${hit.id})`;
      }
    }
    return undefined;
  }

  function include(entity: Entity, rows: Row[], fields: string[] | undefined): Row[] {
    if (!fields?.length) return rows;
    return rows.map((row) => {
      const out = { ...row };
      for (const name of fields) {
        const f = entity.fields.find((x) => x.name === name);
        if (!f || f.kind !== "relation" || f.many) continue;
        const target = known.get(f.to);
        const id = row[name];
        if (!target || typeof id !== "string") continue;
        ensure(target);
        const t = db.prepare(`SELECT "${target.title}" AS title FROM "${target.name}" WHERE id = ? AND _ws = ?`).get(id, ws) as { title: unknown } | null;
        out[name] = { id, title: t?.title };
      }
      return out;
    });
  }

  function compile(entity: Entity, query: ListQuery): { where: string; params: unknown[] } {
    const clauses = ["_ws = ?"];
    const params: unknown[] = [ws];
    for (const [k, raw] of Object.entries(query.where ?? {})) {
      if (raw === undefined) continue;
      const f = k === "id" ? undefined : fieldOf(entity, k);
      if (f && !fieldIsQueryable(f)) throw new Error(`${entity.name}: field "${k}" is not queryable`);
      const col = `"${k}"`;
      const { op, value } = conditionOf(raw);
      const v = (x: unknown) => (f ? toDb(f, x) : x);
      switch (op) {
        case "eq":
          clauses.push(`${col} = ?`);
          params.push(v(value));
          break;
        case "ne":
          clauses.push(`(${col} IS NULL OR ${col} != ?)`);
          params.push(v(value));
          break;
        case "in":
        case "nin": {
          const list = Array.isArray(value) ? value : [];
          if (list.length === 0) {
            clauses.push(op === "in" ? "0" : "1");
            break;
          }
          clauses.push(`${col} ${op === "nin" ? "NOT IN" : "IN"} (${list.map(() => "?").join(", ")})`);
          params.push(...list.map(v));
          break;
        }
        case "lt":
        case "lte":
        case "gt":
        case "gte": {
          const sym = { lt: "<", lte: "<=", gt: ">", gte: ">=" }[op];
          clauses.push(`${col} ${sym} ?`);
          params.push(v(value));
          break;
        }
        case "contains":
          clauses.push(`${col} LIKE ? COLLATE NOCASE`);
          params.push(`%${String(value)}%`);
          break;
        case "isNull":
          clauses.push(value === undefined || value ? `${col} IS NULL` : `${col} IS NOT NULL`);
          break;
      }
    }
    if (query.search) {
      const fields = searchable(entity);
      if (fields.length) {
        clauses.push(`(${fields.map((f) => `"${f}" LIKE ? COLLATE NOCASE`).join(" OR ")})`);
        params.push(...fields.map(() => `%${query.search}%`));
      }
    }
    return { where: ` WHERE ${clauses.join(" AND ")}`, params };
  }

  return {
    kind: `sqlite (${shared.path})`,

    scoped: (next) => bind(shared, next),
    subscribe: (entity, fn) => bus.subscribe(entity, fn),

    async migrate(entity) {
      for (const f of entity.fields) {
        if (f.kind === "relation" && f.to !== entity.name && !known.has(f.to)) {
          throw new StoreSchemaError(entity.name, `relation "${f.name}" targets unknown entity "${f.to}"`);
        }
      }
      ensure(entity);
    },

    async list(entity, query: ListQuery = {}) {
      ensure(entity);
      const { where, params } = compile(entity, query);
      const order = orderOf(query);
      for (const o of order) if (o.field !== "id" && !fieldIsQueryable(fieldOf(entity, o.field))) throw new Error(`${entity.name}: field "${o.field}" is not sortable`);
      const orderSql = order.length ? ` ORDER BY ${order.map((o) => `"${o.field}" ${o.direction === "desc" ? "DESC" : "ASC"} NULLS LAST`).join(", ")}` : "";
      const limit = query.limit ?? DEFAULT_LIMIT;
      const offset = query.offset ?? 0;
      const total = (db.prepare(`SELECT COUNT(*) AS n FROM "${entity.name}"${where}`).get(...(params as never[])) as { n: number }).n;
      const rows = db.prepare(`SELECT * FROM "${entity.name}"${where}${orderSql} LIMIT ? OFFSET ?`).all(...(params as never[]), limit, offset) as Record<string, unknown>[];
      return { rows: include(entity, rows.map((r) => fromDb(entity, r)), query.include), total };
    },

    async get(entity, id) {
      ensure(entity);
      return get(entity, id);
    },

    async create(entity, input: Input) {
      ensure(entity);
      const data = validate(entity, input);
      checkReferences(entity, data);
      const id = crypto.randomUUID();
      const names = ["id", "_ws", ...entity.fields.map((f) => `"${f.name}"`)];
      const values = [id, ws, ...entity.fields.map((f) => toDb(f, data[f.name]))];
      db.run(`INSERT INTO "${entity.name}" (${names.join(", ")}) VALUES (${names.map(() => "?").join(", ")})`, values as never[]);
      const row = get(entity, id)!;
      bus.emit({ entity: entity.name, kind: "created", id, row, origin: scope.actorId });
      return row;
    },

    async update(entity, id, patch: Input) {
      ensure(entity);
      const data = validate(entity, patch, true);
      if (!get(entity, id)) throw new StoreNotFoundError(entity.name, id);
      checkReferences(entity, data);
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      if (keys.length) {
        const sets = keys.map((k) => `"${k}" = ?`).join(", ");
        const values = keys.map((k) => toDb(fieldOf(entity, k), data[k]));
        db.run(`UPDATE "${entity.name}" SET ${sets} WHERE id = ? AND _ws = ?`, [...values, id, ws] as never[]);
      }
      const row = get(entity, id)!;
      bus.emit({ entity: entity.name, kind: "updated", id, row, origin: scope.actorId });
      return row;
    },

    async remove(entity, id) {
      ensure(entity);
      if (!get(entity, id)) return;
      const ref = referencedBy(entity, id);
      if (ref) throw new StoreReferenceError(entity.name, `${id} is referenced by ${ref}`);
      db.run(`DELETE FROM "${entity.name}" WHERE id = ? AND _ws = ?`, [id, ws]);
      bus.emit({ entity: entity.name, kind: "removed", id, origin: scope.actorId });
    },
  };
}

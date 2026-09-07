// Reference Store adapter: bun:sqlite. Table per entity, columns derived from the spec.
import { Database } from "bun:sqlite";
import { type Entity, type FieldSpec, fieldIsAdditive, type Input, type Row } from "../contracts/entity";
import { type ListQuery, type Store, StoreNotFoundError, StoreSchemaError, validate } from "../contracts/store";

const columnType: Record<FieldSpec["kind"], string> = { string: "TEXT", number: "REAL", boolean: "INTEGER", enum: "TEXT" };

function toDb(field: FieldSpec, value: unknown): unknown {
  if (value === undefined || value === null) return null;
  return field.kind === "boolean" ? (value ? 1 : 0) : value;
}

function fromDb(entity: Entity, raw: Record<string, unknown>): Row {
  const row: Row = { id: String(raw.id) };
  for (const f of entity.fields) {
    const v = raw[f.name];
    if (v === null || v === undefined) continue; // absent optional: leave undefined
    row[f.name] = f.kind === "boolean" ? v === 1 : v;
  }
  return row;
}

export function createSqliteStore(path = ":memory:"): Store {
  const db = new Database(path);
  const ready = new Set<string>();
  const signature = (entity: Entity) => `${entity.name}:${entity.fields.map((f) => `${f.name}/${f.kind}`).join(",")}`;

  function ensure(entity: Entity) {
    if (ready.has(signature(entity))) return;
    const cols = entity.fields.map((f) => `"${f.name}" ${columnType[f.kind]}`).join(", ");
    db.run(`CREATE TABLE IF NOT EXISTS "${entity.name}" (id TEXT PRIMARY KEY${cols ? `, ${cols}` : ""})`);
    const existing = db.prepare(`PRAGMA table_info("${entity.name}")`).all() as { name: string; type: string }[];
    const byName = Object.fromEntries(existing.map((c) => [c.name, c.type]));
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
    // Columns no longer in the entity are left in place: reads ignore them, nothing is destroyed.
    ready.add(signature(entity));
  }

  function fieldOf(entity: Entity, name: string): FieldSpec {
    const f = entity.fields.find((f) => f.name === name);
    if (!f) throw new Error(`${entity.name}: unknown field "${name}"`);
    return f;
  }

  const get = (entity: Entity, id: string): Row | undefined => {
    const raw = db.prepare(`SELECT * FROM "${entity.name}" WHERE id = ?`).get(id) as Record<string, unknown> | null;
    return raw ? fromDb(entity, raw) : undefined;
  };

  return {
    kind: `sqlite (${path})`,

    async migrate(entity) {
      ensure(entity);
    },

    async list(entity, query: ListQuery = {}) {
      ensure(entity);
      const clauses: string[] = [];
      const params: unknown[] = [];
      for (const [k, v] of Object.entries(query.where ?? {})) {
        if (v === undefined) continue;
        clauses.push(`"${k}" = ?`);
        params.push(k === "id" ? v : toDb(fieldOf(entity, k), v));
      }
      const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
      const order = query.orderBy ? ` ORDER BY "${fieldOf(entity, query.orderBy.field).name}" ${query.orderBy.direction === "desc" ? "DESC" : "ASC"}` : "";
      const rows = db.prepare(`SELECT * FROM "${entity.name}"${where}${order}`).all(...(params as never[])) as Record<string, unknown>[];
      return rows.map((r) => fromDb(entity, r));
    },

    async get(entity, id) {
      ensure(entity);
      return get(entity, id);
    },

    async create(entity, input: Input) {
      ensure(entity);
      const data = validate(entity, input);
      const id = crypto.randomUUID();
      const names = ["id", ...entity.fields.map((f) => `"${f.name}"`)];
      const values = [id, ...entity.fields.map((f) => toDb(f, data[f.name]))];
      db.run(`INSERT INTO "${entity.name}" (${names.join(", ")}) VALUES (${names.map(() => "?").join(", ")})`, values as never[]);
      return get(entity, id)!;
    },

    async update(entity, id, patch: Input) {
      ensure(entity);
      const data = validate(entity, patch, true);
      if (!get(entity, id)) throw new StoreNotFoundError(entity.name, id);
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      if (keys.length) {
        const sets = keys.map((k) => `"${k}" = ?`).join(", ");
        const values = keys.map((k) => toDb(fieldOf(entity, k), data[k]));
        db.run(`UPDATE "${entity.name}" SET ${sets} WHERE id = ?`, [...values, id] as never[]);
      }
      return get(entity, id)!;
    },

    async remove(entity, id) {
      ensure(entity);
      db.run(`DELETE FROM "${entity.name}" WHERE id = ?`, [id]);
    },
  };
}

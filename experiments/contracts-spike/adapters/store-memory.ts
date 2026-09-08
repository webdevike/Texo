// Second Store adapter: in-memory Map. Exists to prove the contract, not for use.
// Implements the full frozen surface: operators, search, paging, include, subscribe,
// referential integrity, workspace scope.
import type { Entity, Input, Row } from "../contracts/entity";
import {
  type ChangeBus,
  createChangeBus,
  DEFAULT_SCOPE,
  type ListQuery,
  type Scope,
  type Store,
  StoreNotFoundError,
  StoreReferenceError,
  StoreSchemaError,
  validate,
} from "../contracts/store";
import { evaluate } from "./query";

interface Shared {
  tables: Map<string, Map<string, Row>>; // key = `${workspaceId}:${entity}`
  known: Map<string, Entity>;
  bus: ChangeBus;
}

export function createMemoryStore(): Store {
  return bind({ tables: new Map(), known: new Map(), bus: createChangeBus() }, DEFAULT_SCOPE);
}

function bind(shared: Shared, scope: Scope): Store {
  const { tables, known, bus } = shared;
  const table = (entity: Entity) => {
    const key = `${scope.workspaceId}:${entity.name}`;
    let t = tables.get(key);
    if (!t) tables.set(key, (t = new Map()));
    return t;
  };
  // Reads return only declared fields: a removed field's stale value never leaks (contract).
  const project = (entity: Entity, row: Row): Row => {
    const out: Row = { id: row.id };
    for (const f of entity.fields) if (row[f.name] !== undefined) out[f.name] = row[f.name];
    return out;
  };

  function checkReferences(entity: Entity, data: Record<string, unknown>) {
    for (const f of entity.fields) {
      if (f.kind !== "relation") continue;
      const v = data[f.name];
      if (v === undefined || v === null) continue;
      const target = known.get(f.to);
      if (!target) throw new StoreSchemaError(entity.name, `relation "${f.name}" targets unknown entity "${f.to}"`);
      const ids = Array.isArray(v) ? v : [v];
      for (const id of ids) {
        if (!table(target).has(String(id))) throw new StoreReferenceError(entity.name, `${f.name} references missing ${f.to} ${id}`);
      }
    }
  }

  function referencedBy(entity: Entity, id: string): string | undefined {
    for (const other of known.values()) {
      for (const f of other.fields) {
        if (f.kind !== "relation" || f.to !== entity.name) continue;
        for (const row of table(other).values()) {
          const v = row[f.name];
          if (v === id || (Array.isArray(v) && v.includes(id))) return `${other.name}.${f.name} (${row.id})`;
        }
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
        const t = table(target).get(id);
        out[name] = t ? { id, title: t[target.title] } : { id, title: undefined };
      }
      return out;
    });
  }

  return {
    kind: "memory",

    scoped: (next) => bind(shared, next),
    subscribe: (entity, fn) => bus.subscribe(entity, fn),

    async migrate(entity) {
      for (const f of entity.fields) {
        if (f.kind === "relation" && f.to !== entity.name && !known.has(f.to)) {
          throw new StoreSchemaError(entity.name, `relation "${f.name}" targets unknown entity "${f.to}"`);
        }
      }
      known.set(entity.name, entity);
      // No storage shape to reconcile, but held rows must still satisfy the new schema.
      for (const [key, t] of tables) {
        if (!key.endsWith(`:${entity.name}`)) continue;
        for (const row of t.values()) {
          const { id, ...data } = row;
          const result = entity.schema.safeParse(data);
          if (!result.success) throw new StoreSchemaError(entity.name, `existing row ${id} does not satisfy the new shape: ${result.error.issues[0]?.message}`);
          Object.assign(row, result.data); // apply new defaults so reads reflect the schema
        }
      }
    },

    async list(entity, query: ListQuery = {}) {
      const page = evaluate(entity, [...table(entity).values()].map((r) => project(entity, r)), query);
      return { ...page, rows: include(entity, page.rows, query.include) };
    },

    async get(entity, id) {
      const r = table(entity).get(id);
      return r ? project(entity, r) : undefined;
    },

    async create(entity, input: Input) {
      const data = validate(entity, input);
      checkReferences(entity, data);
      const row: Row = { id: crypto.randomUUID(), ...data };
      table(entity).set(row.id, row);
      const out = project(entity, row);
      bus.emit({ entity: entity.name, kind: "created", id: row.id, row: out, origin: scope.actorId });
      return out;
    },

    async update(entity, id, patch: Input) {
      const data = validate(entity, patch, true);
      const existing = table(entity).get(id);
      if (!existing) throw new StoreNotFoundError(entity.name, id);
      checkReferences(entity, data);
      for (const [k, v] of Object.entries(data)) if (v !== undefined) existing[k] = v;
      const out = project(entity, existing);
      bus.emit({ entity: entity.name, kind: "updated", id, row: out, origin: scope.actorId });
      return out;
    },

    async remove(entity, id) {
      if (!table(entity).has(id)) return;
      const ref = referencedBy(entity, id);
      if (ref) throw new StoreReferenceError(entity.name, `${id} is referenced by ${ref}`);
      table(entity).delete(id);
      bus.emit({ entity: entity.name, kind: "removed", id, origin: scope.actorId });
    },
  };
}

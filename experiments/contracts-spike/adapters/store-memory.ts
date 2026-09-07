// Second Store adapter: in-memory Map. Exists to prove the contract, not for use.
import type { Entity, Input, Row } from "../contracts/entity";
import { type ListQuery, type Store, StoreNotFoundError, StoreSchemaError, validate } from "../contracts/store";

export function createMemoryStore(): Store {
  const tables = new Map<string, Map<string, Row>>();
  const table = (entity: Entity) => {
    let t = tables.get(entity.name);
    if (!t) tables.set(entity.name, (t = new Map()));
    return t;
  };
  // Reads return only declared fields: a removed field's stale value never leaks (contract).
  const project = (entity: Entity, row: Row): Row => {
    const out: Row = { id: row.id };
    for (const f of entity.fields) if (row[f.name] !== undefined) out[f.name] = row[f.name];
    return out;
  };

  return {
    kind: "memory",

    async migrate(entity) {
      // No storage shape to reconcile, but held rows must still satisfy the new schema.
      for (const row of table(entity).values()) {
        const { id, ...data } = row;
        const result = entity.schema.safeParse(data);
        if (!result.success) throw new StoreSchemaError(entity.name, `existing row ${id} does not satisfy the new shape: ${result.error.issues[0]?.message}`);
        Object.assign(row, result.data); // apply new defaults so reads reflect the schema
      }
    },

    async list(entity, query: ListQuery = {}) {
      let rows = [...table(entity).values()];
      for (const [k, v] of Object.entries(query.where ?? {})) {
        if (v !== undefined) rows = rows.filter((r) => r[k] === v);
      }
      if (query.orderBy) {
        const { field, direction } = query.orderBy;
        const sign = direction === "desc" ? -1 : 1;
        rows.sort((a, b) => ((a[field] as number) < (b[field] as number) ? -sign : (a[field] as number) > (b[field] as number) ? sign : 0));
      }
      return rows.map((r) => project(entity, r));
    },

    async get(entity, id) {
      const r = table(entity).get(id);
      return r ? project(entity, r) : undefined;
    },

    async create(entity, input: Input) {
      const data = validate(entity, input);
      const row: Row = { id: crypto.randomUUID(), ...data };
      table(entity).set(row.id, row);
      return project(entity, row);
    },

    async update(entity, id, patch: Input) {
      const data = validate(entity, patch, true);
      const existing = table(entity).get(id);
      if (!existing) throw new StoreNotFoundError(entity.name, id);
      for (const [k, v] of Object.entries(data)) if (v !== undefined) existing[k] = v;
      return project(entity, existing);
    },

    async remove(entity, id) {
      table(entity).delete(id);
    },
  };
}

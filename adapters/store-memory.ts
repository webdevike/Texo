// Second Store adapter: in-memory Map. Exists to prove the contract, not for use.
import type { Entity, Input, Row } from "../contracts/entity";
import { type ListQuery, type Store, StoreNotFoundError, StoreSchemaError, validate } from "../contracts/store";

export function createMemoryStore(): Store {
  const tables = new Map<string, Map<string, Record<string, unknown>>>();
  const table = (entity: Entity) => {
    let t = tables.get(entity.name);
    if (!t) tables.set(entity.name, (t = new Map()));
    return t;
  };
  const clone = <E extends Entity>(row: Record<string, unknown>) => ({ ...row }) as Row<E>;

  return {
    async migrate(entity) {
      // No storage shape to reconcile, but held rows must still satisfy the new schema.
      for (const row of table(entity).values()) {
        const { id, ...data } = row;
        const result = entity.schema.safeParse(data);
        if (!result.success) throw new StoreSchemaError(entity.name, `existing row ${id} does not satisfy the new shape: ${result.error.issues[0]?.message}`);
        Object.assign(row, result.data); // apply new defaults so reads reflect the schema
      }
    },
    async list<E extends Entity>(entity: E, query: ListQuery<E> = {}) {
      let rows = [...table(entity).values()];
      for (const [k, v] of Object.entries(query.where ?? {})) {
        if (v !== undefined) rows = rows.filter((r) => r[k] === v);
      }
      if (query.orderBy) {
        const { field, direction } = query.orderBy;
        const sign = direction === "desc" ? -1 : 1;
        rows.sort((a, b) => (a[field]! < b[field]! ? -sign : a[field]! > b[field]! ? sign : 0));
      }
      return rows.map((r) => clone<E>(r));
    },
    async get<E extends Entity>(entity: E, id: string) {
      const r = table(entity).get(id);
      return r ? clone<E>(r) : undefined;
    },
    async create<E extends Entity>(entity: E, input: Input<E>) {
      const data = validate(entity, input) as Record<string, unknown>;
      const row = { id: crypto.randomUUID(), ...data };
      table(entity).set(row.id, row);
      return clone<E>(row);
    },
    async update<E extends Entity>(entity: E, id: string, patch: Partial<Input<E>>) {
      const data = validate(entity, patch, true) as Record<string, unknown>;
      const existing = table(entity).get(id);
      if (!existing) throw new StoreNotFoundError(entity.name, id);
      for (const [k, v] of Object.entries(data)) if (v !== undefined) existing[k] = v;
      return clone<E>(existing);
    },
    async remove(entity, id) {
      table(entity).delete(id);
    },
  };
}

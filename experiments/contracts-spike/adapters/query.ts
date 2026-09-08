// Shared query evaluation for adapters that filter in memory (memory store, and sqlite's
// fallback for group/JSON fields). SQL adapters should push these down where possible;
// the conformance suite pins the semantics either way.
import type { Entity, Row } from "../contracts/entity";
import { conditionOf, type Condition, type ListQuery, type Page, orderOf } from "../contracts/store";

export const DEFAULT_LIMIT = 50;

export function matches(row: Row, field: string, cond: Condition): boolean {
  const v = row[field];
  const { op, value } = cond;
  switch (op) {
    case "eq":
      return v === value;
    case "ne":
      return v !== value;
    case "in":
      return Array.isArray(value) && value.includes(v);
    case "nin":
      return Array.isArray(value) && !value.includes(v);
    case "lt":
      return v !== undefined && v !== null && (v as number) < (value as number);
    case "lte":
      return v !== undefined && v !== null && (v as number) <= (value as number);
    case "gt":
      return v !== undefined && v !== null && (v as number) > (value as number);
    case "gte":
      return v !== undefined && v !== null && (v as number) >= (value as number);
    case "contains":
      return typeof v === "string" && typeof value === "string" && v.toLowerCase().includes(value.toLowerCase());
    case "isNull":
      return (v === undefined || v === null) === (value === undefined ? true : Boolean(value));
  }
}

export function searchable(entity: Entity): string[] {
  return entity.fields.filter((f) => f.kind === "string" || f.kind === "enum").map((f) => f.name);
}

export function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b));
}

/** Apply a full ListQuery (minus include) to rows in memory. */
export function evaluate(entity: Entity, rows: Row[], query: ListQuery): Page {
  let out = rows;
  for (const [field, raw] of Object.entries(query.where ?? {})) {
    if (raw === undefined) continue;
    const cond = conditionOf(raw);
    out = out.filter((r) => matches(r, field, cond));
  }
  if (query.search) {
    const q = query.search.toLowerCase();
    const fields = searchable(entity);
    out = out.filter((r) => fields.some((f) => typeof r[f] === "string" && (r[f] as string).toLowerCase().includes(q)));
  }
  const order = orderOf(query);
  if (order.length) {
    out = [...out].sort((a, b) => {
      for (const o of order) {
        const c = compare(a[o.field], b[o.field]);
        if (c !== 0) return o.direction === "desc" ? -c : c;
      }
      return 0;
    });
  }
  const total = out.length;
  const offset = query.offset ?? 0;
  const limit = query.limit ?? DEFAULT_LIMIT;
  return { rows: out.slice(offset, offset + limit), total };
}

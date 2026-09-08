// Storage contract. `Store` is the host-side contract (owns schema reconciliation and
// referential integrity). `ClientStore` is what UI and transports see: the server is schema
// authority, so `migrate` never crosses the wire (P3c).
//
// FROZEN SURFACE (2026-09-07, wave 1). Additions over rung 1:
//   ListQuery: operator filters, search, paging; `list` returns a Page.
//   ClientStore.subscribe: change feed (realtime seam). Adapters that cannot push emit on
//     their own writes at minimum; transports bridge over SSE.
//   Relations: `remove` refuses when another entity's row references the id
//     (StoreReferenceError), `create`/`update` refuse dangling ids (StoreReferenceError),
//     `migrate` refuses a relation to an unknown entity (StoreSchemaError). `list.include`
//     resolves single relations to `{ id, title }` for display.
//   Workspace scoping: every row belongs to a `workspaceId` supplied by the host via
//     `Scope`; queries never see other workspaces. Absent scope = the default workspace.
//
// An adapter is done when `runStoreConformance` in store.conformance.ts passes against it.
import type { Entity, Input, Row } from "./entity";

export type Op = "eq" | "ne" | "in" | "nin" | "lt" | "lte" | "gt" | "gte" | "contains" | "isNull";
export type Condition = { op: Op; value?: unknown };
export type Where = Record<string, unknown | Condition>;

export interface ListQuery {
  /** Equality (bare value) or an operator condition per field, AND across keys. */
  where?: Where;
  /** Case-insensitive substring match across string fields (and the title). */
  search?: string;
  orderBy?: { field: string; direction: "asc" | "desc" }[] | { field: string; direction: "asc" | "desc" };
  /** Zero-based offset paging. Default limit is adapter-defined; the suite pins 50. */
  offset?: number;
  limit?: number;
  /** Resolve these single-relation fields to `{ id, title }` in the returned rows. */
  include?: string[];
}

export interface Page {
  rows: Row[];
  /** Total rows matching `where`/`search`, ignoring paging. */
  total: number;
}

export type ChangeKind = "created" | "updated" | "removed";
export interface ChangeEvent {
  entity: string;
  kind: ChangeKind;
  id: string;
  /** Present for created/updated. */
  row?: Row;
  /** Monotonic per store; clients use it to dedupe/reconnect. */
  seq: number;
  /** Set by transports/hosts so a client can ignore its own echoes. */
  origin?: string;
}

export interface Scope {
  workspaceId: string;
  /** Free-form actor id for audit/origin; not authorization. */
  actorId?: string;
}
export const DEFAULT_SCOPE: Scope = { workspaceId: "default" };

export interface ClientStore {
  list(entity: Entity, query?: ListQuery): Promise<Page>;
  get(entity: Entity, id: string): Promise<Row | undefined>;
  /** Validates against `entity.schema`; rejects with StoreValidationError on bad input. */
  create(entity: Entity, input: Input): Promise<Row>;
  /** Partial update; unknown id rejects with StoreNotFoundError. */
  update(entity: Entity, id: string, patch: Input): Promise<Row>;
  /** Idempotent for unknown ids; rejects with StoreReferenceError when referenced. */
  remove(entity: Entity, id: string): Promise<void>;
  /** Change feed for one entity (or all when `entity` is null). Returns an unsubscribe. */
  subscribe(entity: Entity | null, listener: (event: ChangeEvent) => void): () => void;
}

export interface Store extends ClientStore {
  /** Adapter label for manifests and admin surfaces. */
  readonly kind: string;
  /**
   * Reconcile storage with the entity's current shape. Additive changes (new optional field,
   * new field with a default) must succeed and existing rows must keep reading. Called by the
   * host once per entity at startup and after every spec change. Idempotent.
   * Relations: refuses (StoreSchemaError) when `to` names an entity the store has not seen.
   */
  migrate(entity: Entity): Promise<void>;
  /** Return a view of this store bound to a workspace. Rows are partitioned per scope. */
  scoped(scope: Scope): Store;
}

/** Thrown when storage cannot be reconciled with the entity's shape (destructive or unsupported change). */
export class StoreSchemaError extends Error {
  constructor(entity: string, detail: string) {
    super(`${entity}: ${detail}`);
    this.name = "StoreSchemaError";
  }
}

export interface ValidationIssue {
  path: PropertyKey[];
  message: string;
}

export class StoreValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super("validation failed");
    this.name = "StoreValidationError";
  }
}

export class StoreNotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} ${id} not found`);
    this.name = "StoreNotFoundError";
  }
}

/** Dangling relation on write, or removal of a row that another row still references. */
export class StoreReferenceError extends Error {
  constructor(entity: string, detail: string) {
    super(`${entity}: ${detail}`);
    this.name = "StoreReferenceError";
  }
}

/** Shared by adapters so validation semantics never drift between them. */
export function validate(entity: Entity, input: unknown, partial = false): Record<string, unknown> {
  const schema = partial ? entity.schema.partial() : entity.schema;
  const result = schema.safeParse(input);
  if (!result.success) throw new StoreValidationError(result.error.issues);
  return result.data;
}

/** Normalize a Where entry to a Condition. */
export function conditionOf(value: unknown): Condition {
  if (value && typeof value === "object" && "op" in value) return value as Condition;
  return { op: "eq", value };
}

/** Normalize orderBy to an array. */
export function orderOf(query: ListQuery): { field: string; direction: "asc" | "desc" }[] {
  if (!query.orderBy) return [];
  return Array.isArray(query.orderBy) ? query.orderBy : [query.orderBy];
}

/**
 * In-memory change bus adapters can reuse. `emit` assigns `seq`. Adapters that cannot observe
 * external writes (sqlite file, memory) emit here on their own writes; that is the minimum.
 */
export interface ChangeBus {
  emit(event: Omit<ChangeEvent, "seq">): ChangeEvent;
  subscribe(entity: Entity | null, fn: (e: ChangeEvent) => void): () => void;
  readonly seq: number;
}

export function createChangeBus(): ChangeBus {
  const listeners = new Set<{ entity: string | null; fn: (e: ChangeEvent) => void }>();
  let seq = 0;
  return {
    emit(event: Omit<ChangeEvent, "seq">): ChangeEvent {
      const full = { ...event, seq: ++seq };
      for (const l of listeners) if (l.entity === null || l.entity === event.entity) l.fn(full);
      return full;
    },
    subscribe(entity: Entity | null, fn: (e: ChangeEvent) => void): () => void {
      const l = { entity: entity?.name ?? null, fn };
      listeners.add(l);
      return () => listeners.delete(l);
    },
    get seq() {
      return seq;
    },
  };
}

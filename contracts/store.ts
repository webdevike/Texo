// Storage contract. Plain promises, no optimistic state, no subscriptions (rung 1).
// `Store` is the host-side contract (owns schema reconciliation). `ClientStore` is what UI and
// transports see: the server is schema authority, so `migrate` never crosses the wire (P3c).
// An adapter is done when `runStoreConformance` in store.conformance.ts passes against it.
import type { Entity, Input, Row } from "./entity";

export interface ListQuery {
  /** Equality filter, AND across keys. */
  where?: Record<string, unknown>;
  orderBy?: { field: string; direction: "asc" | "desc" };
}

export interface ClientStore {
  list(entity: Entity, query?: ListQuery): Promise<Row[]>;
  get(entity: Entity, id: string): Promise<Row | undefined>;
  /** Validates against `entity.schema`; rejects with StoreValidationError on bad input. */
  create(entity: Entity, input: Input): Promise<Row>;
  /** Partial update; unknown id rejects with StoreNotFoundError. */
  update(entity: Entity, id: string, patch: Input): Promise<Row>;
  /** Idempotent: removing an unknown id resolves. */
  remove(entity: Entity, id: string): Promise<void>;
}

export interface Store extends ClientStore {
  /** Adapter label for manifests and admin surfaces. */
  readonly kind: string;
  /**
   * Reconcile storage with the entity's current shape. Additive changes (new optional field,
   * new field with a default) must succeed and existing rows must keep reading. Called by the
   * host once per entity at startup and after every spec change. Idempotent.
   */
  migrate(entity: Entity): Promise<void>;
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

/** Shared by adapters so validation semantics never drift between them. */
export function validate(entity: Entity, input: unknown, partial = false): Record<string, unknown> {
  const schema = partial ? entity.schema.partial() : entity.schema;
  const result = schema.safeParse(input);
  if (!result.success) throw new StoreValidationError(result.error.issues);
  return result.data;
}

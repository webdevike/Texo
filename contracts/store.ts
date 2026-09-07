// Storage contract. Plain promises, no optimistic state, no subscriptions (rung 1).
// An adapter is done when `runStoreConformance` in store.conformance.ts passes against it.
import type { Entity, Input, Row } from "./entity";

export interface ListQuery<E extends Entity> {
  /** Equality filter, AND across keys. */
  where?: Partial<Row<E>>;
  orderBy?: { field: keyof Row<E> & string; direction: "asc" | "desc" };
}

export interface Store {
  /**
   * Reconcile storage with the entity's current shape. Additive changes (new optional field,
   * new field with a default) must succeed and existing rows must keep reading. Called by the
   * host once per entity at startup; adapters may also call it lazily. Idempotent.
   */
  migrate(entity: Entity): Promise<void>;
  list<E extends Entity>(entity: E, query?: ListQuery<E>): Promise<Row<E>[]>;
  get<E extends Entity>(entity: E, id: string): Promise<Row<E> | undefined>;
  /** Validates against `entity.schema`; rejects with StoreValidationError on bad input. */
  create<E extends Entity>(entity: E, input: Input<E>): Promise<Row<E>>;
  /** Partial update; unknown id rejects with StoreNotFoundError. */
  update<E extends Entity>(entity: E, id: string, patch: Partial<Input<E>>): Promise<Row<E>>;
  /** Idempotent: removing an unknown id resolves. */
  remove<E extends Entity>(entity: E, id: string): Promise<void>;
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
export function validate<E extends Entity>(entity: E, input: unknown, partial = false): Row<E> | Partial<Row<E>> {
  const schema = partial ? entity.schema.partial() : entity.schema;
  const result = schema.safeParse(input);
  if (!result.success) throw new StoreValidationError(result.error.issues);
  return result.data as Row<E>;
}

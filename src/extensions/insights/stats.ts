// Pure data layer for the Insights extension: which entities count, which field they break
// down by, and the `list` queries that produce the numbers. No React here so it is testable.
import { defineEntity, type EntitySpec, type FieldSpec } from '../../../experiments/contracts-spike/contracts/entity';
import type { ClientStore } from '../../../experiments/contracts-spike/contracts/store';
import type { Manifest } from '../../admin/client';

export interface Bucket {
  option: string;
  count: number;
}

export interface EntityInsight {
  entity: string;
  total: number;
  /** Absent when the entity has no enum field. */
  breakdown?: { field: string; buckets: Bucket[] };
}

/** Entities the Content page shows: everything the host does not mark as system. */
export function userEntities(manifest: Manifest): EntitySpec[] {
  return manifest.entities.filter((e) => !manifest.system.includes(e.name));
}

/** The first top-level enum field, in spec order. Group members are not queryable, so they do not count. */
export function firstEnumField(spec: EntitySpec): (FieldSpec & { kind: 'enum' }) | undefined {
  return spec.fields.find((f): f is FieldSpec & { kind: 'enum' } => f.kind === 'enum');
}

/** One `list` per option plus one for the total; `limit: 0` because only `total` is read. */
export async function insightOf(store: ClientStore, spec: EntitySpec): Promise<EntityInsight> {
  const entity = defineEntity(spec);
  const total = (await store.list(entity, { limit: 0 })).total;
  const field = firstEnumField(spec);
  if (!field) return { entity: spec.name, total };
  const buckets = await Promise.all(
    field.options.map(async (option) => ({
      option,
      count: (await store.list(entity, { where: { [field.name]: option }, limit: 0 })).total,
    })),
  );
  return { entity: spec.name, total, breakdown: { field: field.name, buckets } };
}

export function insightsOf(store: ClientStore, manifest: Manifest): Promise<EntityInsight[]> {
  return Promise.all(userEntities(manifest).map((spec) => insightOf(store, spec)));
}


/** Refresh bus: the palette command has no component handle, so it pings whoever is mounted. */
const listeners = new Set<() => void>();

export function onRefresh(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function requestRefresh(): void {
  for (const l of listeners) l();
}

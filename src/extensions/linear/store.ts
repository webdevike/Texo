// One collections adapter per app (TanStack DB over the HTTP store: rows load once, SSE applies
// changes in place, writes are optimistic with rollback) and the entity lookups every Linear
// page needs.
import type { Collection } from '@tanstack/react-db';
import { useMemo } from 'react';

import { createCollections } from '../../../experiments/contracts-spike/adapters/store-collections';
import { createHttpStore } from '../../../experiments/contracts-spike/adapters/store-http';
import type { Entity } from '../../../experiments/contracts-spike/contracts/entity';
import { StoreValidationError } from '../../../experiments/contracts-spike/contracts/store';
import { entitiesOf } from '../../admin/client';
import { useManifest } from '../backend';
import { notify } from './toast';

export const cols = createCollections(createHttpStore('/api', { origin: 'tab-' + crypto.randomUUID() }), { loadLimit: 50_000 });
export const store = cols.store;

/** The issue columns the views read; every other field stays `unknown` (the entity is data). */
export interface IssueRow {
  id: string;
  title: string;
  status: string;
  priority: number;
  assignee?: string;
  project?: string;
  team?: string;
  labels?: string[];
  due?: string;
  [key: string]: unknown;
}
export interface NamedRow {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const issuesOf = (entity: Entity) => cols.collection(entity) as unknown as Collection<IssueRow, string>;
export const namedOf = (entity: Entity) => cols.collection(entity) as unknown as Collection<NamedRow, string>;

export const STATUSES = ['backlog', 'todo', 'in_progress', 'done', 'canceled'] as const;
export const STATUS_LABEL: Record<string, string> = { backlog: 'Backlog', todo: 'Todo', in_progress: 'In progress', done: 'Done', canceled: 'Canceled' };
export const STATUS_KEY: Record<string, string> = { b: 'backlog', t: 'todo', i: 'in_progress', d: 'done', c: 'canceled' };
export const PRIORITY_LABEL = ['None', 'Urgent', 'High', 'Medium', 'Low'];

export function useEntities() {
  const { manifest } = useManifest();
  return useMemo(() => {
    const all = manifest ? entitiesOf(manifest) : [];
    const by = (name: string): Entity | undefined => all.find((e) => e.name === name);
    return { all, resolve: by, issue: by('issue'), project: by('project'), member: by('member'), label: by('label'), team: by('team') };
  }, [manifest]);
}

export function describeError(e: unknown): string {
  if (e instanceof StoreValidationError) return e.issues.map((i) => `${i.path.join('.') || 'row'}: ${i.message}`).join('; ');
  return e instanceof Error ? e.message : String(e);
}

/** Optimistic patch of one row; the server's rejection rolls the collection back and is toasted. */
export function patchRow(entity: Entity, id: string, patch: Record<string, unknown>) {
  const c = cols.collection(entity);
  if (!c.has(id)) return;
  const tx = c.update(id, (draft) => {
    Object.assign(draft, patch);
  });
  tx.isPersisted.promise.catch((e: unknown) => notify(describeError(e)));
}

// Dev aid for browser-driven verification (rejected-patch rollback proof).
Object.assign(window, { __texoCols: cols, __texoPatch: patchRow });

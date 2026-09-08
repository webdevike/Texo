// One live store per app (SSE + optimistic cache) and the entity lookups every Linear page needs.
import { useMemo } from 'react';

import { createHttpStore } from '../../../experiments/contracts-spike/adapters/store-http';
import { createLiveStore } from '../../../experiments/contracts-spike/adapters/store-live';
import type { Entity } from '../../../experiments/contracts-spike/contracts/entity';
import { entitiesOf } from '../../admin/client';
import { useManifest } from '../backend';

export const liveStore = createLiveStore(createHttpStore('/api', { origin: 'tab-' + crypto.randomUUID() }));

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

import { describe, expect, test } from 'bun:test';

import { createMemoryStore } from '../../../experiments/contracts-spike/adapters/store-memory';
import { defineEntity, type EntitySpec } from '../../../experiments/contracts-spike/contracts/entity';
import type { Manifest } from '../../admin/client';
import { firstEnumField, insightsOf, onRefresh, requestRefresh, userEntities } from './stats';

const issue: EntitySpec = {
  name: 'issue',
  title: 'title',
  fields: [
    { name: 'title', kind: 'string' },
    { name: 'status', kind: 'enum', options: ['todo', 'done'] },
    { name: 'kind', kind: 'enum', options: ['bug', 'task'] },
  ],
};
const member: EntitySpec = { name: 'member', title: 'name', fields: [{ name: 'name', kind: 'string' }] };
const setting: EntitySpec = { name: '_setting', title: 'key', fields: [{ name: 'key', kind: 'string' }] };
const manifest: Manifest = { entities: [issue, member, setting], adapters: { store: 'memory', transport: 'test' }, system: ['_setting'] };

describe('insights stats', () => {
  test('system entities are excluded and the first enum wins', () => {
    expect(userEntities(manifest).map((e) => e.name)).toEqual(['issue', 'member']);
    expect(firstEnumField(issue)?.name).toBe('status');
    expect(firstEnumField(member)).toBeUndefined();
  });

  test('totals and per-option counts come from list().total', async () => {
    const store = createMemoryStore();
    const issueEntity = defineEntity(issue);
    await store.migrate(issueEntity);
    await store.migrate(defineEntity(member));
    await store.create(issueEntity, { title: 'a', status: 'todo', kind: 'bug' });
    await store.create(issueEntity, { title: 'b', status: 'done', kind: 'bug' });
    await store.create(issueEntity, { title: 'c', status: 'done', kind: 'task' });

    expect(await insightsOf(store, manifest)).toEqual([
      { entity: 'issue', total: 3, breakdown: { field: 'status', buckets: [{ option: 'todo', count: 1 }, { option: 'done', count: 2 }] } },
      { entity: 'member', total: 0 },
    ]);
  });

  test('refresh bus reaches every listener until unsubscribed', () => {
    let hits = 0;
    const off = onRefresh(() => hits++);
    requestRefresh();
    off();
    requestRefresh();
    expect(hits).toBe(1);
  });
});

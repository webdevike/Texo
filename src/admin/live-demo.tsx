// /admin/live: two panes, each its own http client (own origin) behind its own live cache, both
// listing `issue`. What one pane writes shows in the other through SSE, with no reload and no
// refetch; the writing pane shows it optimistically before the server answers.
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  BaseActionIcon,
  BaseBadge,
  BaseBox,
  BaseButton,
  BaseCheckbox,
  BaseGroup,
  BaseStack,
  BaseText,
  BaseTextInput,
  BaseTitle,
} from '@texo/ui';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { createHttpStore } from '../../experiments/contracts-spike/adapters/store-http';
import { createLiveStore, type LiveStore } from '../../experiments/contracts-spike/adapters/store-live';
import type { Entity } from '../../experiments/contracts-spike/contracts/entity';
import { entitiesOf, host } from './client';
import { useLive } from './hooks/use-live';
import { useOptimistic } from './hooks/use-optimistic';

// Module-level so React StrictMode's double mount does not open two SSE streams per pane.
const panes: { name: string; store: LiveStore }[] = ['pane-1', 'pane-2'].map((name) => ({
  name,
  store: createLiveStore(createHttpStore('/api', { origin: name })),
}));

export function LiveDemo() {
  const [entity, setEntity] = useState<Entity | undefined>();
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    host
      .manifest()
      .then((m) => {
        const issue = entitiesOf(m).find((e) => e.name === 'issue');
        if (issue) setEntity(issue);
        else setMissing(true);
      })
      .catch(() => setMissing(true));
  }, []);

  if (missing) return <BaseText c="dimmed">No `issue` entity on this host.</BaseText>;
  if (!entity) return null;
  return (
    <BaseStack gap="lg">
      <BaseStack gap={2}>
        <BaseTitle order={3}>Live</BaseTitle>
        <BaseText c="dimmed" size="sm">
          Two independent clients on one host. Writes land in the other pane over SSE; a second browser tab on this URL updates too.
        </BaseText>
      </BaseStack>
      <BaseGroup align="flex-start" grow>
        {panes.map((p) => (
          <Pane entity={entity} key={p.name} name={p.name} store={p.store} />
        ))}
      </BaseGroup>
    </BaseStack>
  );
}

function Pane({ entity, name, store }: { entity: Entity; name: string; store: LiveStore }) {
  const { rows, total, loading } = useLive(store, entity, { orderBy: { field: 'title', direction: 'asc' }, limit: 200 });
  const writes = useOptimistic(store, entity);
  const [title, setTitle] = useState('');
  // Stamped on every change so a probe can measure propagation without knowing React internals.
  const stamp = useMemo(() => Math.round(performance.now()), [rows]);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setTitle('');
    void writes.create({ title: t }).catch(() => setTitle(t));
  };

  return (
    <BaseStack data-pane={name} data-stamp={stamp} data-total={total} gap="sm" style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-md)', padding: 'var(--mantine-spacing-md)' }}>
      <BaseGroup justify="space-between">
        <BaseStack gap={0}>
          <BaseText fw={600}>{name}</BaseText>
          <BaseText c="dimmed" size="xs">
            origin={name}, {loading ? 'loading' : `${total} issue${total === 1 ? '' : 's'}`}
          </BaseText>
        </BaseStack>
        {writes.pending > 0 && <BaseBadge variant="light">{writes.pending} in flight</BaseBadge>}
      </BaseGroup>
      <form onSubmit={add}>
        <BaseGroup gap="xs" wrap="nowrap">
          <BaseTextInput
            aria-label={`New issue in ${name}`}
            data-testid={`${name}-input`}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="Add an issue"
            style={{ flex: 1 }}
            value={title}
          />
          <BaseButton data-testid={`${name}-add`} leftSection={<IconPlus size={16} />} type="submit" variant="light">
            Add
          </BaseButton>
        </BaseGroup>
      </form>
      <BaseStack gap={0}>
        {rows.map((row) => {
          const temp = writes.isTemp(row.id);
          const busy = temp || writes.pendingIds.has(row.id);
          return (
            <BaseGroup
              data-done={String(row.done)}
              data-id={row.id}
              data-row={String(row.title)}
              gap="sm"
              key={row.id}
              style={{ borderTop: '1px solid var(--mantine-color-default-border)', opacity: busy ? 0.6 : 1, padding: '6px 0' }}
              wrap="nowrap"
            >
              <BaseCheckbox
                aria-label={`Toggle ${String(row.title)}`}
                checked={Boolean(row.done)}
                disabled={temp}
                onChange={(e) => void writes.update(row.id, { done: e.currentTarget.checked }).catch(() => {})}
              />
              <BaseBox style={{ flex: 1 }}>
                <BaseText size="sm" td={row.done ? 'line-through' : undefined}>
                  {String(row.title)}
                </BaseText>
              </BaseBox>
              {temp && (
                <BaseBadge color="gray" size="xs" variant="outline">
                  saving
                </BaseBadge>
              )}
              <BaseActionIcon
                aria-label={`Remove ${String(row.title)}`}
                color="gray"
                disabled={temp}
                onClick={() => void writes.remove(row.id).catch(() => {})}
                variant="subtle"
              >
                <IconTrash size={16} />
              </BaseActionIcon>
            </BaseGroup>
          );
        })}
        {!loading && rows.length === 0 && (
          <BaseText c="dimmed" py="sm" size="sm">
            Nothing yet.
          </BaseText>
        )}
      </BaseStack>
      {writes.error !== undefined && (
        <BaseText c="red" size="xs">
          {writes.error instanceof Error ? writes.error.message : String(writes.error)}
        </BaseText>
      )}
    </BaseStack>
  );
}

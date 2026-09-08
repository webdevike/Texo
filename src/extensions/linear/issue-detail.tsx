// Issue detail side panel: every field edited inline through FieldControl, writes through the live
// store so the list and board update optimistically.
import { IconX } from '@tabler/icons-react';
import { BaseActionIcon, BaseGroup, BaseStack, BaseText, BaseTitle } from '@texo/ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Entity, Row } from '../../../experiments/contracts-spike/contracts/entity';
import { FieldControl } from '../../admin/fields/field-control';
import { useOptimistic } from '../../admin/hooks/use-optimistic';
import { liveStore, useEntities } from './store';

export function IssueDetail({ entity, id, onClose }: { entity: Entity; id: string; onClose: () => void }) {
  const { resolve } = useEntities();
  const { update, error } = useOptimistic(liveStore, entity);
  const [row, setRow] = useState<Row | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    setRow(undefined);
    return liveStore.watch(entity, { where: { id }, limit: 1 }, ({ rows }) => setRow(rows[0]));
  }, [entity, id]);

  if (!row) return null;
  const ctx = { store: liveStore, resolveEntity: resolve };
  return (
    <BaseStack gap="sm" p="md" style={{ width: 380, borderLeft: '1px solid var(--mantine-color-default-border)', overflowY: 'auto', height: '100%' }}>
      <BaseGroup justify="space-between" wrap="nowrap">
        <BaseTitle order={5} lineClamp={2}>{String(row.title)}</BaseTitle>
        <BaseActionIcon aria-label="Close" onClick={onClose} variant="subtle"><IconX size={16} /></BaseActionIcon>
      </BaseGroup>
      {error ? <BaseText c="red" size="xs">{String((error as Error).message ?? error)}</BaseText> : null}
      {entity.fields.map((f) => (
        <FieldControl ctx={ctx} field={f} key={f.name} onChange={(v) => void update(row.id, { [f.name]: v }).catch(() => undefined)} value={row[f.name]} />
      ))}
      {typeof row.project === 'string' && (
        <BaseText c="blue" size="xs" style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${row.project}`)}>Open project</BaseText>
      )}
    </BaseStack>
  );
}

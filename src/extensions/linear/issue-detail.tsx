// Issue detail side panel: the row is a live query over the issue collection, every field is
// edited inline through FieldControl, and each edit is an optimistic collection update (the list
// and board see it at once; a server rejection rolls it back and toasts).
import { IconX } from '@tabler/icons-react';
import { eq, useLiveQuery } from '@tanstack/react-db';
import { BaseActionIcon, BaseGroup, BaseStack, BaseText, BaseTitle } from '@texo/ui';
import { useNavigate } from 'react-router-dom';

import type { Entity } from '../../../experiments/contracts-spike/contracts/entity';
import { FieldControl } from '../../admin/fields/field-control';
import { issuesOf, patchRow, store, useEntities } from './store';

export function IssueDetail({ entity, id, onClose }: { entity: Entity; id: string; onClose: () => void }) {
  const { resolve } = useEntities();
  const navigate = useNavigate();
  const { data: row } = useLiveQuery({
    queryKey: ['issue', entity.name, id],
    query: (q) => q.from({ i: issuesOf(entity) }).where(({ i }) => eq(i.id, id)).findOne(),
  });

  if (!row) return null;
  const ctx = { store, resolveEntity: resolve };
  return (
    <BaseStack gap="sm" p="md" style={{ width: 380, borderLeft: '1px solid var(--mantine-color-default-border)', overflowY: 'auto', height: '100%' }}>
      <BaseGroup justify="space-between" wrap="nowrap">
        <BaseTitle order={5} lineClamp={2}>{row.title}</BaseTitle>
        <BaseActionIcon aria-label="Close" onClick={onClose} variant="subtle"><IconX size={16} /></BaseActionIcon>
      </BaseGroup>
      {entity.fields.map((f) => (
        <FieldControl ctx={ctx} field={f} key={f.name} onChange={(v) => patchRow(entity, row.id, { [f.name]: v })} value={row[f.name]} />
      ))}
      {typeof row.project === 'string' && (
        <BaseText c="blue" size="xs" style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${row.project}`)}>Open project</BaseText>
      )}
    </BaseStack>
  );
}

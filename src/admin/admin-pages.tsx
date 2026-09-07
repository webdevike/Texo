// Admin routes rendered inside the Texo canvas. Content = EntityPage, Schema = SchemaBuilder,
// System = manifest facts. All manifest-driven.
import { BaseBadge, BaseCode, BaseGroup, BaseStack, BaseTable, BaseText, BaseTitle } from '@texo/ui';
import { useNavigate, useParams } from 'react-router-dom';

import { createHttpStore } from '../../experiments/contracts-spike/adapters/store-http';
import { entitiesOf, type Manifest } from './client';
import { EntityPage } from './entity-page';
import { SchemaBuilder } from './schema-builder';

const store = createHttpStore('/api');

export function AdminContent({ manifest }: { manifest: Manifest }) {
  const { name } = useParams();
  const entity = entitiesOf(manifest).find((e) => e.name === name);
  if (!entity) return <BaseText c="dimmed">Unknown entity {name}</BaseText>;
  return <EntityPage entity={entity} key={entity.name} store={store} />;
}

export function AdminSchema({ manifest, onChanged }: { manifest: Manifest; onChanged: () => Promise<void> }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const isNew = name === 'new';
  const spec = isNew
    ? { name: '', title: '', fields: [{ name: 'name', kind: 'string' as const, min: 1 }] }
    : manifest.entities.find((e) => e.name === name);
  if (!spec) return <BaseText c="dimmed">Unknown entity {name}</BaseText>;
  return (
    <BaseStack>
      <BaseTitle order={3}>{isNew ? 'New entity' : `Schema: ${spec.name}`}</BaseTitle>
      <SchemaBuilder
        isNew={isNew}
        key={name}
        onDeleted={async () => {
          await onChanged();
          navigate('/admin/system');
        }}
        onSaved={onChanged}
        spec={spec}
      />
    </BaseStack>
  );
}

export function AdminSystem({ manifest }: { manifest: Manifest }) {
  const content = manifest.entities.filter((e) => !manifest.system.includes(e.name));
  return (
    <BaseStack>
      <BaseTitle order={3}>System</BaseTitle>
      <BaseTable maw={600} withTableBorder>
        <BaseTable.Tbody>
          <BaseTable.Tr>
            <BaseTable.Td>Store adapter</BaseTable.Td>
            <BaseTable.Td>
              <BaseCode>{manifest.adapters.store}</BaseCode>
            </BaseTable.Td>
          </BaseTable.Tr>
          <BaseTable.Tr>
            <BaseTable.Td>Transport</BaseTable.Td>
            <BaseTable.Td>
              <BaseCode>{manifest.adapters.transport}</BaseCode>
            </BaseTable.Td>
          </BaseTable.Tr>
          <BaseTable.Tr>
            <BaseTable.Td>Entities</BaseTable.Td>
            <BaseTable.Td>
              <BaseGroup gap={4}>
                {content.map((e) => (
                  <BaseBadge key={e.name} variant="light">
                    {e.name}
                  </BaseBadge>
                ))}
              </BaseGroup>
            </BaseTable.Td>
          </BaseTable.Tr>
          <BaseTable.Tr>
            <BaseTable.Td>System entities</BaseTable.Td>
            <BaseTable.Td>
              <BaseGroup gap={4}>
                {manifest.system.map((n) => (
                  <BaseBadge color="gray" key={n} variant="outline">
                    {n}
                  </BaseBadge>
                ))}
              </BaseGroup>
            </BaseTable.Td>
          </BaseTable.Tr>
        </BaseTable.Tbody>
      </BaseTable>
    </BaseStack>
  );
}

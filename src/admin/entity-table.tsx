// Table rendered from entity.fields. Sort by clicking a header; click a row to edit.
import { BaseBadge, BaseTable, BaseText } from '@texo/ui';

import type { Entity, FieldSpec, Row } from '../../experiments/contracts-spike/contracts/entity';

/** Display text for a relation value: included `{ id, title }`, a bare id, or an id list. */
function relationText(value: unknown): string {
  if (Array.isArray(value)) return `${value.length} linked`;
  if (value !== null && typeof value === 'object' && 'id' in value) {
    const title = 'title' in value ? value.title : undefined;
    return title === undefined || title === null ? String(value.id) : String(title);
  }
  return String(value);
}

function Cell({ field, value }: { field: FieldSpec; value: unknown }) {
  if (value === undefined || value === null) {
    return (
      <BaseText c="dimmed" size="sm">
        -
      </BaseText>
    );
  }
  switch (field.kind) {
    case 'boolean':
      return (
        <BaseBadge color={value ? 'green' : 'gray'} variant="light">
          {value ? 'yes' : 'no'}
        </BaseBadge>
      );
    case 'enum':
      return <BaseBadge variant="outline">{String(value)}</BaseBadge>;
    case 'relation':
      return (
        <BaseText lineClamp={1} size="sm">
          {relationText(value)}
        </BaseText>
      );
    case 'group':
      return (
        <BaseText c="dimmed" size="sm">
          {Array.isArray(value) ? `${value.length} ${value.length === 1 ? 'item' : 'items'}` : '1 item'}
        </BaseText>
      );
    case 'date':
      return <BaseText size="sm">{String(value).slice(0, 10)}</BaseText>;
    default:
      return (
        <BaseText lineClamp={1} size="sm">
          {String(value)}
        </BaseText>
      );
  }
}

export function EntityTable({ entity, rows, sort, onSort, onSelect }: {
  entity: Entity;
  rows: Row[];
  sort?: { field: string; direction: 'asc' | 'desc' };
  onSort: (field: string) => void;
  onSelect: (row: Row) => void;
}) {
  return (
    <BaseTable highlightOnHover withTableBorder>
      <BaseTable.Thead>
        <BaseTable.Tr>
          {entity.fields.map((f) => (
            <BaseTable.Th key={f.name} onClick={() => onSort(f.name)} style={{ cursor: 'pointer', userSelect: 'none' }}>
              {f.name}
              {sort?.field === f.name ? (sort.direction === 'asc' ? ' \u2191' : ' \u2193') : ''}
            </BaseTable.Th>
          ))}
        </BaseTable.Tr>
      </BaseTable.Thead>
      <BaseTable.Tbody>
        {rows.length === 0 && (
          <BaseTable.Tr>
            <BaseTable.Td colSpan={entity.fields.length}>
              <BaseText c="dimmed" size="sm">
                No {entity.name}s yet
              </BaseText>
            </BaseTable.Td>
          </BaseTable.Tr>
        )}
        {rows.map((row) => (
          <BaseTable.Tr key={row.id} onClick={() => onSelect(row)} style={{ cursor: 'pointer' }}>
            {entity.fields.map((f) => (
              <BaseTable.Td key={f.name}>
                <Cell field={f} value={row[f.name]} />
              </BaseTable.Td>
            ))}
          </BaseTable.Tr>
        ))}
      </BaseTable.Tbody>
    </BaseTable>
  );
}

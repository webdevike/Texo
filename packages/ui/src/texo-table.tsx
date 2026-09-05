import { useState, type ReactNode } from 'react';

import { BaseBox, BaseCheckbox, BaseTable } from './components';
import { useTexoTheme } from './texo-theme-provider';
import classes from './texo-table.module.css';

export interface TexoTableColumn {
  align?: 'left' | 'center' | 'right';
  key: string;
  label: ReactNode;
  width?: number | string;
}

export interface TexoTableRow {
  id: string;
  [key: string]: ReactNode;
}

export function TexoTable({
  columns,
  rows,
  selectable = false,
}: {
  columns: readonly TexoTableColumn[];
  rows: readonly TexoTableRow[];
  selectable?: boolean;
}) {
  const { config } = useTexoTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = rows.length > 0 && selected.length === rows.length;

  const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row.id));
  const toggleRow = (id: string) => setSelected((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
  );

  return (
    <BaseBox className={classes.viewport}>
      <BaseTable
        className={classes.table}
        data-borders={config.table.borders}
        data-hover={config.table.hover || undefined}
        data-sticky={config.table.stickyHeader || undefined}
        data-striped={config.table.striped || undefined}
      >
        <BaseTable.Thead>
          <BaseTable.Tr>
            {selectable && (
              <BaseTable.Th className={classes.selectionCell}>
                <BaseCheckbox
                  aria-label="Select all rows"
                  checked={allSelected}
                  indeterminate={selected.length > 0 && !allSelected}
                  onChange={toggleAll}
                  size="xs"
                />
              </BaseTable.Th>
            )}
            {columns.map((column) => (
              <BaseTable.Th key={column.key} style={{ textAlign: column.align, width: column.width }}>
                {column.label}
              </BaseTable.Th>
            ))}
          </BaseTable.Tr>
        </BaseTable.Thead>
        <BaseTable.Tbody>
          {rows.map((row) => (
            <BaseTable.Tr data-selected={selected.includes(row.id) || undefined} key={row.id}>
              {selectable && (
                <BaseTable.Td className={classes.selectionCell}>
                  <BaseCheckbox
                    aria-label={`Select ${row.id}`}
                    checked={selected.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                    size="xs"
                  />
                </BaseTable.Td>
              )}
              {columns.map((column) => (
                <BaseTable.Td key={column.key} style={{ textAlign: column.align }}>
                  {row[column.key]}
                </BaseTable.Td>
              ))}
            </BaseTable.Tr>
          ))}
        </BaseTable.Tbody>
      </BaseTable>
    </BaseBox>
  );
}

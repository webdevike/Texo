import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BaseBox, BaseCheckbox, BaseText } from './components';
import { useTexoTheme } from './texo-theme-provider';
import classes from './texo-data-table.module.css';

/**
 * Virtualized, sortable, keyboard-navigable table for large lists (10k+ rows).
 *
 * Rows are positioned by @tanstack/react-virtual inside a scroll viewport; only the visible
 * window is in the DOM. Row height, borders, stripes, hover and sticky header come from the
 * Texo theme (`config.table`) through the `--texo-table-*` CSS vars. Cell content is delegated
 * to `renderCell` so entity-aware renderers plug in from the app layer.
 *
 * Sorting: click a header to cycle asc -> desc -> none; shift-click to add or cycle a secondary
 * key. Keyboard (root focused): ArrowUp/ArrowDown move the focused row, Home/End jump, Enter
 * calls `onOpen`, Space toggles selection when `selectable`.
 */
export interface TexoDataTableColumn {
  key: string;
  label: ReactNode;
  align?: 'left' | 'right';
  /** CSS grid track; defaults to `minmax(160px, 1fr)`. Numbers are pixels. */
  width?: number | string;
}

export interface TexoDataTableSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TexoDataTableProps<T extends { id: string }> {
  columns: readonly TexoDataTableColumn[];
  rows: readonly T[];
  renderCell?: (column: TexoDataTableColumn, value: unknown, row: T) => ReactNode;
  sort?: readonly TexoDataTableSort[];
  onSortChange?: (sort: TexoDataTableSort[]) => void;
  onOpen?: (row: T) => void;
  selectable?: boolean;
  selected?: readonly string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Called when the last rendered row comes into view; use it to page in more rows. */
  onEndReached?: () => void;
  loading?: boolean;
  emptyLabel?: ReactNode;
  /** Rows to render above/below the viewport. */
  overscan?: number;
}

const ROW_HEIGHT: Record<'compact' | 'comfortable', number> = { compact: 36, comfortable: 46 };
const SELECTION_TRACK = '42px';

function defaultCell(_column: TexoDataTableColumn, value: unknown) {
  if (value === undefined || value === null) return <BaseText c="dimmed" size="sm">-</BaseText>;
  if (typeof value === 'object') return <BaseText size="sm" className={classes.default}>{JSON.stringify(value)}</BaseText>;
  return <BaseText size="sm" className={classes.default}>{String(value)}</BaseText>;
}

/** Next sort list after clicking `field`. `additive` (shift) keeps other keys. */
export function cycleSort(current: readonly TexoDataTableSort[], field: string, additive: boolean): TexoDataTableSort[] {
  const existing = current.find((s) => s.field === field);
  const next: TexoDataTableSort | undefined =
    existing === undefined ? { field, direction: 'asc' } : existing.direction === 'asc' ? { field, direction: 'desc' } : undefined;
  if (!additive) return next ? [next] : [];
  const rest = current.filter((s) => s.field !== field);
  if (!next) return rest;
  if (!existing) return [...rest, next];
  return current.map((s) => (s.field === field ? next : s));
}

export function TexoDataTable<T extends { id: string }>({
  columns,
  rows,
  renderCell = defaultCell,
  sort = [],
  onSortChange,
  onOpen,
  selectable = false,
  selected = [],
  onSelectedChange,
  onEndReached,
  loading = false,
  emptyLabel = 'No rows',
  overscan = 12,
}: TexoDataTableProps<T>) {
  const { config } = useTexoTheme();
  const rowHeight = ROW_HEIGHT[config.table.density];
  const viewportRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<number>(-1);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => rowHeight,
    overscan,
    getItemKey: (index) => rows[index].id,
  });
  const items = virtualizer.getVirtualItems();
  const lastRendered = items.length ? items[items.length - 1].index : -1;

  useEffect(() => {
    virtualizer.measure();
  }, [rowHeight, virtualizer]);

  useEffect(() => {
    if (onEndReached && rows.length > 0 && lastRendered >= rows.length - 1) onEndReached();
  }, [lastRendered, rows.length, onEndReached]);

  useEffect(() => {
    if (focused >= rows.length) setFocused(rows.length - 1);
  }, [focused, rows.length]);

  const moveFocus = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(rows.length - 1, index));
      if (rows.length === 0) return;
      setFocused(clamped);
      virtualizer.scrollToIndex(clamped, { align: 'auto' });
    },
    [rows.length, virtualizer],
  );

  const toggle = (id: string) => {
    if (!onSelectedChange) return;
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(focused < 0 ? 0 : focused + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(focused < 0 ? 0 : focused - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(0);
        break;
      case 'End':
        event.preventDefault();
        moveFocus(rows.length - 1);
        break;
      case 'PageDown':
        event.preventDefault();
        moveFocus(focused + Math.floor((viewportRef.current?.clientHeight ?? rowHeight * 10) / rowHeight));
        break;
      case 'PageUp':
        event.preventDefault();
        moveFocus(focused - Math.floor((viewportRef.current?.clientHeight ?? rowHeight * 10) / rowHeight));
        break;
      case 'Enter':
        if (focused >= 0 && rows[focused] && onOpen) {
          event.preventDefault();
          onOpen(rows[focused]);
        }
        break;
      case ' ':
        if (selectable && focused >= 0 && rows[focused]) {
          event.preventDefault();
          toggle(rows[focused].id);
        }
        break;
    }
  };

  const onHeaderClick = (event: MouseEvent, key: string) => {
    onSortChange?.(cycleSort(sort, key, event.shiftKey));
  };

  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const tracks = [
    ...(selectable ? [SELECTION_TRACK] : []),
    ...columns.map((c) => (typeof c.width === 'number' ? `${c.width}px` : (c.width ?? 'minmax(160px, 1fr)'))),
  ].join(' ');
  const style = { '--texo-data-table-columns': tracks } as CSSProperties;

  return (
    <BaseBox
      aria-busy={loading || undefined}
      aria-rowcount={rows.length}
      className={classes.root}
      data-borders={config.table.borders}
      data-hover={config.table.hover || undefined}
      data-striped={config.table.striped || undefined}
      onKeyDown={onKeyDown}
      role="grid"
      style={style}
      tabIndex={0}
    >
      <div className={classes.viewport} ref={viewportRef}>
        <div className={classes.header} data-sticky={config.table.stickyHeader || undefined} role="row">
          {selectable && (
            <div className={`${classes.headerCell} ${classes.selectionCell}`} role="columnheader">
              <BaseCheckbox
                aria-label="Select all rows"
                checked={allSelected}
                indeterminate={selected.length > 0 && !allSelected}
                onChange={() => onSelectedChange?.(allSelected ? [] : rows.map((r) => r.id))}
                size="xs"
              />
            </div>
          )}
          {columns.map((column) => {
            const at = sort.findIndex((s) => s.field === column.key);
            const active = at >= 0 ? sort[at] : undefined;
            return (
              <div
                aria-sort={active ? (active.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                className={classes.headerCell}
                data-align={column.align}
                data-sorted={active ? '' : undefined}
                key={column.key}
                onClick={(event) => onHeaderClick(event, column.key)}
                role="columnheader"
              >
                {column.label}
                {active && (active.direction === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />)}
                {active && sort.length > 1 && <span className={classes.sortIndex}>{at + 1}</span>}
              </div>
            );
          })}
        </div>
        {rows.length === 0 && !loading && (
          <BaseText c="dimmed" className={classes.empty} size="sm">
            {emptyLabel}
          </BaseText>
        )}
        <div className={classes.body} role="rowgroup" style={{ height: virtualizer.getTotalSize() }}>
          {items.map((item) => {
            const row = rows[item.index];
            const isSelected = selectable && selected.includes(row.id);
            return (
              <div
                aria-rowindex={item.index + 1}
                aria-selected={selectable ? isSelected : undefined}
                className={classes.row}
                data-even={item.index % 2 === 1 ? '' : undefined}
                data-focused={focused === item.index ? '' : undefined}
                data-index={item.index}
                key={item.key}
                onClick={() => {
                  setFocused(item.index);
                  onOpen?.(row);
                }}
                role="row"
                style={{ width: '100%', transform: `translateY(${item.start}px)` }}
              >
                {selectable && (
                  <div className={`${classes.cell} ${classes.selectionCell}`} onClick={(e) => e.stopPropagation()} role="gridcell">
                    <BaseCheckbox aria-label={`Select ${row.id}`} checked={isSelected} onChange={() => toggle(row.id)} size="xs" />
                  </div>
                )}
                {columns.map((column) => (
                  <div className={classes.cell} data-align={column.align} key={column.key} role="gridcell">
                    {renderCell(column, (row as Record<string, unknown>)[column.key], row)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </BaseBox>
  );
}

import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  memo,
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
const NO_SORT: readonly TexoDataTableSort[] = [];
const NO_SELECTION: readonly string[] = [];

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

interface TableRowProps<T extends { id: string }> {
  columns: readonly TexoDataTableColumn[];
  focused: boolean;
  index: number;
  measure: (node: HTMLDivElement | null) => void;
  onClick: (index: number, row: T) => void;
  onToggle: (id: string) => void;
  renderCell: NonNullable<TexoDataTableProps<T>['renderCell']>;
  row: T;
  selectable: boolean;
  selected: boolean;
}

/** Memoized so a range change only renders the rows that entered the window. */
const TableRow = memo(function TableRow<T extends { id: string }>({
  columns,
  focused,
  index,
  measure,
  onClick,
  onToggle,
  renderCell,
  row,
  selectable,
  selected,
}: TableRowProps<T>) {
  return (
    <div
      aria-rowindex={index + 1}
      aria-selected={selectable ? selected : undefined}
      className={classes.row}
      data-even={index % 2 === 1 ? '' : undefined}
      data-focused={focused ? '' : undefined}
      data-index={index}
      onClick={() => onClick(index, row)}
      ref={measure}
      role="row"
    >
      {selectable && (
        <div className={`${classes.cell} ${classes.selectionCell}`} onClick={(e) => e.stopPropagation()} role="gridcell">
          <BaseCheckbox aria-label={`Select ${row.id}`} checked={selected} onChange={() => onToggle(row.id)} size="xs" />
        </div>
      )}
      {columns.map((column) => (
        <div className={classes.cell} data-align={column.align} key={column.key} role="gridcell">
          {renderCell(column, (row as Record<string, unknown>)[column.key], row)}
        </div>
      ))}
    </div>
  );
}) as <T extends { id: string }>(props: TableRowProps<T>) => ReactNode;

export function TexoDataTable<T extends { id: string }>({
  columns,
  rows,
  renderCell = defaultCell,
  sort = NO_SORT,
  onSortChange,
  onOpen,
  selectable = false,
  selected = NO_SELECTION,
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
    // The header row is the first `rowHeight` px of scroll content; when sticky it also covers
    // that much of the viewport, so scrollToIndex must land rows below it.
    scrollMargin: rowHeight,
    scrollPaddingStart: config.table.stickyHeader ? rowHeight : 0,
    overscan,
    getItemKey: (index) => rows[index].id,
    // Scroll-only updates write row transforms straight to the DOM; React re-renders only when
    // the visible index range changes. Rows are `position: absolute; top: 0; left: 0` for this.
    directDomUpdates: true,
    directDomUpdatesMode: 'transform',
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

  const toggle = useCallback(
    (id: string) => {
      if (!onSelectedChange) return;
      onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    },
    [onSelectedChange, selected],
  );

  const onRowClick = useCallback(
    (index: number, row: T) => {
      setFocused(index);
      onOpen?.(row);
    },
    [onOpen],
  );

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
        <div className={classes.body} ref={virtualizer.containerRef} role="rowgroup">
          {items.map((item) => (
            <TableRow
              columns={columns}
              focused={focused === item.index}
              index={item.index}
              key={item.key}
              measure={virtualizer.measureElement}
              onClick={onRowClick}
              onToggle={toggle}
              renderCell={renderCell}
              row={rows[item.index]}
              selectable={selectable}
              selected={selectable && selected.includes(rows[item.index].id)}
            />
          ))}
        </div>
      </div>
    </BaseBox>
  );
}

import { type ReactNode } from 'react';
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
export interface TexoDataTableProps<T extends {
    id: string;
}> {
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
/** Next sort list after clicking `field`. `additive` (shift) keeps other keys. */
export declare function cycleSort(current: readonly TexoDataTableSort[], field: string, additive: boolean): TexoDataTableSort[];
export declare function TexoDataTable<T extends {
    id: string;
}>({ columns, rows, renderCell, sort, onSortChange, onOpen, selectable, selected, onSelectedChange, onEndReached, loading, emptyLabel, overscan, }: TexoDataTableProps<T>): import("react").JSX.Element;
//# sourceMappingURL=texo-data-table.d.ts.map
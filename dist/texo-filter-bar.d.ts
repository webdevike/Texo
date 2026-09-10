import { type ReactNode } from 'react';
/**
 * Search input + filter chips. The bar is kind-aware but contract-free: describe the fields
 * with `TexoFilterField` and it emits `TexoFilter[]`; `filtersToWhere` turns those into the
 * store contract's `Where` shape ({ field: value } for eq, { field: { op, value } } otherwise).
 */
export type TexoFilterKind = 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'relation';
export interface TexoFilterField {
    name: string;
    kind: TexoFilterKind;
    label?: ReactNode;
    /** Enum choices. */
    options?: string[];
}
export type TexoFilterOp = 'eq' | 'ne' | 'in' | 'nin' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'isNull';
export interface TexoFilter {
    field: string;
    op: TexoFilterOp;
    value?: unknown;
}
export type TexoWhere = Record<string, unknown | {
    op: TexoFilterOp;
    value?: unknown;
}>;
/** Fold chips into the store's Where: one entry per field (a later chip on the same field wins). */
export declare function filtersToWhere(filters: readonly TexoFilter[]): TexoWhere;
export interface TexoFilterBarProps {
    fields: readonly TexoFilterField[];
    filters: readonly TexoFilter[];
    onFiltersChange: (filters: TexoFilter[]) => void;
    search: string;
    onSearchChange: (search: string) => void;
    /** Matching row count, shown as "1,234 issues". */
    total?: number;
    /** Noun for the total, singular ("issue"). */
    noun?: string;
    searchPlaceholder?: string;
    /** Right-aligned actions (e.g. a New button). */
    actions?: ReactNode;
}
export declare function TexoFilterBar({ fields, filters, onFiltersChange, search, onSearchChange, total, noun, searchPlaceholder, actions, }: TexoFilterBarProps): import("react").JSX.Element;
//# sourceMappingURL=texo-filter-bar.d.ts.map
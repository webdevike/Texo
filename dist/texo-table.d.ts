import { type ReactNode } from 'react';
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
export declare function TexoTable({ columns, rows, selectable, }: {
    columns: readonly TexoTableColumn[];
    rows: readonly TexoTableRow[];
    selectable?: boolean;
}): import("react").JSX.Element;
//# sourceMappingURL=texo-table.d.ts.map
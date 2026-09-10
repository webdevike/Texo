import type { ReactNode } from 'react';
/**
 * A sortable, nestable list of "field" rows: drag handle, kind badge, label + description,
 * trailing badges, edit/remove, optional inline editor, optional children with a connector.
 * Data in, events out. Knows nothing about entities; the schema builder maps FieldSpec onto it
 * and the Custom page demos it with fixed data.
 */
export type TexoFieldKindIcon = 'text' | 'number' | 'boolean' | 'enum' | 'date' | 'relation' | 'group';
export interface TexoFieldListItem {
    id: string;
    label: string;
    description?: string;
    kind: TexoFieldKindIcon;
    badges?: string[];
    children?: TexoFieldListItem[];
}
export interface TexoFieldListProps {
    items: TexoFieldListItem[];
    /** Id of the row whose inline editor is open. */
    editing?: string | null;
    /** Renders below the row when `editing === item.id`. */
    renderEditor?: (item: TexoFieldListItem) => ReactNode;
    addLabel?: string;
    onAdd?: (parentId: string | null) => void;
    onEdit?: (id: string) => void;
    onRemove?: (id: string) => void;
    /** New sibling order under `parentId` (null = root). */
    onReorder?: (parentId: string | null, orderedIds: string[]) => void;
}
export declare function texoFieldKindLabel(kind: TexoFieldKindIcon): string;
export declare function TexoFieldList(props: TexoFieldListProps): import("react").JSX.Element;
//# sourceMappingURL=texo-field-list.d.ts.map
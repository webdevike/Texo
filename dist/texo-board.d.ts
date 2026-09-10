import type { ReactNode } from 'react';
/**
 * Kanban board over one enum field. Columns are given by the caller (one per option) with their
 * cards and total; dragging a card onto another column calls `onMove(cardId, column)`. Card
 * content is delegated to `renderCard`. The caller owns the data and the optimistic write.
 */
export interface TexoBoardColumn<T extends {
    id: string;
}> {
    id: string;
    label: string;
    cards: readonly T[];
    total: number;
}
export interface TexoBoardProps<T extends {
    id: string;
}> {
    columns: readonly TexoBoardColumn<T>[];
    renderCard: (card: T) => ReactNode;
    onMove: (cardId: string, column: string) => void;
    onOpen?: (card: T) => void;
}
export declare function TexoBoard<T extends {
    id: string;
}>({ columns, renderCard, onMove, onOpen }: TexoBoardProps<T>): import("react").JSX.Element;
//# sourceMappingURL=texo-board.d.ts.map
/** What the palette lists. The app maps its registry commands (and dynamic ones) onto this. */
export interface TexoPaletteItem {
    id: string;
    label: string;
    group?: string;
    keys?: string | string[];
}
export interface TexoCommandPaletteProps {
    items: TexoPaletteItem[];
    onClose: () => void;
    onRun: (item: TexoPaletteItem) => void;
    opened: boolean;
    placeholder?: string;
}
interface Match {
    item: TexoPaletteItem;
    score: number;
    /** Indices into `item.label` that matched, for highlighting. */
    hits: number[];
}
/**
 * Subsequence fuzzy match. Scores contiguous runs and word starts higher so `sys` prefers
 * "Go to system" over a label that merely contains the letters in order.
 */
export declare function fuzzyMatch(query: string, label: string): Match['hits'] | null;
export declare function rankItems(items: TexoPaletteItem[], query: string): Match[];
export declare function TexoKeys({ keys }: {
    keys: string;
}): import("react").JSX.Element;
export declare function TexoCommandPalette({ items, onClose, onRun, opened, placeholder }: TexoCommandPaletteProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=texo-command-palette.d.ts.map
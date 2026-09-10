import { type ReactNode } from 'react';
export interface TexoPanelProps {
    children: ReactNode;
    contained?: boolean;
    gutter?: number;
    onClose: () => void;
    opened: boolean;
    title: string;
}
export declare function TexoPanel({ children, contained, gutter, onClose, opened, title, }: TexoPanelProps): import("react").JSX.Element;
//# sourceMappingURL=texo-panel.d.ts.map
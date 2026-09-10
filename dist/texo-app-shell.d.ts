import type { ReactNode } from 'react';
export interface TexoAppShellProps {
    /** Right-aligned 56px row at the top of the workspace card. */
    actions: ReactNode;
    children: ReactNode;
    /** Optional strip under the workspace card, right-aligned (agent dock). */
    footer?: ReactNode;
    /** 48px row under the actions: preview tabs or a page toolbar. */
    previewTabs: ReactNode;
    /** Single navigation column on the shell surface. */
    sidebar: ReactNode;
}
/** Linear-style shell: one sidebar on a quiet surface, the workspace as an inset card. */
export declare function TexoAppShell({ actions, children, footer, previewTabs, sidebar, }: TexoAppShellProps): import("react").JSX.Element;
//# sourceMappingURL=texo-app-shell.d.ts.map
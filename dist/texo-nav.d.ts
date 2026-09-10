import type { ReactNode } from 'react';
/**
 * Sidebar primitives that honor `config.sidebar` from the theme configurator:
 * row height (density), active indicator, section rendering (plain / labeled /
 * collapsible) and nested indent (hierarchy). Every Texo side panel builds on these
 * so the configurator drives the app's own chrome, not just the previews.
 */
export interface TexoNavItemProps {
    active?: boolean;
    icon?: ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
}
export declare function TexoNavItem({ active, icon, label, onClick, href }: TexoNavItemProps): import("react").JSX.Element;
export interface TexoNavSectionProps {
    children: ReactNode;
    label: string;
    /** Collapsed on first render when the section is collapsible. */
    defaultCollapsed?: boolean;
}
export declare function TexoNavSection({ children, label, defaultCollapsed }: TexoNavSectionProps): import("react").JSX.Element;
//# sourceMappingURL=texo-nav.d.ts.map
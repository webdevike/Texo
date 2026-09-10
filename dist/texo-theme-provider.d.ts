import { type ReactNode } from 'react';
import { ColorSchemeScript, type MantineColorShade, type MantineColorsTuple } from './mantine';
/**
 * Inline <head> script for server-rendered apps: sets the color scheme before
 * hydration so the first paint matches the provider's forced scheme. Not a
 * visual component, hence no Base* alias (the admin gallery renders those).
 */
export declare const TexoColorSchemeScript: typeof ColorSchemeScript;
export declare const TEXO_SIZE_KEYS: readonly ["xs", "sm", "md", "lg", "xl"];
export type TexoSize = (typeof TEXO_SIZE_KEYS)[number];
export type TexoColorScheme = 'light' | 'dark';
export interface TexoSemanticColors {
    body: string;
    card: string;
    border: string;
    dimmed: string;
    placeholder: string;
    input: string;
    muted: string;
    surface: string;
    popover: string;
    text: string;
}
export interface TexoSidebarConfig {
    activeIndicator: 'fill' | 'subtle' | 'text';
    collapsible: boolean;
    density: 'compact' | 'comfortable';
    hierarchy: 'flat' | 'tree';
    nestedIndent: 'tight' | 'default';
    sections: 'plain' | 'labeled' | 'collapsible';
    width: 'compact' | 'default' | 'wide';
}
export interface TexoTableConfig {
    borders: 'horizontal' | 'grid' | 'none';
    density: 'compact' | 'comfortable';
    header: 'plain' | 'muted' | 'primary';
    hover: boolean;
    stickyHeader: boolean;
    striped: boolean;
}
export interface TexoThemeConfig {
    autoContrast: boolean;
    chartColors: [string, string, string, string, string];
    colorScheme: TexoColorScheme;
    cursorType: 'default' | 'pointer';
    effects: {
        cardShadow: string;
        controlShadow: string;
    };
    defaultRadius: TexoSize;
    focusRing: 'auto' | 'always' | 'never';
    fontFamily: string;
    fontFamilyHeadings: string;
    fontFamilyMonospace: string;
    fontSizes: Record<TexoSize, string>;
    fontSmoothing: boolean;
    lineHeights: Record<TexoSize, string>;
    luminanceThreshold: number;
    primaryColor: string;
    primaryPalette: MantineColorsTuple;
    primaryShade: {
        dark: MantineColorShade;
        light: MantineColorShade;
    };
    radius: Record<TexoSize, string>;
    respectReducedMotion: boolean;
    scale: number;
    semantic: Record<TexoColorScheme, TexoSemanticColors>;
    sidebar: TexoSidebarConfig;
    table: TexoTableConfig;
    shadows: Record<TexoSize, string>;
    spacing: Record<TexoSize, string>;
}
export interface TexoThemePreset {
    config: TexoThemeConfig;
    label: string;
    value: string;
}
export declare const TEXO_THEME_PRESETS: TexoThemePreset[];
interface TexoThemeContextValue {
    applyPreset: (presetName: string) => void;
    canRedo: boolean;
    canUndo: boolean;
    config: TexoThemeConfig;
    preset: string;
    redo: () => void;
    undo: () => void;
    updateConfig: (update: (config: TexoThemeConfig) => TexoThemeConfig) => void;
}
export interface TexoThemeProviderProps {
    children: ReactNode;
    /** Persisted state to start from. Absent = first preset. */
    initial?: {
        config: TexoThemeConfig;
        preset: string;
    };
    /** Fires on every committed change (not the seed) so a host can persist it. */
    onChange?: (config: TexoThemeConfig, preset: string) => void;
}
export declare function TexoThemeProvider({ children, initial, onChange }: TexoThemeProviderProps): import("react").JSX.Element;
export declare function useTexoTheme(): TexoThemeContextValue;
export {};
//# sourceMappingURL=texo-theme-provider.d.ts.map
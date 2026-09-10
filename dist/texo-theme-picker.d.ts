import type { TexoThemeConfig } from './texo-theme-provider';
export interface TexoThemePickerOption {
    config: TexoThemeConfig;
    label: string;
    value: string;
}
export interface TexoThemePickerProps {
    onChange: (value: string) => void;
    options: TexoThemePickerOption[];
    value: string;
}
export declare function TexoThemePicker({ onChange, options, value, }: TexoThemePickerProps): import("react").JSX.Element;
/**
 * Compact picker: the current theme's swatches as a button; clicking opens a
 * menu of themes. For chrome where a full select would be too loud.
 */
export declare function TexoThemeSwatchMenu({ onChange, options, value, }: TexoThemePickerProps): import("react").JSX.Element;
//# sourceMappingURL=texo-theme-picker.d.ts.map
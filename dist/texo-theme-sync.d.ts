import { type TexoThemeConfig } from './texo-theme-provider';
/**
 * The admin persists its theme under this localStorage key. Apps framed under
 * the same origin read it at boot and follow edits live through `storage` events.
 */
export declare const TEXO_THEME_KEY = "texo.theme";
export interface TexoThemeState {
    config: TexoThemeConfig;
    preset: string;
}
/** Saved theme merged over the default preset; undefined when absent, invalid, or on the server. */
export declare function readTexoTheme(): TexoThemeState | undefined;
export declare function writeTexoTheme(config: TexoThemeConfig, preset: string): void;
/**
 * Follows the admin's saved theme. Applies it after mount (so server-rendered
 * markup stays deterministic) and on every later `storage` event.
 */
export declare function TexoThemeSync(): null;
//# sourceMappingURL=texo-theme-sync.d.ts.map
// Wraps Texo's real TexoThemeProvider with persistence through the Store contract:
// the whole TexoThemeConfig (plus preset name) is one `_setting` row keyed "theme".
import { type ReactNode, useEffect, useRef, useState } from "react";
import { TEXO_THEME_PRESETS, type TexoThemeConfig, TexoThemeProvider } from "../theme/texo-theme-provider";
import { host } from "./client";

export interface PersistedTheme {
  preset: string;
  config: TexoThemeConfig;
  appName: string;
}

export const defaultPersistedTheme: PersistedTheme = {
  preset: TEXO_THEME_PRESETS[0]!.value,
  config: TEXO_THEME_PRESETS[0]!.config,
  appName: "texo",
};

/**
 * Loads the persisted theme once, feeds it to TexoThemeProvider, and (when `persist`) writes
 * every committed change back. The app renders read-only; the admin persists.
 */
export function ThemedProvider({ children, persist = false, onLoaded }: { children: ReactNode; persist?: boolean; onLoaded?: (t: PersistedTheme) => void }) {
  const [loaded, setLoaded] = useState<PersistedTheme | undefined>();
  const skipFirst = useRef(true);
  useEffect(() => {
    host.getSetting<Partial<PersistedTheme>>("theme").then((t) => {
      const merged = { ...defaultPersistedTheme, ...t, config: { ...defaultPersistedTheme.config, ...t.config } };
      setLoaded(merged);
      onLoaded?.(merged);
    });
  }, []);

  if (!loaded) return null;
  return (
    <TexoThemeProvider
      initial={{ config: loaded.config, preset: loaded.preset }}
      onChange={persist ? (config, preset) => {
        if (skipFirst.current) { skipFirst.current = false; return; } // the seed, not an edit
        void host.putSetting("theme", { ...loaded, config, preset });
      } : undefined}
    >
      {children}
    </TexoThemeProvider>
  );
}

import { useEffect, useRef } from 'react';

import {
  TEXO_THEME_PRESETS,
  useTexoTheme,
  type TexoThemeConfig,
} from './texo-theme-provider';

/**
 * The admin persists its theme under this localStorage key. Apps framed under
 * the same origin read it at boot and follow edits live through `storage` events.
 */
export const TEXO_THEME_KEY = 'texo.theme';

export interface TexoThemeState {
  config: TexoThemeConfig;
  preset: string;
}

/** Saved theme merged over the default preset; undefined when absent, invalid, or on the server. */
export function readTexoTheme(): TexoThemeState | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(TEXO_THEME_KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw) as Partial<TexoThemeState>;
    if (!saved.config) return undefined;
    return {
      config: { ...TEXO_THEME_PRESETS[0].config, ...saved.config },
      preset: saved.preset ?? 'custom',
    };
  } catch {
    return undefined;
  }
}

export function writeTexoTheme(config: TexoThemeConfig, preset: string) {
  localStorage.setItem(TEXO_THEME_KEY, JSON.stringify({ config, preset }));
}

/**
 * Follows the admin's saved theme. Applies it after mount (so server-rendered
 * markup stays deterministic) and on every later `storage` event.
 */
export function TexoThemeSync() {
  const { updateConfig } = useTexoTheme();
  // updateConfig is recreated per render; applying on mount must not re-trigger.
  const update = useRef(updateConfig);
  update.current = updateConfig;
  useEffect(() => {
    const apply = () => {
      const next = readTexoTheme();
      if (next) update.current(() => next.config);
    };
    apply();
    const onStorage = (event: StorageEvent) => {
      if (event.key === TEXO_THEME_KEY) apply();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return null;
}

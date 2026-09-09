import { StrictMode, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import {
  TEXO_THEME_PRESETS,
  TexoThemeProvider,
  useTexoTheme,
  type TexoThemeConfig,
} from '@texo/ui';

import { App } from './app';
import { PREVIEW_BASE } from './bridge-protocol';

/** Same key the admin writes; same origin, so `storage` events carry its edits here live. */
const THEME_KEY = 'texo.theme';

function savedTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw) as {
      config: TexoThemeConfig;
      preset: string;
    };
    return {
      config: { ...TEXO_THEME_PRESETS[0].config, ...saved.config },
      preset: saved.preset,
    };
  } catch {
    return undefined;
  }
}

function ThemeSync() {
  const { updateConfig } = useTexoTheme();
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      const next = savedTheme();
      if (next) updateConfig(() => next.config);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [updateConfig]);
  return null;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <TexoThemeProvider initial={savedTheme()}>
      <ThemeSync />
      <BrowserRouter basename={PREVIEW_BASE}>
        <App />
      </BrowserRouter>
    </TexoThemeProvider>
  </StrictMode>,
);

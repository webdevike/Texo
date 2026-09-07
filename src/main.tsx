import { StrictMode, useEffect, useState } from 'react';
import { TEXO_THEME_PRESETS, TexoThemeProvider, type TexoThemeConfig } from '@texo/ui';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { host } from './admin/client';
import App from './app/app';

interface PersistedTheme {
  config: TexoThemeConfig;
  preset: string;
}

/**
 * The theme is one `_setting` row on the host (P6): loaded once here, and every committed
 * change in the configurator is written back. When the host is down the app still runs on
 * the first preset, unpersisted.
 */
function Root() {
  const [initial, setInitial] = useState<PersistedTheme | null | undefined>(undefined);

  useEffect(() => {
    host
      .getSetting<Partial<PersistedTheme>>('theme')
      .then((t) =>
        setInitial(
          t.config
            ? { config: { ...TEXO_THEME_PRESETS[0].config, ...t.config }, preset: t.preset ?? 'custom' }
            : null,
        ),
      )
      .catch(() => setInitial(null));
  }, []);

  if (initial === undefined) return null;

  return (
    <TexoThemeProvider
      initial={initial ?? undefined}
      onChange={(config, preset) => void host.putSetting('theme', { config, preset }).catch(() => undefined)}
    >
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </BrowserRouter>
    </TexoThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

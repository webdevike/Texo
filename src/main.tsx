import { StrictMode, useEffect, useState } from 'react';
import { TEXO_THEME_PRESETS, TexoThemeProvider, type TexoThemeConfig } from '@texo/ui';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { AuthGate, useSession } from './admin/auth-gate';
import { host } from './admin/client';
import App from './app/app';

interface PersistedTheme {
  config: TexoThemeConfig;
  preset: string;
}

/**
 * The theme is one `_setting` row on the host (P6), scoped to the session's workspace: loaded
 * here once a session exists, and every committed change in the configurator is written back.
 * The whole tree is keyed by workspace id, so switching workspaces reloads theme and manifest.
 * When the host is down the app still runs on the first preset, unpersisted.
 */
function Themed() {
  const { session } = useSession();
  const [initial, setInitial] = useState<PersistedTheme | null | undefined>(undefined);

  useEffect(() => {
    setInitial(undefined);
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
  }, [session.workspace.id]);

  if (initial === undefined) return null;

  return (
    <TexoThemeProvider
      key={session.workspace.id}
      initial={initial ?? undefined}
      onChange={(config, preset) => void host.putSetting('theme', { config, preset }).catch(() => undefined)}
    >
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App key={session.workspace.id} />
      </BrowserRouter>
    </TexoThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <AuthGate>
      <Themed />
    </AuthGate>
  </StrictMode>,
);

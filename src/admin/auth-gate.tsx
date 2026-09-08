// Auth gate: resolves the session once, shows login/signup until there is one, then provides
// it via context. `useSession()` exposes the session plus logout/switch; `WorkspaceSwitcher`
// is the small select the app places in its actions row. The gate renders BEFORE the theme
// provider (the theme is per workspace and loads after sign-in), so it brings its own BaseProvider.
import { IconLogout } from '@tabler/icons-react';
import {
  BaseActionIcon,
  BaseButton,
  BaseCard,
  BaseCenter,
  BaseGroup,
  BaseProvider,
  BaseSelect,
  BaseStack,
  BaseText,
  BaseTextInput,
  BaseTitle,
  BaseTooltip,
} from '@texo/ui';
import { createContext, type FormEvent, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '../../experiments/contracts-spike/contracts/auth';
import { authClient } from './auth-client';

interface SessionValue {
  session: Session;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside AuthGate');
  return value;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    authClient.me().then(setSession).catch(() => setSession(null));
  }, []);

  const logout = useCallback(async () => {
    await authClient.logout().catch(() => undefined);
    setSession(null);
  }, []);
  const switchWorkspace = useCallback(async (workspaceId: string) => {
    setSession(await authClient.switchWorkspace(workspaceId));
  }, []);

  if (session === undefined) return null;
  if (!session) {
    return (
      <BaseProvider>
        <SignIn onSession={setSession} />
      </BaseProvider>
    );
  }
  return <SessionContext.Provider value={{ session, logout, switchWorkspace }}>{children}</SessionContext.Provider>;
}

function SignIn({ onSession }: { onSession: (s: Session) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onSession(mode === 'login' ? await authClient.login(email, password) : await authClient.signup(email, password, name, workspaceName));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BaseCenter mih="100vh" p="md">
      <BaseCard withBorder w={360} p="xl">
        <form onSubmit={submit}>
          <BaseStack gap="md">
            <BaseStack gap={4}>
              <BaseTitle order={3}>{mode === 'login' ? 'Sign in to Texo' : 'Create your workspace'}</BaseTitle>
              <BaseText size="sm" c="dimmed">
                {mode === 'login' ? 'Your workspace, your theme, your data.' : 'You will be the owner of the new workspace.'}
              </BaseText>
            </BaseStack>
            <BaseStack gap="sm">
              {mode === 'signup' && (
                <BaseTextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} autoComplete="name" data-testid="auth-name" />
              )}
              <BaseTextInput
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                autoComplete="email"
                data-testid="auth-email"
              />
              <BaseTextInput
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                data-testid="auth-password"
              />
              {mode === 'signup' && (
                <BaseTextInput
                  label="Workspace"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.currentTarget.value)}
                  data-testid="auth-workspace"
                />
              )}
              {error && (
                <BaseText size="sm" c="red" data-testid="auth-error">
                  {error}
                </BaseText>
              )}
            </BaseStack>
            <BaseStack gap="xs">
              <BaseButton type="submit" loading={busy} fullWidth data-testid="auth-submit">
                {mode === 'login' ? 'Sign in' : 'Sign up'}
              </BaseButton>
              <BaseButton
                variant="subtle"
                size="xs"
                fullWidth
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                }}
                data-testid="auth-toggle"
              >
                {mode === 'login' ? 'New here? Create a workspace' : 'Have an account? Sign in'}
              </BaseButton>
            </BaseStack>
          </BaseStack>
        </form>
      </BaseCard>
    </BaseCenter>
  );
}

/** Workspace select plus sign-out, for the app's actions row. Only member workspaces are offered. */
export function WorkspaceSwitcher() {
  const { session, logout, switchWorkspace } = useSession();
  const [busy, setBusy] = useState(false);
  return (
    <BaseGroup gap={4} wrap="nowrap">
      <BaseSelect
        aria-label="Workspace"
        size="xs"
        w={150}
        allowDeselect={false}
        disabled={busy}
        data={session.workspaces.map((w) => ({ value: w.id, label: w.name }))}
        value={session.workspace.id}
        onChange={(id) => {
          if (!id || id === session.workspace.id) return;
          setBusy(true);
          switchWorkspace(id).finally(() => setBusy(false));
        }}
        data-testid="workspace-switcher"
      />
      <BaseTooltip label={`Sign out ${session.user.email}`}>
        <BaseActionIcon aria-label="Sign out" variant="subtle" onClick={() => void logout()} data-testid="auth-logout">
          <IconLogout size={16} />
        </BaseActionIcon>
      </BaseTooltip>
    </BaseGroup>
  );
}

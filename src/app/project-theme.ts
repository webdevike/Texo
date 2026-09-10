import type { TexoThemeConfig, TexoThemeState } from '@texo/ui';

import { themeFile } from './theme-document';

/**
 * Persists the admin's theme into the framed project's texo.theme.json through
 * tools/project-files.ts. Revision-checked like the other project files; on a
 * conflict (edited on disk meanwhile) the latest revision is fetched and the
 * save retried once, since the admin is the theme's editor.
 */
export type ProjectTheme = {
  state: TexoThemeState | null;
  save: (config: TexoThemeConfig, preset: string) => void;
};

type Loaded = { document: TexoThemeState | null; revision: string };

async function fetchTheme(): Promise<Loaded | null> {
  const response = await fetch(themeFile.endpoint, { cache: 'no-store' });
  if (response.status === 404) return null;
  const data = (await response.json()) as Partial<Loaded> & { error?: string };
  if (!response.ok || typeof data.revision !== 'string')
    throw new Error(data.error ?? `${themeFile.label} request failed (${response.status}).`);
  return { document: data.document ?? null, revision: data.revision };
}

async function putTheme(state: TexoThemeState, revision: string) {
  return fetch(themeFile.endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-texo-editor': '1' },
    body: JSON.stringify({ document: state, revision }),
  });
}

/** null when the workspace is not framing a project. */
export async function loadProjectTheme(): Promise<ProjectTheme | null> {
  let loaded: Loaded | null;
  try {
    loaded = await fetchTheme();
  } catch (error) {
    console.error(error);
    return null;
  }
  if (!loaded) return null;
  let revision = loaded.revision;
  let pending: TexoThemeState | null = null;
  let timer: number | undefined;
  let saving: Promise<void> = Promise.resolve();

  const flush = () => {
    const state = pending;
    pending = null;
    if (!state) return;
    saving = saving.then(async () => {
      let response = await putTheme(state, revision);
      if (response.status === 409) {
        const latest = await fetchTheme();
        if (latest) {
          revision = latest.revision;
          response = await putTheme(state, revision);
        }
      }
      const data = (await response.json()) as { revision?: string; error?: string };
      if (!response.ok || typeof data.revision !== 'string')
        throw new Error(data.error ?? `Could not save ${themeFile.label}.`);
      revision = data.revision;
    }).catch((error: unknown) => console.error(error));
  };

  return {
    state: loaded.document,
    save(config, preset) {
      pending = { config, preset };
      clearTimeout(timer);
      timer = window.setTimeout(flush, 400);
    },
  };
}

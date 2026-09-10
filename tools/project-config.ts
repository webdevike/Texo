import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * A project the workspace frames instead of the bundled preview/. Selected with
 * `texo dev <path>` (tools/texo.mts), which sets TEXO_PROJECT to the directory
 * holding `texo.json`:
 * {
 *   "url": "http://localhost:3000",       // dev server the admin proxies /preview/ to
 *   "agentRoot": "../..",                 // where chat agents run; default: the project itself
 *   "components": "src/components/texo/*.texo.ts"   // modules exporting defineTexoComponent() values
 * }
 *
 * The app must serve itself under /preview/ (Vite `base`) and mount
 * `useTexoBridge` + `TexoThemeSync` from @texo/ui so the admin can frame it.
 * The workspace keeps its per-project state next to texo.json:
 *   texo.theme.json   the theme the admin last saved (commit it)
 *   .texo/threads/    chat transcripts and omp session mapping (gitignore it)
 */
export interface TexoProject {
  /** Directory holding texo.json. */
  root: string;
  url: string;
  agentRoot: string;
  /** Globs (relative to root) of modules whose `defineTexoComponent` exports fill the Custom page. */
  components: string[];
  threadsDir: string;
  themePath: string;
}

export const PROJECT_FILE = 'texo.json';
export const THEME_FILE = 'texo.theme.json';

export function resolveProjectFile(path: string) {
  const target = resolve(path);
  return target.endsWith(PROJECT_FILE) ? target : resolve(target, PROJECT_FILE);
}

export function loadProject(): TexoProject | null {
  const selected = process.env.TEXO_PROJECT;
  if (!selected) return null;
  const file = resolveProjectFile(selected);
  if (!existsSync(file)) throw new Error(`${file} not found. Create it or run texo dev on a directory that has one.`);
  const raw = JSON.parse(readFileSync(file, 'utf8')) as Partial<{
    url: string;
    agentRoot: string;
    components: string | string[];
  }>;
  if (typeof raw.url !== 'string')
    throw new Error(`${file}: expected { url: string, agentRoot?: string, components?: string | string[] }`);
  const root = dirname(file);
  return {
    root,
    url: raw.url.replace(/\/$/, ''),
    agentRoot: resolve(root, raw.agentRoot ?? '.'),
    components: typeof raw.components === 'string' ? [raw.components] : (raw.components ?? []),
    threadsDir: resolve(root, '.texo/threads'),
    themePath: resolve(root, THEME_FILE),
  };
}

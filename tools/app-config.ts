import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Optional `project/app.json`: point the workspace at an external app instead
 * of the bundled preview/. The app must serve itself under /preview/ (Vite
 * `base`) and mount `useTexoBridge` from @texo/ui so the admin can frame it.
 *
 * {
 *   "url": "http://localhost:3000",   // dev server the admin proxies /preview/ to
 *   "root": "../goodops"              // repository the chat agent runs in (relative to Texo)
 * }
 */
export interface TexoAppConfig {
  url: string;
  root: string;
}

export function loadAppConfig(texoRoot: string): TexoAppConfig | null {
  const path = resolve(texoRoot, 'project/app.json');
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<TexoAppConfig>;
  if (typeof raw.url !== 'string' || typeof raw.root !== 'string')
    throw new Error(`${path}: expected { url: string, root: string }`);
  return { url: raw.url.replace(/\/$/, ''), root: resolve(texoRoot, raw.root) };
}

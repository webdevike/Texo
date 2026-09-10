import { resolve } from 'node:path';
import { searchForWorkspaceRoot, type Plugin } from 'vite';

export interface TexoViteOptions {
  /**
   * Local Texo checkout whose packages/ui source replaces the installed
   * @texo/ui, with HMR, while iterating on the design system.
   * Defaults to the TEXO_UI_SRC environment variable.
   */
  source?: string;
}

/**
 * Vite plugin for apps framed by the Texo workspace.
 *
 * - TEXO_PREVIEW=1 serves the app under /preview/ so the admin can proxy and
 *   frame it on its own origin (TanStack Start derives the router basepath
 *   from Vite `base`).
 * - One React and one Mantine per tree, however @texo/ui is resolved.
 * - @texo/ui is ESM importing its own CSS, so it and Mantine are bundled for
 *   SSR instead of being loaded by Node.
 */
export function texo(options: TexoViteOptions = {}): Plugin {
  const preview = process.env.TEXO_PREVIEW === '1';
  const source = options.source ?? process.env.TEXO_UI_SRC;
  const entry = source ? resolve(source, 'packages/ui/src/index.ts') : undefined;
  return {
    name: 'texo',
    config(config) {
      return {
        base: preview ? '/preview/' : undefined,
        resolve: {
          alias: entry ? { '@texo/ui': entry } : undefined,
          dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks', '@mantine/code-highlight'],
        },
        server: entry
          ? { fs: { allow: [searchForWorkspaceRoot(config.root ?? process.cwd()), entry] } }
          : undefined,
        ssr: { noExternal: ['@texo/ui', /^@mantine\//] },
      };
    },
  };
}

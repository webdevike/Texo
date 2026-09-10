import { resolve } from 'node:path';
import { createServer, type Plugin, type ViteDevServer } from 'vite';

import { loadProject } from './project-config';

/**
 * Serves the framed app under /preview/ on the admin. By default that is the
 * bundled consumer app (preview/), run as its own Vite dev server on :4210;
 * with `texo dev <path>` it is the project's own dev server (texo.json `url`).
 * Same origin either way, so the admin can reach the frame's DOM for Prototype
 * mode, and a broken page only breaks the frame.
 */
const PREVIEW_PORT = 4210;

export function previewApp(): Plugin {
  let preview: ViteDevServer | null = null;
  return {
    name: 'texo-preview-app',
    apply: 'serve',
    config() {
      const app = loadProject();
      return {
        server: {
          proxy: {
            '/preview': {
              target: app?.url ?? `http://localhost:${PREVIEW_PORT}`,
              ws: true,
            },
          },
        },
      };
    },
    async configureServer(server) {
      const app = loadProject();
      if (app) {
        server.config.logger.info(`  texo preview proxied to ${app.url} (${app.root})`);
        return;
      }
      preview = await createServer({
        configFile: resolve(server.config.root, 'preview/vite.config.mts'),
        server: { port: PREVIEW_PORT, strictPort: true },
      });
      await preview.listen();
      server.config.logger.info(
        `  texo preview ready at /preview/ (:${PREVIEW_PORT})`,
      );
      server.httpServer?.once('close', () => {
        void preview?.close();
        preview = null;
      });
    },
  };
}

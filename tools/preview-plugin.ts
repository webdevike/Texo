import { resolve } from 'node:path';
import { createServer, type Plugin, type ViteDevServer } from 'vite';

/**
 * Runs the consumer app (preview/) as its own Vite dev server on :4210 and
 * proxies it under /preview/ on the admin. Same origin, so the admin can reach
 * the frame's DOM for Prototype mode, and a broken page only breaks the frame.
 */
const PREVIEW_PORT = 4210;

export function previewApp(): Plugin {
  let preview: ViteDevServer | null = null;
  return {
    name: 'texo-preview-app',
    apply: 'serve',
    config() {
      return {
        server: {
          proxy: {
            '/preview': {
              target: `http://localhost:${PREVIEW_PORT}`,
              ws: true,
            },
          },
        },
      };
    },
    async configureServer(server) {
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

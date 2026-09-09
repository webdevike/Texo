import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * The consumer app: pages built on @texo/ui, nothing else. The admin at :4200
 * proxies it under /preview/ and shows it in a frame, so an edit here (or to
 * the UI package) only reloads the frame, never the admin around it.
 */
export default defineConfig({
  root: import.meta.dirname,
  base: '/preview/',
  cacheDir: '../node_modules/.vite/texo-preview',
  resolve: {
    alias: { '@texo/ui': resolve(import.meta.dirname, '../packages/ui/src/index.ts') },
  },
  server: { port: 4210, host: 'localhost', strictPort: true },
  plugins: [react()],
});

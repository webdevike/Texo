/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: './node_modules/.vite/Texo',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: { '/api': 'http://127.0.0.1:4321' },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // The spike carries its own node_modules; one @tanstack/db instance or `instanceof Collection` fails across the boundary.
  resolve: { dedupe: ['@tanstack/db', '@tanstack/react-db', '@tanstack/query-core', '@tanstack/query-db-collection'] },
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist/Texo',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'Texo',
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage/Texo',
      provider: 'v8' as const,
    },
  },
}));

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const CSS_FILE = 'texo-ui.css';

/**
 * Lib mode emits one CSS file but does not import it from the entry chunk.
 * Prepend the import so `import '@texo/ui'` pulls the styles in on its own.
 */
function injectCss(): Plugin {
  return {
    name: 'texo-inject-css',
    generateBundle(_, bundle) {
      const entry = Object.values(bundle).find(
        (chunk) => chunk.type === 'chunk' && chunk.isEntry,
      );
      if (entry && entry.type === 'chunk' && bundle[CSS_FILE]) {
        entry.code = `import './${CSS_FILE}';\n${entry.code}`;
      }
    },
  };
}

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/ui',
  plugins: [react(), nxViteTsPaths(), injectCss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    cssMinify: false,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'] as const,
      fileName: 'index',
      cssFileName: CSS_FILE.replace(/\.css$/, ''),
    },
    rollupOptions: {
      // Everything that is not a relative or absolute path is a peer dependency,
      // including Mantine's stylesheet imports which stay as side-effect imports.
      external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
    },
  },
  test: {
    name: 'ui',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/ui',
      provider: 'v8' as const,
    },
  },
}));

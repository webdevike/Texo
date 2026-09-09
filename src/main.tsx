import { StrictMode } from 'react';
import {
  CodeHighlightAdapterProvider,
  createShikiAdapter,
} from '@mantine/code-highlight';
import {
  TEXO_THEME_PRESETS,
  TexoThemeProvider,
  type TexoThemeConfig,
} from '@texo/ui';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const THEME_KEY = 'texo.theme';
const saved = (() => {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return undefined;
    const t = JSON.parse(raw) as { config: TexoThemeConfig; preset: string };
    return {
      config: { ...TEXO_THEME_PRESETS[0].config, ...t.config },
      preset: t.preset,
    };
  } catch {
    return undefined;
  }
})();

// Loaded on demand: shiki's grammars and wasm are large and only needed once code renders.
const shikiAdapter = createShikiAdapter(async () => {
  const { createHighlighter } = await import('shiki');
  return createHighlighter({
    langs: [
      'tsx',
      'ts',
      'jsx',
      'js',
      'css',
      'json',
      'bash',
      'markdown',
      'diff',
      'html',
    ],
    themes: [],
  });
});

root.render(
  <StrictMode>
    <TexoThemeProvider
      initial={saved}
      onChange={(config, preset) =>
        localStorage.setItem(THEME_KEY, JSON.stringify({ config, preset }))
      }
    >
      <CodeHighlightAdapterProvider adapter={shikiAdapter}>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <App />
        </BrowserRouter>
      </CodeHighlightAdapterProvider>
    </TexoThemeProvider>
  </StrictMode>,
);

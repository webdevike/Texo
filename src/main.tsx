import { StrictMode } from 'react';
import {
  CodeHighlightAdapterProvider,
  createShikiAdapter,
} from '@mantine/code-highlight';
import {
  TexoThemeProvider,
  readTexoTheme,
  writeTexoTheme,
} from '@texo/ui';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const saved = readTexoTheme();

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
      onChange={writeTexoTheme}
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

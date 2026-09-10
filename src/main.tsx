import { StrictMode } from 'react';
import {
  CodeHighlightAdapterProvider,
  createShikiAdapter,
} from '@mantine/code-highlight';
import {
  TexoThemeProvider,
  readTexoTheme,
  writeTexoTheme,
  type TexoThemeConfig,
} from '@texo/ui';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { loadProjectTheme } from './app/project-theme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

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

async function boot() {
  // The framed project's texo.theme.json is the source of truth when present;
  // localStorage carries the live theme to the frame during a session.
  const project = await loadProjectTheme();
  const saved = project?.state ?? readTexoTheme();
  if (project?.state) writeTexoTheme(project.state.config, project.state.preset);
  const onThemeChange = (config: TexoThemeConfig, preset: string) => {
    writeTexoTheme(config, preset);
    project?.save(config, preset);
  };

  root.render(
    <StrictMode>
      <TexoThemeProvider initial={saved} onChange={onThemeChange}>
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
}

void boot();

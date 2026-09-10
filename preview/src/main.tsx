import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import {
  TEXO_PREVIEW_BASE,
  TexoThemeProvider,
  TexoThemeSync,
  readTexoTheme,
} from '@texo/ui';

import { App } from './app';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <TexoThemeProvider initial={readTexoTheme()}>
      <TexoThemeSync />
      <BrowserRouter basename={TEXO_PREVIEW_BASE}>
        <App />
      </BrowserRouter>
    </TexoThemeProvider>
  </StrictMode>,
);

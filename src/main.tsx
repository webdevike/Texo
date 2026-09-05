import { StrictMode } from 'react';
import { TexoThemeProvider } from '@texo/ui';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <TexoThemeProvider>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </BrowserRouter>
    </TexoThemeProvider>
  </StrictMode>,
);

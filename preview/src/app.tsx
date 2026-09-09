import { createElement, useEffect, type ComponentType } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import type { AdminMessage, PreviewMessage } from './bridge-protocol';
import classes from './app.module.css';

/**
 * Designed pages live in src/pages/<id>.tsx. Each module exports
 * `page = { id, label }` and a default component. Vite's glob picks new files
 * up live, which is how an agent-written page shows up as a tab in the admin.
 */
type PageModule = {
  page?: { id: string; label: string };
  default?: ComponentType;
};

const modules = import.meta.glob<PageModule>('./pages/*.tsx', { eager: true });

export const pages = Object.entries(modules)
  .flatMap(([path, module]) => {
    if (!module.default) return [];
    const id = module.page?.id ?? path.replace(/^.*\/([^/]+)\.tsx$/, '$1');
    return [{ id, label: module.page?.label ?? id, component: module.default }];
  })
  .sort((a, b) => a.label.localeCompare(b.label));

function post(message: PreviewMessage) {
  if (window.parent !== window)
    window.parent.postMessage(message, window.location.origin);
}

function Page() {
  const { pageId } = useParams();
  const page = pages.find((item) => item.id === pageId);
  useEffect(() => {
    post({ type: 'texo:route', pageId: page?.id ?? null });
  }, [page]);
  if (!page) {
    return pages.length ? (
      <Navigate to={`/pages/${pages[0].id}`} replace />
    ) : (
      <div className={classes.empty}>
        No pages yet. Ask for one in the chat.
      </div>
    );
  }
  return createElement(page.component);
}

export function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const onMessage = (event: MessageEvent<AdminMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'texo:navigate')
        navigate(`/pages/${event.data.pageId}`);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);
  // `pages` is the module binding, so a refreshed glob (new page file) re-posts.
  useEffect(() => {
    post({
      type: 'texo:pages',
      pages: pages.map(({ id, label }) => ({ id, label })),
    });
  }, [pathname, pages]);
  return (
    <Routes>
      <Route path="/pages/:pageId" element={<Page />} />
      <Route path="*" element={<Page />} />
    </Routes>
  );
}

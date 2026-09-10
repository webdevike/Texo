import { createElement, useCallback, type ComponentType } from 'react';
import { Navigate, Route, Routes, matchPath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTexoBridge, type TexoPage } from '@texo/ui';

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
    return [{
      id,
      label: module.page?.label ?? id,
      sourcePath: `preview/src/${path.slice(2)}`,
      path: `/pages/${id}`,
      component: module.default,
    }];
  })
  .sort((a, b) => a.label.localeCompare(b.label));

function Page() {
  const { pageId } = useParams();
  const page = pages.find((item) => item.id === pageId);
  if (!page) {
    return pages.length ? (
      <Navigate to={pages[0].path} replace />
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
  const pageId = matchPath('/pages/:pageId', pathname)?.params.pageId;
  const navigate = useNavigate();
  // `pages` is the module binding, so a refreshed glob (new page file) re-posts.
  useTexoBridge({
    pages,
    page: pages.find((item) => item.id === pageId) ?? null,
    navigate: useCallback((page: TexoPage) => navigate(page.path), [navigate]),
  });
  return (
    <Routes>
      <Route path="/pages/:pageId" element={<Page />} />
      <Route path="*" element={<Page />} />
    </Routes>
  );
}

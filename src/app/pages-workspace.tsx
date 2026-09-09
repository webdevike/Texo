import { createElement, type ComponentType } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { PrototypeSurface } from './prototype';
import classes from './pages-workspace.module.css';

/**
 * Designed pages live in src/pages/<id>.tsx. Each module exports
 * `page = { id, label }` and a default component; Vite's glob picks new files
 * up live, which is how an agent-written page appears as a tab.
 */
type PageModule = {
  page?: { id: string; label: string };
  default?: ComponentType;
};

const modules = import.meta.glob<PageModule>('../pages/*.tsx', { eager: true });

export const designedPages = Object.entries(modules)
  .flatMap(([path, module]) => {
    const id = module.page?.id ?? path.replace(/^.*\/([^/]+)\.tsx$/, '$1');
    if (!module.default) return [];
    return [
      {
        id,
        label: module.page?.label ?? id,
        component: module.default,
        path,
      },
    ];
  })
  .sort((a, b) => a.label.localeCompare(b.label));

export const pagePath = (id: string) => `/pages/${id}`;

export function pageIdFromPath(pathname: string) {
  const match = /^\/pages\/([^/]+)$/.exec(pathname);
  const id = match?.[1];
  return id && designedPages.some((page) => page.id === id) ? id : null;
}

/** The inset, real render of one designed page. */
export function PagesWorkspace() {
  const { pageId } = useParams();
  const page = designedPages.find((item) => item.id === pageId);
  if (!page) {
    return designedPages.length ? (
      <Navigate to={pagePath(designedPages[0].id)} replace />
    ) : (
      <div className={classes.frame} />
    );
  }
  return (
    <div className={classes.frame}>
      <PrototypeSurface page={page.id}>
        {createElement(page.component)}
      </PrototypeSurface>
    </div>
  );
}

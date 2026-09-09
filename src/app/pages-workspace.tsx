import type { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { CustomersPage } from './customers-page';
import { PrototypeSurface } from './prototype';
import classes from './pages-workspace.module.css';

/** Designed pages shown as tabs in the pages workspace. */
export const designedPages: readonly {
  id: string;
  label: string;
  element: ReactNode;
}[] = [{ id: 'customers', label: 'Customers', element: <CustomersPage /> }];

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
  if (!page) return <Navigate to={pagePath(designedPages[0].id)} replace />;
  return (
    <div className={classes.frame}>
      <PrototypeSurface page={page.id}>{page.element}</PrototypeSurface>
    </div>
  );
}

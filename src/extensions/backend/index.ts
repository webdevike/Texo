// The Backend admin surface as an extension: routes under /admin, static nav entries in the
// Backend rail, and the commands the palette and hotkeys expose. Entity-driven nav items
// stay in BackendNav (manifest-driven); this file contributes only what is static.
//
// Nav `section` is "<rail>/<subsection>": the contract only names the rail panel, so the
// subsection the Backend rail groups by (Schema, Settings) rides on the same string.
import { IconPlus, IconSettings } from '@tabler/icons-react';
import { createContext, createElement, useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { AdminContent, AdminSchema, AdminSystem } from '../../admin/admin-pages';
import type { Manifest } from '../../admin/client';
import { defineExtension } from '../../../experiments/contracts-spike/contracts/extension';

/**
 * The manifest is app state (the shell fetches it once and reloads after schema edits), but
 * route components receive no props (RouteContribution.element is a bare ComponentType). The
 * shell provides it here; the routes read it. There is no `providers` contribution in the
 * extension contract yet, so app.tsx wraps its routes in `ManifestProvider` explicitly.
 */
export interface ManifestHost {
  manifest: Manifest | undefined;
  reload: () => Promise<void>;
}

const ManifestContext = createContext<ManifestHost>({ manifest: undefined, reload: async () => undefined });
export const ManifestProvider = ManifestContext.Provider;
export const useManifest = () => useContext(ManifestContext);

function AdminIndex() {
  return createElement(Navigate, { to: '/admin/system', replace: true });
}

function SystemRoute() {
  const { manifest } = useManifest();
  return manifest ? createElement(AdminSystem, { manifest }) : null;
}

function ContentRoute() {
  const { manifest } = useManifest();
  return manifest ? createElement(AdminContent, { manifest }) : null;
}

function SchemaRoute() {
  const { manifest, reload } = useManifest();
  return manifest ? createElement(AdminSchema, { manifest, onChanged: reload }) : null;
}

export default defineExtension({
  id: 'backend',
  name: 'Backend',
  routes: [
    { path: '/admin', element: AdminIndex },
    { path: '/admin/system', element: SystemRoute, title: 'System' },
    { path: '/admin/content/:name', element: ContentRoute, title: 'Content' },
    { path: '/admin/schema/:name', element: SchemaRoute, title: 'Schema' },
  ],
  nav: [
    { section: 'Backend/Schema', label: 'New entity', path: '/admin/schema/new', icon: createElement(IconPlus, { size: 16 }), order: 10 },
    { section: 'Backend/Settings', label: 'System', path: '/admin/system', icon: createElement(IconSettings, { size: 16 }), order: 20 },
  ],
  commands: [
    { id: 'backend.system', label: 'Go to system', keys: 'g s', group: 'Backend', run: ({ navigate }) => navigate('/admin/system') },
    { id: 'backend.new-entity', label: 'New entity', keys: 'n e', group: 'Backend', run: ({ navigate }) => navigate('/admin/schema/new') },
    { id: 'backend.open-app', label: 'Open app', keys: 'g a', group: 'Backend', run: ({ navigate }) => navigate('/theme') },
  ],
});

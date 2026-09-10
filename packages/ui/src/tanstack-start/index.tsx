import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useCallback } from 'react';

import { useTexoBridge, type TexoPage } from '../texo-bridge';

export type { TexoPage } from '../texo-bridge';

export interface TexoBridgeProps {
  /** Pages the Texo workspace can open, prototype, and hand to its agent. */
  pages: TexoPage[];
}

/**
 * Mount once inside the router (the root route's component). Reports the
 * current page to the Texo admin and follows its navigation; inert when the
 * app is not framed. `page.path` is the in-app path, which TanStack Router
 * reports without the /preview basepath.
 */
export function TexoBridge({ pages }: TexoBridgeProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  useTexoBridge({
    pages,
    page: pages.find((page) => page.path === pathname) ?? null,
    navigate: useCallback((page: TexoPage) => navigate({ to: page.path }), [navigate]),
  });
  return null;
}

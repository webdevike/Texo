import { useEffect, useLayoutEffect } from 'react';

/**
 * Bridge between the Texo admin and the app it frames under /preview/.
 *
 * The framed app describes its designable pages (`texo:pages`) and reports the
 * page it is showing (`texo:route`); the admin steers it with `texo:navigate`.
 * Both documents share an origin, so the admin can also read the frame's DOM
 * (`data-texo-page` on <html>, `data-target` markers) for Prototype mode.
 */
export const TEXO_PREVIEW_BASE = '/preview';

export interface TexoPage {
  id: string;
  label: string;
  /** Source file, relative to the repository the chat agent runs in. */
  sourcePath: string;
  /** In-app path of the page (without the /preview prefix), e.g. `/pages/customers`. */
  path: string;
}

export type TexoPreviewMessage =
  | { type: 'texo:pages'; pages: TexoPage[] }
  | { type: 'texo:route'; pageId: string | null; path: string | null };

export type TexoAdminMessage = { type: 'texo:navigate'; pageId: string };

const isBrowser = typeof window !== 'undefined';

function post(message: TexoPreviewMessage) {
  if (isBrowser && window.parent !== window)
    window.parent.postMessage(message, window.location.origin);
}

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export interface TexoBridgeOptions {
  pages: TexoPage[];
  /** Page currently rendered, or null when the route is not a designed page. */
  page: TexoPage | null;
  /** Navigate the framed app to a page the admin selected. */
  navigate: (page: TexoPage) => void;
}

/** Mount once near the app root; the framed app becomes visible to the admin. */
export function useTexoBridge({ pages, page, navigate }: TexoBridgeOptions) {
  useIsomorphicLayoutEffect(() => {
    // The URL can change before React commits the matching page DOM.
    document.documentElement.dataset.texoPage = page?.id ?? '';
    return () => {
      delete document.documentElement.dataset.texoPage;
    };
  }, [page]);

  useEffect(() => {
    post({
      type: 'texo:pages',
      pages: pages.map(({ id, label, sourcePath, path }) => ({ id, label, sourcePath, path })),
    });
  }, [pages, page]);

  useEffect(() => {
    post({ type: 'texo:route', pageId: page?.id ?? null, path: page?.path ?? null });
  }, [page]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<TexoAdminMessage>) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type !== 'texo:navigate') return;
      const target = pages.find((item) => item.id === event.data.pageId);
      if (target) navigate(target);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [pages, navigate]);
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  PREVIEW_BASE,
  type AdminMessage,
  type PreviewMessage,
  type PreviewPage,
} from '../../preview/src/bridge-protocol';

/**
 * The consumer app runs in a frame under /preview/ (see tools/preview-plugin.ts).
 * The frame tells the admin which pages exist and which one it is showing; the
 * admin tells the frame where to go. Same origin, so Prototype mode can read the
 * frame's DOM directly.
 */
type PreviewContextValue = {
  pages: PreviewPage[];
  /** Page the frame reports it is showing; null until the frame speaks. */
  framePage: string | null;
  frame: HTMLIFrameElement | null;
  setFrame: (frame: HTMLIFrameElement | null) => void;
  show: (pageId: string) => void;
};

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function usePreview() {
  const value = useContext(PreviewContext);
  if (!value) throw new Error('usePreview requires PreviewProvider.');
  return value;
}

export const pagePath = (id: string) => `/pages/${id}`;

export function pageIdFromPath(pathname: string) {
  return /^\/pages\/([^/]+)$/.exec(pathname)?.[1] ?? null;
}

export const previewUrl = (pageId: string | null) =>
  pageId ? `${PREVIEW_BASE}/pages/${pageId}` : `${PREVIEW_BASE}/`;

export function PreviewProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [framePage, setFramePage] = useState<string | null>(null);
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const known = useRef<string[] | null>(null);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== window.location.origin) return;
      const message = event.data;
      if (message?.type === 'texo:pages') {
        setPages(message.pages);
        const ids = message.pages.map((page) => page.id);
        const previous = known.current;
        known.current = ids;
        // A page the agent just wrote: show it.
        const added = previous
          ? ids.find((id) => !previous.includes(id))
          : null;
        if (added && pathRef.current.startsWith('/pages'))
          navigate(pagePath(added));
      } else if (message?.type === 'texo:route') {
        setFramePage(message.pageId);
        // The frame navigated on its own (initial redirect, in-page link): follow it.
        if (
          message.pageId &&
          pathRef.current.startsWith('/pages') &&
          pageIdFromPath(pathRef.current) !== message.pageId
        )
          navigate(pagePath(message.pageId), { replace: true });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  const show = useCallback(
    (pageId: string) => {
      const message: AdminMessage = { type: 'texo:navigate', pageId };
      frame?.contentWindow?.postMessage(message, window.location.origin);
    },
    [frame],
  );

  const value = useMemo(
    () => ({ pages, framePage, frame, setFrame, show }),
    [pages, framePage, frame, show],
  );
  return (
    <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
  );
}

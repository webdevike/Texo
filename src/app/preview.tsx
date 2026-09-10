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
  TEXO_PREVIEW_BASE,
  type TexoAdminMessage,
  type TexoPage,
  type TexoPreviewMessage,
} from '@texo/ui';
import type { AgentPreviewContext } from '../context/agent-context';
import { useAgentContextSource } from '../context/agent-context-provider';
import { collectPreviewTargets } from './preview-targets';

/**
 * The consumer app runs in a frame under /preview/ (see tools/preview-plugin.ts).
 * The frame tells the admin which pages exist and which one it is showing; the
 * admin tells the frame where to go. Same origin, so Prototype mode can read the
 * frame's DOM directly.
 */
type PreviewContextValue = {
  pages: TexoPage[];
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

/** Frame URL for a page; the frame root when the page is unknown (it redirects itself). */
export const previewUrl = (page: Pick<TexoPage, 'path'> | null | undefined) =>
  page ? `${TEXO_PREVIEW_BASE}${page.path}` : `${TEXO_PREVIEW_BASE}/`;
const PAGES_KEY = 'texo.pages';

export function PreviewProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // The frame is the source of truth, but it only exists on /pages; remember
  // its last answer so the sidebar lists pages on every route and after reload.
  const [pages, setPagesState] = useState<TexoPage[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(PAGES_KEY) ?? '[]',
      ) as TexoPage[];
    } catch {
      return [];
    }
  });
  const setPages = (next: TexoPage[]) => {
    setPagesState(next);
    localStorage.setItem(PAGES_KEY, JSON.stringify(next));
  };
  const [framePage, setFramePage] = useState<string | null>(null);
  const [frame, setFrameState] = useState<HTMLIFrameElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [confirmedPages, setConfirmedPages] = useState(false);
  const pendingPage = useRef<string | null>(null);
  const reportedPage = useRef<string | null>(null);
  const setFrame = useCallback((next: HTMLIFrameElement | null) => {
    if (frameRef.current === next) return;
    frameRef.current = next;
    setFrameState(next);
    setFramePage(null);
    setConfirmedPages(false);
    pendingPage.current = null;
    reportedPage.current = null;
  }, []);
  const known = useRef<string[] | null>(null);
  const pathRef = useRef(pathname);
  if (pathRef.current !== pathname) {
    const requested = pageIdFromPath(pathname);
    pendingPage.current = requested !== reportedPage.current ? requested : null;
  }
  pathRef.current = pathname;

  useEffect(() => {
    const onMessage = (event: MessageEvent<TexoPreviewMessage>) => {
      if (
        event.origin !== window.location.origin ||
        !frameRef.current ||
        event.source !== frameRef.current.contentWindow
      ) return;
      const message = event.data;
      if (message?.type === 'texo:pages') {
        setPages(message.pages);
        setConfirmedPages(true);
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
        try {
          const actual = frameRef.current.contentWindow?.location.pathname;
          if (actual !== previewUrl(message.path === null ? null : { path: message.path })) return;
        } catch {
          return;
        }
        if (
          pendingPage.current && pendingPage.current !== message.pageId &&
          (!known.current || known.current.includes(pendingPage.current))
        ) return;
        pendingPage.current = null;
        reportedPage.current = message.pageId;
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
      pendingPage.current = pageId;
      const message: TexoAdminMessage = { type: 'texo:navigate', pageId };
      frame?.contentWindow?.postMessage(message, window.location.origin);
    },
    [frame],
  );

  useEffect(() => {
    if (frame && pendingPage.current) show(pendingPage.current);
  }, [pathname, frame, show]);

  const capture = useCallback((): AgentPreviewContext => {
    const waiting = (reason: string): AgentPreviewContext => ({
      page: { status: 'loading', reason },
      targets: { status: 'loading', reason },
    });
    const unavailable = (reason: string): AgentPreviewContext => ({
      page: { status: 'unavailable', reason },
      targets: { status: 'unavailable', reason },
    });
    const pageId = pageIdFromPath(pathname);
    if (!pathname.startsWith('/pages')) return unavailable('No preview page is open.');
    if (!frame) return waiting('Waiting for the preview frame.');
    try {
      const document = frame.contentDocument;
      const actualPath = frame.contentWindow?.location.pathname;
      if (!document || !document.body || document.readyState === 'loading')
        return waiting('The preview document is loading.');
      if (!confirmedPages) return waiting('Waiting for page source metadata from the preview.');
      if (!pageId) return unavailable('No preview page is selected.');
      const page = pages.find((item) => item.id === pageId);
      if (!page) return unavailable('The selected preview page is unavailable.');
      if (!page.sourcePath) return unavailable('The preview has not supplied a source path for this page.');
      if (
        framePage !== pageId ||
        actualPath !== previewUrl(page) ||
        document.documentElement.dataset.texoPage !== pageId
      ) return waiting('Waiting for the selected page to finish rendering.');
      return {
        page: { status: 'ready', value: {
          id: page.id, label: page.label, sourcePath: page.sourcePath,
          previewUrl: previewUrl(page),
        } },
        targets: { status: 'ready', value: collectPreviewTargets(frame) },
      };
    } catch {
      return unavailable('The preview document cannot be accessed.');
    }
  }, [pathname, frame, framePage, pages, confirmedPages]);
  const initial = useMemo(capture, [capture]);
  const [live, setLive] = useState(() => ({ capture, value: initial }));
  useEffect(() => {
    let handle = 0;
    let detachDocument = () => {};
    const refresh = () => {
      cancelAnimationFrame(handle);
      handle = 0;
      const next = capture();
      setLive((current) =>
        current.capture === capture && JSON.stringify(current.value) === JSON.stringify(next)
          ? current
          : { capture, value: next },
      );
    };
    const schedule = () => {
      if (!handle) handle = requestAnimationFrame(refresh);
    };
    const attach = () => {
      detachDocument();
      try {
        const document = frame?.contentDocument;
        const view = frame?.contentWindow;
        if (document?.documentElement && view) {
          const mutations = new MutationObserver(schedule);
          mutations.observe(document.documentElement, {
            attributes: true, childList: true, subtree: true, characterData: true,
          });
          const resize = new ResizeObserver(schedule);
          resize.observe(document.documentElement);
          if (document.body) resize.observe(document.body);
          view.addEventListener('scroll', schedule, true);
          view.addEventListener('resize', schedule);
          detachDocument = () => {
            mutations.disconnect();
            resize.disconnect();
            view.removeEventListener('scroll', schedule, true);
            view.removeEventListener('resize', schedule);
          };
        }
      } catch {
        // capture() reports inaccessible frames as unavailable.
      }
      refresh();
    };
    frame?.addEventListener('load', attach);
    attach();
    return () => {
      cancelAnimationFrame(handle);
      detachDocument();
      frame?.removeEventListener('load', attach);
    };
  }, [capture, frame]);
  useAgentContextSource('preview', live.capture === capture ? live.value : initial, capture);

  const value = useMemo(
    () => ({ pages, framePage, frame, setFrame, show }),
    [pages, framePage, frame, show],
  );
  return (
    <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
  );
}

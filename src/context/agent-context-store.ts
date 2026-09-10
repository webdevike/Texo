import type {
  AgentContextSnapshot,
  AgentContextSources,
  AgentPreviewContext,
  AgentPrototypeContext,
  AgentCanvasContext,
} from './agent-context';

const pendingPreview: AgentPreviewContext = {
  page: { status: 'loading', reason: 'Waiting for the preview page.' },
  targets: { status: 'loading', reason: 'Waiting for the preview to render.' },
};
const pendingPrototype: AgentPrototypeContext = {
  active: false,
  selection: { status: 'loading', reason: 'Waiting for Prototype state.' },
  requests: { status: 'loading', reason: 'Waiting for prototype requests.' },
};
const pendingCanvas: AgentCanvasContext = {
  mode: 'preview',
  selection: { status: 'loading', reason: 'Waiting for the canvas.' },
  requests: { status: 'loading', reason: 'Waiting for canvas requests.' },
};

type SourceEntry<T> = { value: T; capture?: () => T };
type SourceEntries = { [K in keyof AgentContextSources]?: SourceEntry<AgentContextSources[K]> };

/** One store per workspace. Feature state remains owned by its existing provider. */
export interface AgentContextStore {
  getSnapshot: () => AgentContextSnapshot;
  subscribe: (listener: () => void) => () => void;
  setRoute: (route: string, label: string) => void;
  publish: <K extends keyof AgentContextSources>(
    key: K,
    value: AgentContextSources[K],
    capture?: () => AgentContextSources[K],
  ) => () => void;
  capture: () => AgentContextSnapshot;
}

export function createAgentContextStore(initialRoute: string, initialLabel: string): AgentContextStore {
  let route = initialRoute;
  let label = initialLabel;
  const sources: SourceEntries = {};
  const listeners = new Set<() => void>();

  function source<K extends keyof AgentContextSources>(key: K, fresh: boolean): AgentContextSources[K] | undefined {
    const entry = sources[key];
    return fresh && entry?.capture ? entry.capture() : entry?.value;
  }

  function build(fresh: boolean): AgentContextSnapshot {
    const base = { version: 1 as const, capturedAt: Date.now(), route, label };
    if (route === '/pages' || route.startsWith('/pages/')) {
      const preview = source('preview', fresh) ?? pendingPreview;
      return {
        ...base,
        surface: 'preview',
        label: preview.page.status === 'ready' ? preview.page.value.label : label,
        preview,
        prototype: source('prototype', fresh) ?? pendingPrototype,
      };
    }
    if (route === '/canvas') {
      return { ...base, surface: 'canvas', canvas: source('canvas', fresh) ?? pendingCanvas };
    }
    return { ...base, surface: 'workspace' };
  }

  let current = build(false);
  function notify() {
    current = build(false);
    for (const listener of listeners) listener();
  }

  return {
    getSnapshot: () => current,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    setRoute(nextRoute: string, nextLabel: string) {
      if (nextRoute === route && nextLabel === label) return;
      route = nextRoute;
      label = nextLabel;
      notify();
    },
    publish<K extends keyof AgentContextSources>(key: K, value: AgentContextSources[K], capture?: () => AgentContextSources[K]) {
      // The generic key binds both fields; TS loses that correlation on a mapped write.
      const entry = { value, capture } as SourceEntries[K];
      sources[key] = entry;
      notify();
      return () => {
        if (sources[key] !== entry) return;
        delete sources[key];
        notify();
      };
    },
    /** Detach nested props and requests too; later editing must not rewrite history. */
    capture() {
      const snapshot = structuredClone(build(true));
      current = snapshot;
      for (const listener of listeners) listener();
      return snapshot;
    },
  };
}

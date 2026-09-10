import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { AgentContextSources } from './agent-context';
import { createAgentContextStore, type AgentContextStore } from './agent-context-store';

const StoreContext = createContext<AgentContextStore | null>(null);

export function AgentContextProvider({ children, route, label }: {
  children: ReactNode;
  route: string;
  label: string;
}) {
  const [store] = useState(() => createAgentContextStore(route, label));
  useLayoutEffect(() => { store.setRoute(route, label); }, [store, route, label]);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Agent context requires AgentContextProvider.');
  return store;
}

/** Features publish their own state; the workspace decides which sources apply to the route. */
export function useAgentContextSource<K extends keyof AgentContextSources>(
  key: K,
  value: AgentContextSources[K],
  capture?: () => AgentContextSources[K],
) {
  const store = useStore();
  useLayoutEffect(() => store.publish(key, value, capture), [store, key, value, capture]);
}

export function useAgentContext() {
  const store = useStore();
  const current = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { current, capture: store.capture };
}

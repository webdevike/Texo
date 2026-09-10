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

import type {
  ChatAnswer,
  ChatClientMessage,
  ChatItem,
  ChatServerMessage,
  ChatStatus,
  ChatThread,
} from './chat-protocol';
import type { AgentContextSnapshot } from '../context/agent-context';

const EVENT = 'texo:chat';
const hot = import.meta.hot;

type ThreadState = { items: ChatItem[]; status: ChatStatus; message?: string };

type ChatContextValue = {
  available: boolean;
  threads: ChatThread[];
  activeId: string | null;
  active: ThreadState | null;
  open: (id: string | null) => void;
  create: () => void;
  contextEnabled: boolean;
  setContextEnabled: (enabled: boolean) => void;
  send: (text: string, context?: AgentContextSnapshot | null) => void;
  abort: () => void;
  answer: (id: string, answer: ChatAnswer) => void;
  remove: (id: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const value = useContext(ChatContext);
  if (!value) throw new Error('useChat requires ChatProvider.');
  return value;
}

function post(message: ChatClientMessage) {
  hot?.send(EVENT, message);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, ThreadState>>({});
  const [contextByThread, setContextByThread] = useState<Record<string, boolean>>({});
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  useEffect(() => {
    if (!hot) return;
    const handler = (message: ChatServerMessage) => {
      switch (message.kind) {
        case 'threads':
          setThreads(message.threads);
          return;
        case 'created':
          setActiveId(message.threadId);
          post({ op: 'open', threadId: message.threadId });
          return;
        case 'items':
          setStates((current) => ({
            ...current,
            [message.threadId]: {
              ...current[message.threadId],
              items: message.items,
              status: message.status,
            },
          }));
          return;
        case 'item':
          setStates((current) => {
            const thread = current[message.threadId] ?? {
              items: [],
              status: 'idle' as const,
            };
            const index = thread.items.findIndex(
              (item) => item.id === message.item.id,
            );
            const items =
              index === -1
                ? [...thread.items, message.item]
                : thread.items.map((item, at) =>
                    at === index ? message.item : item,
                  );
            return { ...current, [message.threadId]: { ...thread, items } };
          });
          return;
        case 'delta':
          setStates((current) => {
            const thread = current[message.threadId];
            if (!thread) return current;
            return {
              ...current,
              [message.threadId]: {
                ...thread,
                items: thread.items.map((item) =>
                  item.id === message.itemId && item.kind === 'assistant'
                    ? {
                        ...item,
                        [message.field]: item[message.field] + message.text,
                      }
                    : item,
                ),
              },
            };
          });
          return;
        case 'status':
          setStates((current) => ({
            ...current,
            [message.threadId]: {
              items: current[message.threadId]?.items ?? [],
              status: message.status,
              message: message.message,
            },
          }));
          return;
      }
    };
    hot.on(EVENT, handler);
    post({ op: 'list' });
    return () => hot.off(EVENT, handler);
  }, []);

  const open = useCallback((id: string | null) => {
    setActiveId(id);
    if (id) post({ op: 'open', threadId: id });
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      available: Boolean(hot),
      threads,
      activeId,
      active: activeId ? (states[activeId] ?? null) : null,
      open,
      create: () => post({ op: 'create' }),
      contextEnabled: activeId ? (contextByThread[activeId] ?? true) : true,
      setContextEnabled: (enabled) => {
        const id = activeRef.current;
        if (id) setContextByThread((current) => ({ ...current, [id]: enabled }));
      },
      send: (text, context) => {
        const id = activeRef.current;
        if (id) post({ op: 'send', threadId: id, text, context });
      },
      abort: () => {
        const id = activeRef.current;
        if (id) post({ op: 'abort', threadId: id });
      },
      answer: (id, answer) => {
        const threadId = activeRef.current;
        if (threadId) post({ op: 'answer', threadId, id, answer });
      },
      remove: (id) => {
        post({ op: 'remove', threadId: id });
        setContextByThread((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
        if (activeRef.current === id) setActiveId(null);
      },
    }),
    [threads, activeId, states, open, contextByThread],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

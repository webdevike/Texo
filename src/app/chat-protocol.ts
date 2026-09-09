/** Wire contract between the chat panel and tools/chat-plugin.ts (Vite ws event `texo:chat`). */

export type ChatThread = {
  id: string;
  title: string;
  sessionFile: string | null;
  createdAt: number;
};

export type ChatStatus = 'idle' | 'starting' | 'ready' | 'streaming' | 'error';

export type ChatItem =
  | { id: string; kind: 'user'; text: string; at: number }
  | {
      id: string;
      kind: 'assistant';
      text: string;
      thinking: string;
      done: boolean;
      at: number;
    }
  | {
      id: string;
      kind: 'tool';
      name: string;
      title: string;
      done: boolean;
      ok?: boolean;
      output?: string;
      at: number;
    }
  | {
      id: string;
      kind: 'ask';
      method: 'confirm' | 'input' | 'select' | 'editor';
      title?: string;
      message?: string;
      placeholder?: string;
      options?: string[];
      answered: boolean;
      at: number;
    }
  | { id: string; kind: 'notice'; text: string; at: number };

export type ChatAnswer =
  | { value: string }
  | { confirmed: boolean }
  | { cancelled: true };

export type ChatClientMessage =
  | { op: 'list' }
  | { op: 'create' }
  | { op: 'open'; threadId: string }
  | { op: 'send'; threadId: string; text: string }
  | { op: 'abort'; threadId: string }
  | { op: 'answer'; threadId: string; id: string; answer: ChatAnswer }
  | { op: 'remove'; threadId: string };

export type ChatServerMessage =
  | { kind: 'threads'; threads: ChatThread[] }
  | { kind: 'created'; threadId: string }
  | {
      kind: 'items';
      threadId: string;
      items: ChatItem[];
      status: ChatStatus;
    }
  | { kind: 'item'; threadId: string; item: ChatItem }
  | {
      kind: 'delta';
      threadId: string;
      itemId: string;
      field: 'text' | 'thinking';
      text: string;
    }
  | { kind: 'status'; threadId: string; status: ChatStatus; message?: string };

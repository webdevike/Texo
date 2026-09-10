import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import type { Plugin, ViteDevServer, WebSocketClient } from 'vite';
import type {
  ChatAnswer,
  ChatClientMessage,
  ChatItem,
  ChatServerMessage,
  ChatStatus,
  ChatThread,
} from '../src/app/chat-protocol';
import type { AgentContextSnapshot } from '../src/context/agent-context';
import { formatAgentContextPrompt } from '../src/context/agent-context-prompt';
import { loadAppConfig } from './app-config';

/**
 * Chat threads for the design workspace. Each thread is its own `omp --mode rpc`
 * child running in this repository, so the agent edits real files here and the
 * page it writes shows up through Vite HMR. Frames flow over Vite's dev
 * WebSocket under the `texo:chat` event; transcripts persist per thread under
 * project/threads/ so a dev-server restart resumes both the omp session and the
 * visible history.
 */

const EVENT = 'texo:chat';
const OUTPUT_CAP = 20_000;
const ompBinary = (() => {
  const bun = resolve(homedir(), '.bun/bin/omp');
  return existsSync(bun) ? bun : 'omp';
})();


type ThreadsFile = { version: 1; threads: ChatThread[] };

type Pending = { method: string; item: ChatItem & { kind: 'ask' } };

class Thread {
  child: ChildProcess | null = null;
  status: ChatStatus = 'idle';
  items: ChatItem[] = [];
  /** Assistant item receiving deltas for the current turn, reset by tools. */
  current: (ChatItem & { kind: 'assistant' }) | null = null;
  pending: Record<string, Pending> = {};
  private persistTimer: NodeJS.Timeout | null = null;

  constructor(
    readonly meta: ChatThread,
    private readonly host: Host,
  ) {}

  private get transcriptPath() {
    return resolve(this.host.threadsDir, `${this.meta.id}.json`);
  }

  async load() {
    try {
      const raw = JSON.parse(await readFile(this.transcriptPath, 'utf8'));
      if (Array.isArray(raw)) this.items = raw as ChatItem[];
    } catch {
      this.items = [];
    }
  }

  private persist() {
    if (this.persistTimer) return;
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      const path = this.transcriptPath;
      const temporary = `${path}.${randomUUID()}.tmp`;
      writeFile(temporary, JSON.stringify(this.items) + '\n')
        .then(() => rename(temporary, path))
        .catch(() => undefined);
    }, 300);
  }

  private emit(message: ChatServerMessage) {
    this.host.broadcast(message);
  }

  private setStatus(status: ChatStatus, message?: string) {
    this.status = status;
    this.emit({ kind: 'status', threadId: this.meta.id, status, message });
  }

  private upsert(item: ChatItem) {
    const index = this.items.findIndex((existing) => existing.id === item.id);
    if (index === -1) this.items.push(item);
    else this.items[index] = item;
    this.emit({ kind: 'item', threadId: this.meta.id, item });
    this.persist();
  }

  private write(frame: unknown) {
    const stdin = this.child?.stdin;
    if (!stdin || stdin.destroyed) return false;
    stdin.write(JSON.stringify(frame) + '\n');
    return true;
  }

  /** Spawn the omp child, resuming the thread's session file when it still exists. */
  start() {
    if (this.child) return;
    const args = ['--mode', 'rpc'];
    const resume = this.meta.sessionFile;
    if (resume && existsSync(resume)) args.push('--resume', resume);
    this.setStatus('starting');
    const child = spawn(ompBinary, args, {
      cwd: this.host.root,
      env: { ...process.env, E3D_CHILD: '1' },
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    this.child = child;
    child.on('error', (error) => {
      this.child = null;
      this.setStatus('error', `Could not start omp: ${error.message}`);
    });
    child.on('exit', (code) => {
      this.child = null;
      this.current = null;
      this.pending = {};
      this.setStatus(
        code === 0 || code === null ? 'idle' : 'error',
        code === 0 || code === null
          ? undefined
          : `omp exited with code ${code}.`,
      );
    });
    const lines = createInterface({ input: child.stdout! });
    lines.on('line', (line) => {
      let frame: Record<string, unknown>;
      try {
        frame = JSON.parse(line);
      } catch {
        return;
      }
      this.handle(frame);
    });
  }

  stop() {
    const child = this.child;
    if (!child) return;
    child.stdin?.end();
    setTimeout(() => {
      if (this.child === child) child.kill('SIGTERM');
    }, 2000);
  }

  private handle(frame: Record<string, unknown>) {
    const type = frame.type as string;
    switch (type) {
      case 'ready':
        this.write({ id: 'state', type: 'get_state' });
        this.setStatus('ready');
        return;
      case 'response': {
        if (frame.command === 'get_state' && frame.success) {
          const data = frame.data as {
            sessionFile?: string;
            sessionName?: string;
          };
          if (data.sessionFile && data.sessionFile !== this.meta.sessionFile) {
            this.meta.sessionFile = data.sessionFile;
            this.host.saveThreads();
          }
        }
        if (frame.success === false && typeof frame.error === 'string') {
          this.upsert({
            id: randomUUID(),
            kind: 'notice',
            text: frame.error,
            at: Date.now(),
          });
        }
        return;
      }
      case 'agent_start':
      case 'turn_start':
        this.setStatus('streaming');
        return;
      case 'agent_end':
        if (frame.isTerminal === false) return;
        if (this.current) {
          this.upsert({ ...this.current, done: true });
          this.current = null;
        }
        this.setStatus('ready');
        this.write({ id: 'state', type: 'get_state' });
        return;
      case 'message_update': {
        const event = frame.assistantMessageEvent as
          | { type: string; delta?: string }
          | undefined;
        if (!event?.delta) return;
        if (event.type !== 'text_delta' && event.type !== 'thinking_delta')
          return;
        if (!this.current) {
          this.current = {
            id: randomUUID(),
            kind: 'assistant',
            text: '',
            thinking: '',
            done: false,
            at: Date.now(),
          };
          this.items.push(this.current);
          this.emit({
            kind: 'item',
            threadId: this.meta.id,
            item: this.current,
          });
        }
        if (event.type === 'text_delta') this.current.text += event.delta;
        else this.current.thinking += event.delta;
        this.emit({
          kind: 'delta',
          threadId: this.meta.id,
          itemId: this.current.id,
          field: event.type === 'text_delta' ? 'text' : 'thinking',
          text: event.delta,
        });
        this.persist();
        return;
      }
      case 'tool_execution_start': {
        if (this.current) {
          this.upsert({ ...this.current, done: true });
          this.current = null;
        }
        const args = (frame.args ?? {}) as Record<string, unknown>;
        this.upsert({
          id: String(frame.toolCallId),
          kind: 'tool',
          name: String(frame.toolName ?? 'tool'),
          path: typeof args.path === 'string' ? args.path : undefined,
          title:
            typeof frame.intent === 'string'
              ? frame.intent
              : typeof args.i === 'string'
                ? args.i
                : typeof args.path === 'string'
                  ? args.path
                  : typeof args.command === 'string'
                    ? args.command
                    : String(frame.toolName ?? 'tool'),
          done: false,
          at: Date.now(),
        });
        return;
      }
      case 'tool_execution_end': {
        const id = String(frame.toolCallId);
        const existing = this.items.find((item) => item.id === id);
        if (!existing || existing.kind !== 'tool') return;
        const result = (frame.result ?? {}) as {
          content?: { type: string; text?: string }[];
          details?: { displayContent?: { text?: string } };
        };
        const text =
          result.details?.displayContent?.text ??
          (result.content ?? [])
            .filter((block) => block.type === 'text')
            .map((block) => block.text ?? '')
            .join('');
        this.upsert({
          ...existing,
          done: true,
          ok: frame.isError !== true,
          output:
            text.length > OUTPUT_CAP ? `${text.slice(0, OUTPUT_CAP)}\n…` : text,
        });
        return;
      }
      case 'extension_ui_request': {
        const method = String(frame.method);
        if (!['confirm', 'input', 'select', 'editor'].includes(method)) return;
        const item: ChatItem & { kind: 'ask' } = {
          id: String(frame.id),
          kind: 'ask',
          method: method as 'confirm' | 'input' | 'select' | 'editor',
          title: typeof frame.title === 'string' ? frame.title : undefined,
          message:
            typeof frame.message === 'string' ? frame.message : undefined,
          placeholder:
            typeof frame.placeholder === 'string'
              ? frame.placeholder
              : undefined,
          options: Array.isArray(frame.options)
            ? (frame.options as unknown[]).map(String)
            : undefined,
          answered: false,
          at: Date.now(),
        };
        this.pending[item.id] = { method, item };
        this.upsert(item);
        return;
      }
      case 'notice': {
        const text =
          typeof frame.message === 'string'
            ? frame.message
            : typeof frame.text === 'string'
              ? frame.text
              : null;
        if (text)
          this.upsert({
            id: randomUUID(),
            kind: 'notice',
            text,
            at: Date.now(),
          });
        return;
      }
      default:
        return;
    }
  }

  send(text: string, context?: AgentContextSnapshot | null) {
    const snapshot = context == null ? context : structuredClone(context);
    const message =
      snapshot == null ? text : formatAgentContextPrompt(snapshot, text);
    this.start();
    this.upsert({
      id: randomUUID(),
      kind: 'user',
      text,
      at: Date.now(),
      ...(snapshot === undefined ? {} : { context: snapshot }),
    });
    if (!this.meta.title) {
      this.meta.title = text.length > 60 ? `${text.slice(0, 57)}...` : text;
      this.host.saveThreads();
    }
    const frame = {
      id: randomUUID(),
      type: 'prompt',
      message,
      ...(this.status === 'streaming' ? { streamingBehavior: 'followUp' } : {}),
    };
    if (this.status === 'starting') {
      // Queue behind the ready frame: omp buffers stdin before it announces ready,
      // but a get_state sent first keeps ordering explicit.
      const wait = setInterval(() => {
        if (this.status !== 'starting') {
          clearInterval(wait);
          this.write(frame);
        }
      }, 50);
      return;
    }
    this.write(frame);
  }

  abort() {
    this.write({ id: randomUUID(), type: 'abort' });
  }

  answer(id: string, answer: ChatAnswer) {
    const pending = this.pending[id];
    if (!pending) return;
    delete this.pending[id];
    this.write({ type: 'extension_ui_response', id, ...answer });
    this.upsert({ ...pending.item, answered: true });
  }
}

class Host {
  threads: Thread[] = [];
  private saving: Promise<void> = Promise.resolve();

  constructor(
    readonly root: string,
    readonly threadsDir: string,
    private readonly server: ViteDevServer,
  ) {}

  private get threadsPath() {
    return resolve(this.threadsDir, 'threads.json');
  }

  async load() {
    await mkdir(this.threadsDir, { recursive: true });
    let file: ThreadsFile = { version: 1, threads: [] };
    try {
      file = JSON.parse(await readFile(this.threadsPath, 'utf8'));
    } catch {
      // First run: no threads yet.
    }
    this.threads = file.threads.map((meta) => new Thread(meta, this));
    await Promise.all(this.threads.map((thread) => thread.load()));
  }

  saveThreads() {
    const file: ThreadsFile = {
      version: 1,
      threads: this.threads.map((thread) => thread.meta),
    };
    this.saving = this.saving.then(() =>
      writeFile(this.threadsPath, JSON.stringify(file, null, 2) + '\n').catch(
        () => undefined,
      ),
    );
    this.broadcast({ kind: 'threads', threads: file.threads });
  }

  broadcast(message: ChatServerMessage) {
    this.server.ws.send(EVENT, message);
  }

  private reply(client: WebSocketClient, message: ChatServerMessage) {
    client.send(EVENT, message);
  }

  handle(message: ChatClientMessage, client: WebSocketClient) {
    switch (message.op) {
      case 'list':
        this.reply(client, {
          kind: 'threads',
          threads: this.threads.map((thread) => thread.meta),
        });
        return;
      case 'create': {
        const thread = new Thread(
          {
            id: randomUUID(),
            title: '',
            sessionFile: null,
            createdAt: Date.now(),
          },
          this,
        );
        this.threads.unshift(thread);
        this.saveThreads();
        this.reply(client, { kind: 'created', threadId: thread.meta.id });
        thread.start();
        return;
      }
      case 'open': {
        const thread = this.find(message.threadId);
        if (!thread) return;
        this.reply(client, {
          kind: 'items',
          threadId: thread.meta.id,
          items: thread.items,
          status: thread.status,
        });
        return;
      }
      case 'send':
        this.find(message.threadId)?.send(message.text, message.context);
        return;
      case 'abort':
        this.find(message.threadId)?.abort();
        return;
      case 'answer':
        this.find(message.threadId)?.answer(message.id, message.answer);
        return;
      case 'remove': {
        const thread = this.find(message.threadId);
        if (!thread) return;
        thread.stop();
        this.threads = this.threads.filter((item) => item !== thread);
        this.saveThreads();
        return;
      }
    }
  }

  private find(id: string) {
    return this.threads.find((thread) => thread.meta.id === id);
  }

  stopAll() {
    for (const thread of this.threads) thread.stop();
  }
}

export function chatThreads(): Plugin {
  return {
    name: 'texo-chat-threads',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      const app = loadAppConfig(root);
      const host = new Host(app?.root ?? root, resolve(root, 'project/threads'), server);
      const loaded = host.load();
      server.ws.on(EVENT, (data: ChatClientMessage, client) => {
        void loaded.then(() => host.handle(data, client));
      });
      server.httpServer?.once('close', () => host.stopAll());
    },
  };
}

// Transport pair: `storeHandler` exposes a host Store's ClientStore surface over HTTP;
// `createHttpStore` is a ClientStore that proxies to it. The server is schema authority:
// requests carry the entity NAME and the server resolves the current spec (P3c).
// Changes stream over SSE at `/_events` (all entities); the client fans them out per subscriber.
import { z } from "zod";
import type { Entity } from "../contracts/entity";
import {
  type ChangeEvent,
  type ClientStore,
  createChangeBus,
  StoreNotFoundError,
  StoreReferenceError,
  StoreValidationError,
} from "../contracts/store";

const ValidationBody = z.object({ issues: z.array(z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() })) });
const MessageBody = z.object({ message: z.string() });

const METHODS = ["list", "get", "create", "update", "remove"] as const;
type Method = (typeof METHODS)[number];

/**
 * `resolveStore` lets the host bind a scope per request (auth). `resolve` maps an entity name
 * to the current spec. The handler also serves `GET /_events` as SSE from `store.subscribe(null)`.
 */
export function storeHandler(
  resolveStore: (req: Request) => ClientStore | Promise<ClientStore>,
  resolve: (name: string) => Entity | undefined,
) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const [, entityName, method] = url.pathname.split("/");
    const store = await resolveStore(req);

    if (entityName === "_events" && req.method === "GET") {
      const origin = url.searchParams.get("origin") ?? undefined;
      const encoder = new TextEncoder();
      let stop = () => {};
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          const unsub = store.subscribe(null, (event) => {
            if (origin && event.origin === origin) return; // own echo
            controller.enqueue(encoder.encode(`id: ${event.seq}\ndata: ${JSON.stringify(event)}\n\n`));
          });
          const ping = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), 15000);
          stop = () => {
            unsub();
            clearInterval(ping);
          };
          controller.enqueue(encoder.encode(": connected\n\n"));
        },
        cancel() {
          stop();
        },
      });
      return new Response(body, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" } });
    }

    const entity = entityName ? resolve(entityName) : undefined;
    if (!entity || !METHODS.includes(method as Method) || req.method !== "POST") return new Response("not found", { status: 404 });
    const args = (await req.json()) as unknown[];
    try {
      const result = await (store[method as Method] as (...a: unknown[]) => Promise<unknown>)(entity, ...args);
      return Response.json(result === undefined ? null : result);
    } catch (e) {
      if (e instanceof StoreValidationError) return Response.json({ error: "validation", issues: e.issues }, { status: 422 });
      if (e instanceof StoreNotFoundError) return Response.json({ error: "not_found", message: e.message }, { status: 404 });
      if (e instanceof StoreReferenceError) return Response.json({ error: "reference", message: e.message }, { status: 409 });
      throw e;
    }
  };
}

export interface HttpStoreOptions {
  /** Identifies this client so the server can drop its own echoes. */
  origin?: string;
}

/** Minimal SSE reader over fetch: works in browsers and Bun alike (no EventSource dependency). */
function readSse(url: string, onEvent: (data: string) => void): () => void {
  const controller = new AbortController();
  (async () => {
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { accept: "text/event-stream" } });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const data = frame.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trimStart()).join("\n");
          if (data) onEvent(data);
        }
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError")) throw e;
    }
  })();
  return () => controller.abort();
}

export function createHttpStore(baseUrl: string, options: HttpStoreOptions = {}): ClientStore {
  const bus = createChangeBus();
  let disconnect: (() => void) | undefined;
  let subscribers = 0;

  function connect() {
    const url = `${baseUrl}/_events${options.origin ? `?origin=${encodeURIComponent(options.origin)}` : ""}`;
    disconnect = readSse(url, (data) => {
      const event = JSON.parse(data) as ChangeEvent;
      bus.emit(event); // re-sequenced locally; server seq is in the SSE id
    });
  }

  async function call(entity: Entity, method: Method, args: unknown[]) {
    const res = await fetch(`${baseUrl}/${entity.name}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(options.origin ? { "x-texo-origin": options.origin } : {}) },
      body: JSON.stringify(args),
    });
    if (res.status === 422) throw new StoreValidationError(ValidationBody.parse(await res.json()).issues);
    if (res.status === 404) throw new StoreNotFoundError(entity.name, String(args[0]));
    if (res.status === 409) throw new StoreReferenceError(entity.name, MessageBody.parse(await res.json()).message);
    if (!res.ok) throw new Error(`${method} ${entity.name}: ${res.status}`);
    const body = await res.json();
    return body === null ? undefined : body;
  }

  return {
    list: (entity, query) => call(entity, "list", [query ?? {}]) as never,
    get: (entity, id) => call(entity, "get", [id]) as never,
    create: (entity, input) => call(entity, "create", [input]) as never,
    update: (entity, id, patch) => call(entity, "update", [id, patch]) as never,
    remove: (entity, id) => call(entity, "remove", [id]) as never,
    subscribe(entity, fn) {
      if (subscribers++ === 0) connect();
      const unsub = bus.subscribe(entity, fn);
      return () => {
        unsub();
        if (--subscribers === 0) {
          disconnect?.();
          disconnect = undefined;
        }
      };
    },
  };
}

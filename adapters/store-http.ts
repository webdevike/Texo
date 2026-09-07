// Transport pair: `serveStore` exposes any Store over HTTP; `createHttpStore` is a Store that
// proxies to it. The client app never knows which adapter sits behind the server.
import { z } from "zod";
import type { Entity } from "../contracts/entity";
import { type Store, StoreNotFoundError, StoreValidationError } from "../contracts/store";

const ValidationBody = z.object({ issues: z.array(z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() })) });

const METHODS = ["list", "get", "create", "update", "remove"] as const;
type Method = (typeof METHODS)[number];

export function storeHandler(store: Store, entities: Record<string, Entity>) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const [, entityName, method] = url.pathname.split("/");
    const entity = entityName ? entities[entityName] : undefined;
    if (!entity || !METHODS.includes(method as Method) || req.method !== "POST") return new Response("not found", { status: 404 });
    const args = (await req.json()) as unknown[];
    try {
      const result = await (store[method as Method] as (...a: unknown[]) => Promise<unknown>)(entity, ...args);
      return Response.json(result === undefined ? null : result);
    } catch (e) {
      if (e instanceof StoreValidationError) return Response.json({ error: "validation", issues: e.issues }, { status: 422 });
      if (e instanceof StoreNotFoundError) return Response.json({ error: "not_found", message: e.message }, { status: 404 });
      throw e;
    }
  };
}

export function createHttpStore(baseUrl: string): Store {
  async function call(entity: Entity, method: Method, args: unknown[]) {
    const res = await fetch(`${baseUrl}/${entity.name}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(args),
    });
    if (res.status === 422) throw new StoreValidationError(ValidationBody.parse(await res.json()).issues);
    if (res.status === 404) throw new StoreNotFoundError(entity.name, String(args[0]));
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
  };
}

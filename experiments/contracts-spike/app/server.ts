// Host API on :4321. The Texo app on :4200 proxies /api here (vite.config.mts), so the
// shell you configure and the backend you configure are the same page.
//   /api/<entity>/<method>      ClientStore surface (storeHandler), scoped to the session's workspace
//   /api/_events                SSE change feed, same scope
//   /api/_auth/signup|login|logout|switch   POST   /api/_auth/me   GET
//   /api/_texo/manifest         GET  what the admin knows (public)
//   /api/_texo/specs            PUT  upsert an entity spec (validate → migrate → write file); owner only
//   /api/_texo/specs/<name>     DELETE; owner only
//   /api/_texo/settings/<key>   GET / PUT, per workspace
// Every data route needs a session (401 otherwise). Scope comes from scopeOf(session); actorId
// is the client's `x-texo-origin` when it sends one (SSE echo-drop), else the user id.
import { z } from "zod";
import { createCookieAuth } from "../adapters/auth-cookie";
import { storeHandler } from "../adapters/store-http";
import { AuthError, type Session, scopeOf } from "../contracts/auth";
import type { Entity } from "../contracts/entity";
import { type Store, StoreSchemaError } from "../contracts/store";
import { manifest } from "../host/manifest";
import { readSetting, setting, writeSetting } from "../host/settings";
import { createSpecRegistry, type Registry } from "../host/specs";
import { specsDir, store } from "./texo.config";

const PORT = Number(process.env.TEXO_PORT ?? 4321);

// W1Relations: migrate relation targets before the entities that reference them, so a spec
// like issue -> project/member boots regardless of file order (sqlite refuses a relation to an
// entity it has not seen yet).
async function migrateAll(reg: Registry, s: Store) {
  const done = new Set<string>();
  const byName = new Map(reg.all().map((e) => [e.name, e]));
  const visit = async (e: Entity, trail: Set<string>) => {
    if (done.has(e.name) || trail.has(e.name)) return;
    trail.add(e.name);
    for (const f of e.fields) {
      const target = f.kind === "relation" ? byName.get(f.to) : undefined;
      if (target) await visit(target, trail);
    }
    if (!done.has(e.name)) await s.migrate(e);
    done.add(e.name);
  };
  for (const e of byName.values()) await visit(e, new Set());
}
// end W1Relations

await store.migrate(setting);
const registry = createSpecRegistry(specsDir, store);
await migrateAll(registry, store);


const auth = createCookieAuth(store);
if (await auth.empty()) {
  await auth.signup("demo@texo.dev", "demo1234", "Demo", "Demo");
  console.log("seeded first user: demo@texo.dev / demo1234 (workspace Demo)");
}

async function requireSession(req: Request): Promise<Session> {
  const session = await auth.authenticate(req);
  if (!session) throw new AuthError(401, "sign in required");
  return session;
}

async function scopedStore(req: Request): Promise<Store> {
  const session = await requireSession(req);
  return store.scoped({ ...scopeOf(session), actorId: req.headers.get("x-texo-origin") ?? session.user.id });
}

const api = storeHandler(scopedStore, (name) => (name === setting.name ? setting : registry.get(name)));

const Credentials = z.object({ email: z.string().min(3), password: z.string().min(1) });
const Signup = Credentials.extend({ name: z.string().default(""), workspaceName: z.string().min(1) });

function withCredential(session: Session, credential: string): Response {
  return Response.json(session, { headers: { "set-cookie": credential } });
}

async function authRoute(req: Request, action: string): Promise<Response> {
  if (action === "me" && req.method === "GET") return Response.json(await auth.authenticate(req));
  if (req.method !== "POST") return new Response("not found", { status: 404 });
  if (action === "login") {
    const { email, password } = Credentials.parse(await req.json());
    const result = await auth.login(email, password);
    if (!result) throw new AuthError(401, "wrong email or password");
    return withCredential(result.session, result.credential);
  }
  if (action === "signup") {
    const { email, password, name, workspaceName } = Signup.parse(await req.json());
    const result = await auth.signup(email, password, name, workspaceName);
    return withCredential(result.session, result.credential);
  }
  if (action === "logout") return Response.json(null, { headers: { "set-cookie": await auth.logout(req) } });
  if (action === "switch") {
    const { workspaceId } = z.object({ workspaceId: z.string().min(1) }).parse(await req.json());
    const result = await auth.switchWorkspace(req, workspaceId);
    if (!result) throw new AuthError(403, "not a member of that workspace");
    return withCredential(result.session, result.credential);
  }
  return new Response("not found", { status: 404 });
}

async function texo(req: Request, path: string): Promise<Response> {
  const [head, arg] = path.split("/");
  if (head === "manifest" && req.method === "GET") return Response.json(manifest(registry, store, [setting.name]));
  if (head === "specs") {
    const session = await requireSession(req);
    if ((await auth.role(session)) !== "owner") throw new AuthError(403, "only a workspace owner may change the schema");
    if (req.method === "PUT") {
      try {
        const entity = await registry.put(await req.json());
        return Response.json({ ok: true, name: entity.name });
      } catch (e) {
        if (e instanceof z.ZodError) return Response.json({ error: "invalid_spec", issues: e.issues }, { status: 422 });
        if (e instanceof StoreSchemaError) return Response.json({ error: "schema", message: e.message }, { status: 409 });
        throw e;
      }
    }
    if (arg && req.method === "DELETE") {
      registry.remove(arg);
      return Response.json({ ok: true });
    }
  }
  if (head === "settings" && arg) {
    const scoped = await scopedStore(req);
    if (req.method === "GET") return Response.json(await readSetting(scoped, arg, {}));
    if (req.method === "PUT") {
      await writeSetting(scoped, arg, await req.json());
      return Response.json({ ok: true });
    }
  }
  return new Response("not found", { status: 404 });
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith("/api/_auth/")) return await authRoute(req, url.pathname.slice("/api/_auth/".length));
      if (url.pathname.startsWith("/api/_texo/")) return await texo(req, url.pathname.slice("/api/_texo/".length));
      if (url.pathname.startsWith("/api/")) return await api(new Request(`${url.origin}${url.pathname.slice(4)}${url.search}`, req));
      return new Response("not found", { status: 404 });
    } catch (e) {
      if (e instanceof AuthError) return Response.json({ error: "auth", message: e.message }, { status: e.status });
      if (e instanceof z.ZodError) return Response.json({ error: "invalid", issues: e.issues }, { status: 422 });
      throw e;
    }
  },
});

console.log(`texo host on http://localhost:${server.port} (API only; UI is the Texo app on :4200)`);

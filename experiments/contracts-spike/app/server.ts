// Host API on :4321. The Texo app on :4200 proxies /api here (vite.config.mts), so the
// shell you configure and the backend you configure are the same page.
//   /api/<entity>/<method>      ClientStore surface (storeHandler)
//   /api/_texo/manifest         GET  what the admin knows
//   /api/_texo/specs            PUT  upsert an entity spec (validate → migrate → write file)
//   /api/_texo/specs/<name>     DELETE
//   /api/_texo/settings/<key>   GET / PUT
import { z } from "zod";
import { storeHandler } from "../adapters/store-http";
import type { Entity } from "../contracts/entity";
import { StoreSchemaError } from "../contracts/store";
import { manifest } from "../host/manifest";
import { readSetting, setting, writeSetting } from "../host/settings";
import { createSpecRegistry } from "../host/specs";
import { specsDir, store } from "./texo.config";

await store.migrate(setting);
const registry = createSpecRegistry(specsDir, store);
await migrateAll(registry, store);

// W1Relations: migrate relation targets before the entities that reference them, so a spec
// like issue -> project/member boots regardless of file order (sqlite refuses a relation to an
// entity it has not seen yet).
async function migrateAll(reg: { all(): Entity[] }, s: { migrate(e: Entity): Promise<void> }) {
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

const api = storeHandler(() => store, (name) => (name === setting.name ? setting : registry.get(name)));

async function texo(req: Request, path: string): Promise<Response> {
  const [head, arg] = path.split("/");
  if (head === "manifest" && req.method === "GET") return Response.json(manifest(registry, store, [setting.name]));
  if (head === "specs" && req.method === "PUT") {
    try {
      const entity = await registry.put(await req.json());
      return Response.json({ ok: true, name: entity.name });
    } catch (e) {
      if (e instanceof z.ZodError) return Response.json({ error: "invalid_spec", issues: e.issues }, { status: 422 });
      if (e instanceof StoreSchemaError) return Response.json({ error: "schema", message: e.message }, { status: 409 });
      throw e;
    }
  }
  if (head === "specs" && arg && req.method === "DELETE") {
    registry.remove(arg);
    return Response.json({ ok: true });
  }
  if (head === "settings" && arg) {
    if (req.method === "GET") return Response.json(await readSetting(store, arg, {}));
    if (req.method === "PUT") {
      await writeSetting(store, arg, await req.json());
      return Response.json({ ok: true });
    }
  }
  return new Response("not found", { status: 404 });
}

const server = Bun.serve({
  port: 4331,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/_texo/")) return texo(req, url.pathname.slice("/api/_texo/".length));
    if (url.pathname.startsWith("/api/")) return api(new Request(`${url.origin}${url.pathname.slice(4)}${url.search}`, req));
    return new Response("not found", { status: 404 });
  },
});

console.log(`texo host on http://localhost:${server.port} (API only; UI is the Texo app on :4200)`);

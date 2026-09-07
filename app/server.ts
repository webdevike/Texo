// Bun server: serves the app + admin bundles and exposes the host over /api.
//   /api/<entity>/<method>      ClientStore surface (storeHandler)
//   /api/_texo/manifest         GET  what the admin knows
//   /api/_texo/specs            PUT  upsert an entity spec (validate → migrate → write file)
//   /api/_texo/specs/<name>     DELETE
//   /api/_texo/settings/<key>   GET / PUT
import { storeHandler } from "../adapters/store-http";
import { StoreSchemaError } from "../contracts/store";
import { manifest } from "../host/manifest";
import { defaultTheme, readSetting, setting, writeSetting } from "../host/settings";
import { createSpecRegistry } from "../host/specs";
import { specsDir, store } from "./texo.config";
import admin from "./admin.html";
import index from "./index.html";
import { z } from "zod";

await store.migrate(setting);
const registry = createSpecRegistry(specsDir, store);
for (const entity of registry.all()) await store.migrate(entity);

const api = storeHandler(store, (name) => (name === setting.name ? setting : registry.get(name)));
const settingDefaults: Record<string, unknown> = { theme: defaultTheme };

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
    if (req.method === "GET") return Response.json(await readSetting(store, arg, settingDefaults[arg] ?? {}));
    if (req.method === "PUT") {
      await writeSetting(store, arg, await req.json());
      return Response.json({ ok: true });
    }
  }
  return new Response("not found", { status: 404 });
}

const server = Bun.serve({
  port: 4321,
  routes: { "/": index, "/admin": admin, "/admin/*": admin },
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/_texo/")) return texo(req, url.pathname.slice("/api/_texo/".length));
    if (url.pathname.startsWith("/api/")) return api(new Request(`${url.origin}${url.pathname.slice(4)}${url.search}`, req));
    return new Response("not found", { status: 404 });
  },
});

console.log(`texo-spike on http://localhost:${server.port}  admin at /admin`);

// Bun server: serves the client bundle and exposes the Store over /api.
import { storeHandler } from "../adapters/store-http";
import { entities, store } from "./texo.config";
import index from "./index.html";

const api = storeHandler(store, entities);

const server = Bun.serve({
  port: 4321,
  routes: { "/": index },
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) return api(new Request(`${url.origin}${url.pathname.slice(4)}${url.search}`, req));
    return new Response("not found", { status: 404 });
  },
});

console.log(`texo-spike on http://localhost:${server.port}`);

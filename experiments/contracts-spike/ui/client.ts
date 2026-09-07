// Browser-side host client: manifest, specs, settings. The UI never imports texo.config.
import { defineEntity, type Entity, type EntitySpec } from "../contracts/entity";
import type { Manifest } from "../host/manifest";

const base = "/api/_texo";

async function ok(res: Response) {
  if (res.ok) return res.json();
  const body = await res.json().catch(() => ({}));
  throw new Error(body.message ?? (body.issues ? body.issues.map((i: { path: unknown[]; message: string }) => `${i.path.join(".")}: ${i.message}`).join("; ") : `${res.status}`));
}

export const host = {
  manifest: (): Promise<Manifest> => fetch(`${base}/manifest`).then(ok),
  putSpec: (spec: EntitySpec): Promise<void> => fetch(`${base}/specs`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(spec) }).then(ok),
  deleteSpec: (name: string): Promise<void> => fetch(`${base}/specs/${name}`, { method: "DELETE" }).then(ok),
  getSetting: <T>(key: string): Promise<T> => fetch(`${base}/settings/${key}`).then(ok),
  putSetting: (key: string, value: unknown): Promise<void> => fetch(`${base}/settings/${key}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(value) }).then(ok),
};

export type { Manifest };

/** Manifest specs are wire data; the UI needs real entities (zod derived) for forms. */
export function entitiesOf(m: Manifest): Entity[] {
  return m.entities.map(defineEntity);
}

// Browser-side host client: manifest, specs, settings. The UI never imports texo.config.
// Every call sends the session cookie (credentials: include) so the host can scope it.
// Auth calls live in auth-client.ts (the AuthClient contract) and share `ok`/`HostError`.
import { defineEntity, type Entity, type EntitySpec } from "../../experiments/contracts-spike/contracts/entity";
import type { Manifest } from "../../experiments/contracts-spike/host/manifest";

const base = "/api/_texo";

export class HostError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "HostError";
  }
}

export async function ok<T = unknown>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const body = await res.json().catch(() => ({}));
  throw new HostError(res.status, body.message ?? (body.issues ? body.issues.map((i: { path: unknown[]; message: string }) => `${i.path.join(".")}: ${i.message}`).join("; ") : `${res.status}`));
}

export function json(body: unknown): RequestInit {
  return { credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

export const host = {
  manifest: (): Promise<Manifest> => fetch(`${base}/manifest`, { credentials: "include" }).then(ok<Manifest>),
  putSpec: (spec: EntitySpec): Promise<void> => fetch(`${base}/specs`, { method: "PUT", ...json(spec) }).then(ok<void>),
  deleteSpec: (name: string): Promise<void> => fetch(`${base}/specs/${name}`, { method: "DELETE", credentials: "include" }).then(ok<void>),
  getSetting: <T>(key: string): Promise<T> => fetch(`${base}/settings/${key}`, { credentials: "include" }).then(ok<T>),
  putSetting: (key: string, value: unknown): Promise<void> => fetch(`${base}/settings/${key}`, { method: "PUT", ...json(value) }).then(ok<void>),
};

export type { Manifest };

/** Manifest specs are wire data; the UI needs real entities (zod derived) for forms. */
export function entitiesOf(m: Manifest): Entity[] {
  return m.entities.map(defineEntity);
}

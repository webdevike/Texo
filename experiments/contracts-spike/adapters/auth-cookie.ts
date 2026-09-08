// Reference AuthProvider: signed cookie session, users/workspaces/memberships as system
// entities through the SAME Store contract (P6). Everything auth owns lives in one fixed
// scope `{ workspaceId: "_auth" }`, so the auth tables are partitioned away from app data
// and the host never has to special-case them.
//   cookie:  texo_session=<sessionId>.<hmac-sha256(sessionId)>
//   secret:  TEXO_SESSION_SECRET (dev default when unset)
import { createHmac, timingSafeEqual } from "node:crypto";
import { AuthError, type AuthProvider, type Session, type Workspace } from "../contracts/auth";
import { defineEntity, type Row } from "../contracts/entity";
import type { Store } from "../contracts/store";

export const AUTH_SCOPE = { workspaceId: "_auth" } as const;
export const SESSION_COOKIE = "texo_session";
const DEV_SECRET = "texo-dev-secret-change-me";
const DAY = 24 * 60 * 60 * 1000;

export const user = defineEntity({
  name: "_user",
  title: "email",
  fields: [
    { name: "email", kind: "string", min: 3 },
    { name: "name", kind: "string", min: 1 },
    { name: "password_hash", kind: "string", min: 1 },
  ],
});
export const workspace = defineEntity({
  name: "_workspace",
  title: "name",
  fields: [
    { name: "slug", kind: "string", min: 1 },
    { name: "name", kind: "string", min: 1 },
  ],
});
export const membership = defineEntity({
  name: "_membership",
  title: "role",
  fields: [
    { name: "user", kind: "relation", to: "_user" },
    { name: "workspace", kind: "relation", to: "_workspace" },
    { name: "role", kind: "enum", options: ["owner", "member"] },
  ],
});
export const session = defineEntity({
  name: "_session",
  title: "expires",
  fields: [
    { name: "user", kind: "relation", to: "_user" },
    { name: "workspace", kind: "relation", to: "_workspace" },
    { name: "expires", kind: "date" },
  ],
});
/** Auth's system entities in migration order (relation targets first). */
export const authEntities = [user, workspace, membership, session];

export type Role = "owner" | "member";

export interface CookieAuthOptions {
  secret?: string;
  /** Session lifetime in ms. Default 30 days. */
  ttl?: number;
}

/** The reference provider adds what the frozen Session lacks: the actor's role in the current workspace. */
export interface CookieAuth extends AuthProvider {
  role(session: Session): Promise<Role | null>;
  /** True when no user exists yet (host seeds a demo account). */
  empty(): Promise<boolean>;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "workspace";
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

export function createCookieAuth(base: Store, options: CookieAuthOptions = {}): CookieAuth {
  const secret = options.secret ?? process.env.TEXO_SESSION_SECRET ?? DEV_SECRET;
  const ttl = options.ttl ?? 30 * DAY;
  const store = base.scoped(AUTH_SCOPE);
  let ready: Promise<void> | undefined;
  const prepare = () => (ready ??= (async () => {
    for (const e of authEntities) await store.migrate(e);
  })());

  const sign = (id: string) => createHmac("sha256", secret).update(id).digest("base64url");
  const verify = (token: string | undefined): string | undefined => {
    if (!token) return undefined;
    const dot = token.lastIndexOf(".");
    if (dot < 0) return undefined;
    const id = token.slice(0, dot);
    const given = Buffer.from(token.slice(dot + 1));
    const expected = Buffer.from(sign(id));
    return given.length === expected.length && timingSafeEqual(given, expected) ? id : undefined;
  };
  const setCookie = (id: string) => `${SESSION_COOKIE}=${id}.${sign(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(ttl / 1000)}`;
  const clearCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

  async function workspacesOf(userId: string): Promise<Workspace[]> {
    const { rows } = await store.list(membership, { where: { user: userId }, limit: 1000 });
    const out: Workspace[] = [];
    for (const m of rows) {
      const w = await store.get(workspace, String(m.workspace));
      if (w) out.push({ id: w.id, slug: String(w.slug), name: String(w.name) });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  async function sessionOf(userId: string, workspaceId: string): Promise<Session | null> {
    const u = await store.get(user, userId);
    if (!u) return null;
    const workspaces = await workspacesOf(userId);
    const current = workspaces.find((w) => w.id === workspaceId);
    if (!current) return null;
    return { user: { id: u.id, email: String(u.email), name: String(u.name) }, workspace: current, workspaces };
  }

  async function mint(userId: string, workspaceId: string): Promise<{ session: Session; credential: string } | null> {
    const s = await sessionOf(userId, workspaceId);
    if (!s) return null;
    const row = await store.create(session, { user: userId, workspace: workspaceId, expires: new Date(Date.now() + ttl).toISOString() });
    return { session: s, credential: setCookie(row.id) };
  }

  async function sessionRow(req: Request): Promise<Row | undefined> {
    await prepare();
    const id = verify(readCookie(req, SESSION_COOKIE));
    if (!id) return undefined;
    const row = await store.get(session, id);
    if (!row) return undefined;
    if (Date.parse(String(row.expires)) < Date.now()) {
      await store.remove(session, id);
      return undefined;
    }
    return row;
  }

  return {
    kind: "cookie (signed session id, users in store scope _auth)",

    async authenticate(req) {
      const row = await sessionRow(req);
      if (!row) return null;
      return sessionOf(String(row.user), String(row.workspace));
    },

    async login(email, password) {
      await prepare();
      const [u] = (await store.list(user, { where: { email: email.trim().toLowerCase() }, limit: 1 })).rows;
      if (!u) return null;
      if (!(await Bun.password.verify(password, String(u.password_hash)))) return null;
      const [w] = await workspacesOf(u.id);
      if (!w) return null;
      return mint(u.id, w.id);
    },

    async signup(email, password, name, workspaceName) {
      await prepare();
      const normalized = email.trim().toLowerCase();
      if (!normalized.includes("@")) throw new AuthError(403, "invalid email");
      if (password.length < 8) throw new AuthError(403, "password must be at least 8 characters");
      if ((await store.list(user, { where: { email: normalized }, limit: 1 })).total > 0) throw new AuthError(403, "email already registered");
      const u = await store.create(user, { email: normalized, name: name.trim() || normalized, password_hash: await Bun.password.hash(password) });
      const w = await store.create(workspace, { slug: slugify(workspaceName), name: workspaceName.trim() || "Workspace" });
      await store.create(membership, { user: u.id, workspace: w.id, role: "owner" });
      return (await mint(u.id, w.id))!;
    },

    async logout(req) {
      const row = await sessionRow(req);
      if (row) await store.remove(session, row.id);
      return clearCookie;
    },

    async switchWorkspace(req, workspaceId) {
      const row = await sessionRow(req);
      if (!row) return null;
      const next = await sessionOf(String(row.user), workspaceId);
      if (!next) return null;
      await store.update(session, row.id, { workspace: workspaceId });
      return { session: next, credential: setCookie(row.id) };
    },

    async role(s) {
      await prepare();
      const [m] = (await store.list(membership, { where: { user: s.user.id, workspace: s.workspace.id }, limit: 1 })).rows;
      return m ? (String(m.role) as Role) : null;
    },

    async empty() {
      await prepare();
      return (await store.list(user, { limit: 1 })).total === 0;
    },
  };
}

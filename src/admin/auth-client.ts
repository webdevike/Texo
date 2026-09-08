// AuthClient over fetch against the host's /api/_auth routes. The cookie is HttpOnly, so the
// browser carries it; every call sends credentials and the host sets/clears the cookie.
import type { AuthClient, Session } from "../../experiments/contracts-spike/contracts/auth";
import { json, ok } from "./client";

const base = "/api/_auth";

export const authClient: AuthClient = {
  me: () => fetch(`${base}/me`, { credentials: "include" }).then(ok<Session | null>),
  login: (email, password) => fetch(`${base}/login`, { method: "POST", ...json({ email, password }) }).then(ok<Session>),
  signup: (email, password, name, workspaceName) => fetch(`${base}/signup`, { method: "POST", ...json({ email, password, name, workspaceName }) }).then(ok<Session>),
  logout: () => fetch(`${base}/logout`, { method: "POST", credentials: "include" }).then(ok<null>).then(() => undefined),
  switchWorkspace: (workspaceId) => fetch(`${base}/switch`, { method: "POST", ...json({ workspaceId }) }).then(ok<Session>),
};

export type { Session };

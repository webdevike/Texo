// FROZEN SURFACE (2026-09-07, wave 1). Auth + workspace scoping, adapter-agnostic.
//
// Host side: an `AuthProvider` turns a request into a `Session` (or null). The host derives the
// Store `Scope` from the session's workspace and binds every ClientStore call to it, so
// adapters never see auth, only scope. Client side: `AuthClient` is what the UI calls.
// Reference adapter (wave 1 slice F): cookie session + users/workspaces as `_user`,
// `_workspace`, `_membership` system entities through the SAME Store contract (P6 pattern).
import type { Scope } from "./store";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Workspace {
  id: string;
  slug: string;
  name: string;
}

export interface Session {
  user: User;
  workspace: Workspace;
  /** Workspaces the user may switch to. */
  workspaces: Workspace[];
}

export interface AuthProvider {
  readonly kind: string;
  /** Resolve the session for a request, or null when anonymous. */
  authenticate(req: Request): Promise<Session | null>;
  /** Mint a session; returns the Set-Cookie header value (or token) the transport should attach. */
  login(email: string, password: string): Promise<{ session: Session; credential: string } | null>;
  signup(email: string, password: string, name: string, workspaceName: string): Promise<{ session: Session; credential: string }>;
  logout(req: Request): Promise<string>;
  switchWorkspace(req: Request, workspaceId: string): Promise<{ session: Session; credential: string } | null>;
}

export interface AuthClient {
  me(): Promise<Session | null>;
  login(email: string, password: string): Promise<Session>;
  signup(email: string, password: string, name: string, workspaceName: string): Promise<Session>;
  logout(): Promise<void>;
  switchWorkspace(workspaceId: string): Promise<Session>;
}

export function scopeOf(session: Session): Scope {
  return { workspaceId: session.workspace.id, actorId: session.user.id };
}

export class AuthError extends Error {
  constructor(public readonly status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// Adapter-agnostic behavioral suite for AuthProvider. Every provider must pass it unchanged.
//   runAuthConformance("cookie/sqlite", () => { const store = createSqliteStore(); return { provider: createCookieAuth(store), store }; })
// The factory returns a FRESH provider per call plus the Store the host would scope by
// `scopeOf(session)`, so the suite can prove that two users in two workspaces never see each
// other's rows through the store contract alone.
import { describe, expect, test } from "bun:test";
import { type AuthProvider, scopeOf } from "./auth";
import { defineEntity } from "./entity";
import type { Store } from "./store";

export const conformanceNote = defineEntity({
  name: "auth_conformance_note",
  title: "text",
  fields: [{ name: "text", kind: "string", min: 1 }],
});

/** Build a request carrying the credential a provider handed back (cookie header from a Set-Cookie value). */
export function withCredential(credential: string, init: RequestInit = {}): Request {
  const cookie = credential.split(";")[0] ?? "";
  return new Request("http://auth.test/", { ...init, headers: { ...(init.headers as Record<string, string>), cookie } });
}

export function runAuthConformance(label: string, factory: () => { provider: AuthProvider; store: Store }) {
  describe(`auth conformance: ${label}`, () => {
    test("signup mints a session and me() resolves it", async () => {
      const { provider } = factory();
      const { session, credential } = await provider.signup("ann@example.com", "password1", "Ann", "Ann Co");
      expect(session.user.email).toBe("ann@example.com");
      expect(session.user.name).toBe("Ann");
      expect(session.workspace.name).toBe("Ann Co");
      expect(session.workspaces.map((w) => w.id)).toEqual([session.workspace.id]);
      expect(credential.length).toBeGreaterThan(0);

      const me = await provider.authenticate(withCredential(credential));
      expect(me?.user.id).toBe(session.user.id);
      expect(me?.workspace.id).toBe(session.workspace.id);
    });

    test("anonymous request has no session", async () => {
      const { provider } = factory();
      expect(await provider.authenticate(new Request("http://auth.test/"))).toBeNull();
      expect(await provider.authenticate(withCredential("texo_session=forged.signature"))).toBeNull();
    });

    test("login succeeds with the right password and rejects the wrong one", async () => {
      const { provider } = factory();
      await provider.signup("bob@example.com", "correct-horse", "Bob", "Bob Co");
      expect(await provider.login("bob@example.com", "wrong-horse")).toBeNull();
      expect(await provider.login("nobody@example.com", "correct-horse")).toBeNull();
      const ok = await provider.login("bob@example.com", "correct-horse");
      expect(ok?.session.user.email).toBe("bob@example.com");
      const me = await provider.authenticate(withCredential(ok!.credential));
      expect(me?.user.email).toBe("bob@example.com");
    });

    test("signup refuses a duplicate email", async () => {
      const { provider } = factory();
      await provider.signup("dup@example.com", "password1", "One", "One Co");
      await expect(provider.signup("dup@example.com", "password2", "Two", "Two Co")).rejects.toThrow();
    });

    test("logout invalidates the session", async () => {
      const { provider } = factory();
      const { credential } = await provider.signup("cat@example.com", "password1", "Cat", "Cat Co");
      const req = withCredential(credential);
      expect(await provider.authenticate(req)).not.toBeNull();
      const cleared = await provider.logout(req);
      expect(typeof cleared).toBe("string");
      expect(await provider.authenticate(withCredential(credential))).toBeNull();
    });

    test("switchWorkspace to a non-member workspace returns null; to a member workspace rebinds", async () => {
      const { provider } = factory();
      const dan = await provider.signup("dan@example.com", "password1", "Dan", "Dan Co");
      const eve = await provider.signup("eve@example.com", "password1", "Eve", "Eve Co");
      const danReq = withCredential(dan.credential);
      expect(await provider.switchWorkspace(danReq, eve.session.workspace.id)).toBeNull();
      expect(await provider.switchWorkspace(danReq, "missing-workspace")).toBeNull();
      const same = await provider.switchWorkspace(danReq, dan.session.workspace.id);
      expect(same?.session.workspace.id).toBe(dan.session.workspace.id);
      // The original credential still resolves to Dan after a refused switch.
      expect((await provider.authenticate(danReq))?.workspace.id).toBe(dan.session.workspace.id);
    });

    test("two users in two workspaces cannot see each other's rows through scopeOf(session)", async () => {
      const { provider, store } = factory();
      await store.migrate(conformanceNote);
      const fay = await provider.signup("fay@example.com", "password1", "Fay", "Fay Co");
      const gus = await provider.signup("gus@example.com", "password1", "Gus", "Gus Co");
      const fayStore = store.scoped(scopeOf(fay.session));
      const gusStore = store.scoped(scopeOf(gus.session));

      const fayNote = await fayStore.create(conformanceNote, { text: "fay only" });
      await gusStore.create(conformanceNote, { text: "gus only" });

      expect((await fayStore.list(conformanceNote)).rows.map((r) => r.text)).toEqual(["fay only"]);
      expect((await gusStore.list(conformanceNote)).rows.map((r) => r.text)).toEqual(["gus only"]);
      expect(await gusStore.get(conformanceNote, fayNote.id)).toBeUndefined();
      await expect(gusStore.update(conformanceNote, fayNote.id, { text: "stolen" })).rejects.toThrow();
      expect((await fayStore.get(conformanceNote, fayNote.id))?.text).toBe("fay only");
    });
  });
}

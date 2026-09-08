import { describe, expect, test } from "bun:test";
import { runAuthConformance, withCredential } from "../contracts/auth.conformance";
import { AUTH_SCOPE, createCookieAuth, user } from "./auth-cookie";
import { createMemoryStore } from "./store-memory";
import { createSqliteStore } from "./store-sqlite";

runAuthConformance("cookie/sqlite", () => {
  const store = createSqliteStore(":memory:");
  return { provider: createCookieAuth(store, { secret: "test" }), store };
});
runAuthConformance("cookie/memory", () => {
  const store = createMemoryStore();
  return { provider: createCookieAuth(store, { secret: "test" }), store };
});

describe("cookie auth specifics", () => {
  test("a cookie signed with another secret is rejected", async () => {
    const store = createSqliteStore(":memory:");
    const a = createCookieAuth(store, { secret: "a" });
    const b = createCookieAuth(store, { secret: "b" });
    const { credential } = await a.signup("x@example.com", "password1", "X", "X Co");
    expect(await a.authenticate(withCredential(credential))).not.toBeNull();
    expect(await b.authenticate(withCredential(credential))).toBeNull();
  });

  test("an expired session no longer authenticates", async () => {
    const auth = createCookieAuth(createSqliteStore(":memory:"), { secret: "t", ttl: -1000 });
    const { credential } = await auth.signup("y@example.com", "password1", "Y", "Y Co");
    expect(await auth.authenticate(withCredential(credential))).toBeNull();
  });

  test("users live in the _auth scope, never in the default app scope", async () => {
    const store = createSqliteStore(":memory:");
    const auth = createCookieAuth(store, { secret: "t" });
    await auth.signup("z@example.com", "password1", "Z", "Z Co");
    expect((await store.list(user)).total).toBe(0);
    expect((await store.scoped(AUTH_SCOPE).list(user)).total).toBe(1);
    expect(await auth.empty()).toBe(false);
    expect(await auth.role((await auth.login("z@example.com", "password1"))!.session)).toBe("owner");
  });
});

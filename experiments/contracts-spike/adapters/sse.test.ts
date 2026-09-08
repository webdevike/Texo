// Two http clients against one Bun.serve + sqlite host: what A writes, B sees over SSE, in order,
// promptly; A's own echo is dropped when it names an origin; the host survives a client leaving.
// A real network round trip is the thing under test, so this file measures wall-clock latency
// and prints it; the assertions still key off delivered events, never off a sleep.
import { afterAll, describe, expect, test } from "bun:test";
import { conformanceEntities, conformanceTask as task } from "../contracts/store.conformance";
import type { ChangeEvent, ClientStore, Scope } from "../contracts/store";
import { createHttpStore, storeHandler } from "./store-http";
import { createSqliteStore } from "./store-sqlite";

const root = createSqliteStore(":memory:");
for (const e of conformanceEntities) await root.migrate(e);

// Same rule W1Auth puts in app/server.ts: the origin header becomes the scope's actorId, which the
// adapters stamp on every event they emit, which `/_events?origin=` compares against.
const scoped = new Map<string, ClientStore>();
const server = Bun.serve({
  port: 0,
  fetch: storeHandler(
    (req) => {
      const origin = req.headers.get("x-texo-origin") ?? undefined;
      if (!origin) return root;
      let s = scoped.get(origin);
      if (!s) scoped.set(origin, (s = root.scoped({ workspaceId: "default", actorId: origin } satisfies Scope)));
      return s;
    },
    (name) => conformanceEntities.find((e) => e.name === name),
  ),
});
afterAll(() => server.stop(true));
const base = `http://localhost:${server.port}`;

/** Collect events; `count(n)` resolves once n have arrived. */
function collect(store: ClientStore) {
  const events: ChangeEvent[] = [];
  const stamps: number[] = [];
  let want = 0;
  let notify = () => {};
  const stop = store.subscribe(null, (e) => {
    events.push(e);
    stamps.push(performance.now());
    if (events.length >= want) notify();
  });
  return {
    events,
    stamps,
    stop,
    count: (n: number) => {
      const { promise, resolve } = Promise.withResolvers<void>();
      want = n;
      notify = resolve;
      if (events.length >= n) resolve();
      return promise;
    },
  };
}

/** The SSE reader connects asynchronously; a probe write tells us the client is really listening. */
async function connected(store: ClientStore) {
  let onEvent = (_e: ChangeEvent) => {};
  const stop = store.subscribe(null, (e) => onEvent(e));
  for (;;) {
    const first = Promise.withResolvers<true>();
    onEvent = () => first.resolve(true);
    const r = await root.create(task, { title: "probe", priority: 0, status: "todo" });
    const won = await Promise.race([first.promise, new Promise<false>((res) => setTimeout(() => res(false), 20))]);
    // Wait for the probe's removal too, so no late event lands after the caller takes its baseline.
    const removed = Promise.withResolvers<void>();
    onEvent = (e) => {
      if (e.kind === "removed" && e.id === r.id) removed.resolve();
    };
    await root.remove(task, r.id);
    if (!won) continue;
    await removed.promise;
    break;
  }
  stop();
}

describe("two http clients over one host", () => {
  test("B receives A's create/update/remove in order within 200ms; A does not see its own echoes", async () => {
    const a = createHttpStore(base, { origin: "client-a" });
    const b = createHttpStore(base, { origin: "client-b" });
    const seenByA = collect(a);
    const seenByB = collect(b);
    await connected(b);
    await connected(a);
    const baseline = seenByB.events.length;

    const three = seenByB.count(baseline + 3);
    const sent: number[] = [];
    sent.push(performance.now());
    const row = await a.create(task, { title: "from a", priority: 1, status: "todo" });
    sent.push(performance.now());
    await a.update(task, row.id, { done: true });
    sent.push(performance.now());
    await a.remove(task, row.id);
    await three;

    const got = seenByB.events.slice(baseline);
    expect(got.map((e) => e.kind)).toEqual(["created", "updated", "removed"]);
    expect(got.every((e) => e.id === row.id && e.entity === task.name && e.origin === "client-a")).toBe(true);
    expect(got[0]!.row?.title).toBe("from a");
    expect(got[1]!.row?.done).toBe(true);
    const latencies = seenByB.stamps.slice(baseline).map((t, i) => t - sent[i]!);
    console.log(`SSE propagation A -> B (ms, write start to B listener): ${latencies.map((l) => l.toFixed(1)).join(", ")}`);
    for (const l of latencies) expect(l).toBeLessThan(200);

    // A's own writes never came back to A (only the probe rows written by the root store did).
    expect(seenByA.events.filter((e) => e.id === row.id)).toHaveLength(0);
    seenByA.stop();
    seenByB.stop();
  });

  test("a client without origin sees every event including its own", async () => {
    const anon = createHttpStore(base);
    const seen = collect(anon);
    await connected(anon);
    const baseline = seen.events.length;
    const two = seen.count(baseline + 2);
    const row = await anon.create(task, { title: "loud", priority: 1, status: "todo" });
    await anon.remove(task, row.id);
    await two;
    expect(seen.events.slice(baseline).map((e) => e.kind)).toEqual(["created", "removed"]);
    seen.stop();
  });

  test("server survives a subscriber disconnecting mid-stream and keeps serving the other", async () => {
    const a = createHttpStore(base, { origin: "client-a" });
    const leaver = createHttpStore(base, { origin: "leaver" });
    const stayer = createHttpStore(base, { origin: "stayer" });
    const gone = collect(leaver);
    const kept = collect(stayer);
    await connected(leaver);
    await connected(stayer);
    gone.stop(); // aborts the fetch: the server's ReadableStream cancels

    const baseline = kept.events.length;
    const one = kept.count(baseline + 1);
    const row = await a.create(task, { title: "after leave", priority: 1, status: "todo" });
    await one;
    expect(kept.events.at(-1)!.id).toBe(row.id);
    expect(gone.events.filter((e) => e.id === row.id)).toHaveLength(0);
    await a.remove(task, row.id);
    expect((await a.list(task)).total).toBe(0);
    kept.stop();
  });
});

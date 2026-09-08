# Slice C: realtime on the frozen `subscribe` seam

Branch `eva/w1-c-realtime`, worktree `work/texo-w1-c-realtime`. Ports 4333 (host) / 4233 (vite), both stopped.

## What landed

| File | What |
|---|---|
| `experiments/contracts-spike/adapters/store-live.ts` | `createLiveStore(inner, options)`: a `ClientStore` decorator with a per-entity row cache, optimistic create/update/remove (temp id `tmp:<uuid>`, rollback on reject, reconcile with the returned row), one `inner.subscribe(null)` folded into the cache with `seq` dedupe, and `watch(entity, query, listener)` that re-evaluates the `ListQuery` locally via `adapters/query.ts` `evaluate`. Also `liveOf(store)` (one live view per store, memoized by WeakMap), `isTempId`, `isLiveStore`. |
| `experiments/contracts-spike/adapters/store-live.test.ts` | `runClientStoreConformance("live→memory")` (20 tests) plus 5 targeted tests: optimistic insert visible before the inner promise resolves, rollback restores the previous list for all three writes, an `updated` event moves a row between two watched queries (todo -> done), duplicate/stale `seq` is idempotent, own `created` echo before the call resolves does not double the row, `list` served from cache once an entity is complete. |
| `experiments/contracts-spike/adapters/sse.test.ts` | Two `createHttpStore` clients against one `Bun.serve` + sqlite host with the W1Auth origin rule (`x-texo-origin` -> `scope.actorId`). B sees A's create/update/remove in order, latency printed; A's own echoes are dropped; a client without origin sees its own events; the server survives a subscriber aborting mid-stream and keeps serving the other. |
| `experiments/contracts-spike/adapters/store-http.ts` | Transport fix (see "Contract hole"): SSE ping every 5s instead of 15s; `readSse` reconnects with backoff (250ms doubling to 5s, reset on bytes) when the stream ends, stops for good on abort or 401/403. No signature change. |
| `src/admin/hooks/use-live.ts` | `useLive(store, entity, query) -> { rows, total, loading }` over `liveOf(store).watch`. Query compared by value so literals are fine. Typed against `ClientStore`. |
| `src/admin/hooks/use-optimistic.ts` | `useOptimistic(store, entity) -> { create, update, remove, pending, pendingIds, error, isTemp }`. Writes go through the live cache; the hook only tracks in-flight state. |
| `src/admin/live-demo.tsx` | `/admin/live`: two panes, each `createLiveStore(createHttpStore('/api', { origin: 'pane-1' | 'pane-2' }))`, listing `issue` with add input, done checkbox, remove. Rows carry `data-id`/`data-row`/`data-done` for probes; temp rows show a `saving` badge. |
| `src/app/app.tsx` | One `<Route path="/admin/live">` line plus its import. |

Design notes on the cache:
- An entity becomes "complete" once one unfiltered, offset-0 `list` returned every row (`rows.length === total`). From then on `list`/`watch` for it are served locally and stay current through the feed; before that, `list` goes to the inner store and a watcher refetches on every change for its entity. `include` is served locally only when the target entities are complete too, so titles are never guessed.
- Watchers are notified once per microtask batch and only when the page actually changed (row identity compare), so a burst of events yields one render.
- Own-echo handling is structural, not origin-dependent: a `created` event whose content matches a pending temp row replaces it in place, so a client without an origin (or a host that does not stamp `actorId`) never shows two rows.

## Verified

`cd experiments/contracts-spike && bun test`: 99 pass, 0 fail (71 base + 25 live + 3 SSE), five consecutive runs. Printed by the SSE test each run: `SSE propagation A -> B (ms, write start to B listener): 0.7, 0.5, 0.3` (range over runs 0.2 to 2.8ms; assertion is < 200ms).

App typecheck (`tsc --noEmit -p tsconfig.app.json`): only the known pre-existing errors (texo-icons, texo-theme-provider primaryShade, replaceAll, custom-components-page, theme-controls). None in the new files.

Browser, http://localhost:4233/admin/live (host on 4333 via a temp wrapper that only overrides the port), all timings from in-page `MutationObserver` + `performance.now()` / `Date.now()`:

| Scenario | Result |
|---|---|
| Create in pane 1 -> visible in pane 2 (6 samples, alternating directions) | 74 to 90ms, every direction |
| Toggle done in pane 2 -> pane 1 row flips | 124ms |
| Create with `/issue/create` held 600ms by request interception | pane 1 shows temp row with `saving` badge at 64ms, reconciles to the real id at 730ms, never showed two rows; pane 2 at 730ms |
| Second browser tab on the same URL, write from tab 1 | tab 2 shows the row 103ms after the click (shared epoch clock) |
| 12s idle before writing (past Bun's 10s idle timeout) | still 277 to 280ms (first write after idle; steady state above) |

Screenshots in `experiments/reports/c-realtime/`: `tab1-two-panes.webp` (both panes in sync), `pane1-optimistic-saving.webp` (temp row dimmed with `saving` badge and `1 in flight`), `tab2-after-tab1-write.webp` (second tab holding the row tab 1 wrote, no reload).

## Contract hole found: SSE stream died silently after 10s idle

`storeHandler` pinged every 15s but `Bun.serve` defaults `idleTimeout` to 10s, so every `/api/_events` stream was closed by the server after 10s without traffic and `readSse` simply returned; the client never reconnected and the app went quietly stale. The unit suite never saw it because its tests finish in well under 10s. Reproduced with `curl -N` (exit at 12.0s) and in the browser (`dstVisibleMs: -1` after the first ten seconds).

Fix, both in `adapters/store-http.ts` (cleared with Main, W1Auth, W1Query, W1Extensions; nobody else edits it): ping every 5s, and reconnect with backoff on stream end. Reconnect stops on 401/403 per W1Auth so an expired session does not loop. The frozen `ClientStore.subscribe` contract is unchanged. The hosts on `app/server.ts` would also be safer with `idleTimeout` raised on `Bun.serve`; I did not touch that file (W1Auth owns it) and the ping alone is sufficient.

## Open

- Reconnect resumes from nothing: events emitted while disconnected are lost. The SSE frames already carry `id: <seq>`; a `Last-Event-ID` replay on the host side needs server-held history, which the contract does not require. The live cache would need a refetch-on-reconnect hook to heal (it already handles a full unfiltered refresh correctly, including removals).
- `useOptimistic.pendingIds` covers update/remove; creates are identified by `isTemp(row.id)` instead, which is what the row already exposes.
- The local `include` path serves `{ id, title }` only when the target entity is complete; otherwise `list` with `include` goes to the server and its result is not cached as the source of truth for that query (the watcher keeps refetching on change). Fine for wave 2 sizes; a per-relation fetch would remove the refetch.
- Second-tab and pane-to-pane timings are 75 to 125ms end to end in the browser against 0.5ms in-process; the gap is vite's dev proxy and fetch round trips, not the transport.

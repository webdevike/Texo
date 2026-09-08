# Wave 2 slice H: blind extension probe (P9)

Branch `eva/w2-h-extension`, start commit `1bf4c3f`. Inputs read: `experiments/BRIEF.md`,
`contracts/extension.ts`, `contracts/store.ts`, `contracts/entity.ts`, `src/extensions/load.ts`,
`src/extensions/backend/index.ts`, `src/admin/client.ts`, `packages/ui/src/index.ts` and
`components.ts`. Beyond that list I opened `host/manifest.ts` (Manifest type, imported by client.ts),
`adapters/store-memory.ts` (test store), the `createHttpStore` signature and its `fetch` line in
`adapters/store-http.ts`, the `useTexoTheme` context shape, and `src/admin/backend-rail.tsx` (only
after the nav entry did not appear; see guess 5). No wave reports read. No hub messages.

## Files landed

- `src/extensions/insights/index.ts` (39 LOC): `defineExtension` with 2 routes, 2 nav entries,
  2 commands, 1 view.
- `src/extensions/insights/stats.ts` (59): pure data layer. `userEntities`, `firstEnumField`,
  `insightOf`/`insightsOf` (one `list(entity, { limit: 0 })` for the total, one per enum option with
  `where: { [field]: option }`, reads `.total` only), and a refresh bus (`onRefresh`/`requestRefresh`)
  so the palette command can reach mounted components.
- `src/extensions/insights/insights-page.tsx` (122): `/insights` route. Owns the shared
  `createHttpStore('/api', { origin: 'insights' })`, `BarList` (chart colors via
  `var(--texo-chart-1..5)`), `InsightCard`, `useInsights`, `InsightsPage`. `Base*` only:
  BaseActionIcon, BaseBox, BaseGroup, BaseLoader, BaseStack, BaseText, BaseTitle, BaseTooltip.
- `src/extensions/insights/issue-by-status.tsx` (43): the `issue-by-status` view component
  (`{ entity }` prop), reuses `BarList` and `insightOf`.
- `src/extensions/insights/stats.test.ts` (51): 3 tests against the memory adapter.
- `experiments/reports/h-extension/*.webp`: 6 screenshots.
- No file outside `src/extensions/insights/` changed. No `@texo/ui` alias was missing.

Agent-written LOC: 314 (`git diff --stat 1bf4c3f -- . ':!experiments/reports'`, no lockfile or
node_modules touched). `vite.config.mts` was edited locally to 4243 / proxy 4343 and reverted before
the final commit.

## Verification

Servers: host `bun run app/server.ts` with `TEXO_PORT=4343`; vite via nx on 4243 (readiness on the
port never fired for the hub monitor, but vite logged ready and served; both stopped at the end,
`lsof` on both ports = 0).

The demo workspace starts empty, so before checking totals I seeded rows through the app's own
session (`POST /api/<entity>/create` with a JSON array body, matching the HTTP store's RPC shape):
7 issues (backlog 1, todo 2, in_progress 1, done 3), 2 projects (active, shipped), 1 member.

| Acceptance item | Evidence |
| --- | --- |
| `/insights` renders a card per non-system entity with totals and enum breakdown | `01-insights-after-refresh.webp`: project 2 rows by stage (active 1, shipped 1), member 1 row (no enum), issue 7 rows by status (1/2/1/3), customer 0 rows by tier. `_setting` (system) has no card. |
| Cross-check against Content count | `04-content-issue-7-crosscheck.webp`: `/admin/content/issue` shows "7 issues" and "7 of 7 loaded"; the issue card shows 7. |
| Nav shows `Insights` | `03-backend-rail-insights-nav.webp`: Backend rail, Settings section, `Insights` item; clicking it lands on `/insights` (in-page click; `location.pathname === '/insights'`). See guess 5 for why it is in Settings and not a section called Insights. |
| `g n` navigates | `02-g-n-hotkey-from-admin.webp`: from `/admin/system`, pressing `g` then `n` moved to `/insights` (asserted by polling `location.pathname`). Note: from `/theme` no chord fires at all, not even the built-in `g s` or `t`; keydowns reach `document.body` but nothing handles them there. Pre-existing, not mine. |
| Palette lists both commands | `06-palette-both-commands.webp`: Cmd+K, typed "insights": group INSIGHTS with `Go to insights G N` and `Refresh insights`. Unfiltered list also shows both under an `Insights` heading. |
| `Refresh insights` works | After seeding, the page still showed 0 everywhere; running `Refresh insights` from the palette re-fetched and rendered the seeded numbers (screenshot 01 is the post-refresh state). |
| `issue-by-status` view | `05-issue-by-status-view.webp`: mounted at `/insights/issue-by-status` (see guess 6), "7 issue rows by status" with four bars. |
| `bun test` | `cd experiments/contracts-spike && bun test`: 131 pass, 0 fail. `bun test src/extensions/insights/stats.test.ts`: 3 pass. |
| Typecheck | `tsc --noEmit -p tsconfig.app.json`: exactly the 4 known pre-existing errors (texo-icons.tsx:54, texo-theme-provider.tsx:497 primaryShade, app.tsx:90 replaceAll, theme-controls.tsx:234); nothing from `src/extensions/insights`. |

## Guesses and ambiguities (numbered, with resolution)

1. **Where does a route component get the manifest and a store?** `RouteContribution.element` is a
   bare `ComponentType` and the contract has no provider/context/services contribution. The backend
   extension solves it with its own `ManifestContext` that `app.tsx` wires explicitly, which a blind
   extension cannot rely on. Resolution: the page fetches `host.manifest()` itself and creates its
   own `createHttpStore('/api', { origin: 'insights' })`. Cost: a second manifest fetch and a second
   SSE connection per mount. The contract should say how an extension gets the app's store and
   manifest (a `useTexo()` hook or a `context` argument to `element`).

2. **What is a "system" entity?** `entity.ts` allows `_`-prefixed names and `Manifest.system` is a
   string list. Resolution: filter `manifest.entities` by `!manifest.system.includes(name)` (same
   rule the Backend rail uses, confirmed later). Guessed before confirming.

3. **Does `limit: 0` return `total` without rows?** `ListQuery` says "Default limit is
   adapter-defined" and `Page.total` says "ignoring paging"; nothing says `0` is legal. Resolution:
   assumed yes; memory adapter test and the HTTP path both returned correct totals with zero rows.
   Worth pinning in the conformance suite ("limit: 0 returns total, no rows").

4. **Bare `where` value for enum equality.** Cheat sheet says bare = eq. Resolution: used
   `{ [field]: option }`. Worked on both adapters.

5. **`NavContribution.section` is free text but the shell only renders two strings.** The contract
   says "which rail panel section the item belongs to, e.g. Pages or Backend"; the backend extension
   uses `Backend/Schema` and `Backend/Settings`. I first contributed `section: 'Insights'` as asked.
   It rendered nowhere: the Pages rail is a hard-coded preview list and `backend-rail.tsx` only reads
   `Backend/Schema` and `Backend/Settings` (I opened that file only after the entry was missing).
   Resolution: kept the contract-shaped `Insights` entry and added a second entry under
   `Backend/Settings` so the item is reachable. Biggest gap found: an unknown section silently
   disappears; the shell should either render unknown sections as their own `TexoNavSection` or
   `buildRegistry` should reject them.

6. **Who renders `ViewContribution`?** The contract says "the Content page and app can render" a
   view, but `grep registry.views` across `src/` finds no consumer, and the Content page for `issue`
   shows no view switcher. Resolution: registered the view per contract AND mounted it on a route
   `/insights/issue-by-status` so it could be verified in the browser. Without the extra route the
   view is dead code from the user's perspective.

7. **How does a command reach a mounted page?** `CommandContribution.run` receives only
   `{ navigate, pathname }`. "Refresh insights" needs to poke a component. Resolution: a
   module-level listener set (`onRefresh`/`requestRefresh`). Works, but any extension needing this
   will invent the same bus; a `when` + `run` ctx with an event emitter or a query cache would be
   cleaner.

8. **Hotkey syntax and chord behavior.** `keys: 'g n'` was a guess that the space means a sequence
   (Mousetrap) rather than simultaneous keys; the palette rendered it as `G N` and the chord fired
   from `/admin/system`. Also observed: no chord fires from `/theme`, including the built-ins.

9. **`Manifest` type import path.** `src/admin/client.ts` re-exports `Manifest` from
   `host/manifest.ts`. Used the re-export; opened `host/manifest.ts` only to see the field names
   (`entities`, `adapters`, `system`).

10. **`Store.migrate` signature.** The test needed a store; guessed `migrate(entities[])`, it is
    `migrate(entity)` one at a time. Fixed on first test run.

11. **HTTP store write shape.** For seeding I first tried REST `POST /api/issue` and got 404; the
    adapter does RPC `POST /api/<entity>/<method>` with an args array. Only discovered by reading
    the `fetch` line. Not a contract issue (a UI extension writes through `ClientStore`, not raw
    fetch), but the transport shape is undocumented in the contract comments.

12. **Chart colors.** The brief names `useTexoTheme` chart colors and `--texo-chart-1..5`. The hook
    exposes `config.chartColors`; the CSS variables are set on the app root by the provider.
    Resolution: used `var(--texo-chart-N)` inline so the bars follow the live theme without a hook
    subscription.

13. **Card surface.** `BaseCard` exists but its default carries a shadow; the brief bans stacked
    shadows and side stripes. Resolution: `BaseBox` with a hairline border and theme radius, no
    shadow.

14. **Route title.** `RouteContribution.title` is "optional page title for the shell"; nothing in
    the UI visibly used it. Set anyway.

15. **Loader glob.** `load.ts` globs `./*/index.{ts,tsx}` eagerly; a folder named `insights` with
    `index.ts` is picked up with no registration step. Confirmed by the palette showing the
    commands on first load.

## Open

- The `Insights` nav section entry (contract-shaped) is registered but invisible in the shell;
  only the `Backend/Settings` duplicate renders. Decide whether the shell should render foreign
  sections or the contract should enumerate the allowed ones.
- `registry.views` has no consumer in `src/`; the `issue-by-status` view is only reachable through
  the extra route.
- Global chords do not fire on `/theme` (pre-existing; observed, not investigated).
- Each mounted insights component opens its own HTTP store (extra SSE connection) because the
  contract gives extensions no handle on the app's store.

Turns taken: 51 tool-call rounds from first read to report commit.

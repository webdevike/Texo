# E2 Linear-lite on Texo: run report

Branch `eva/w2-e2-linear`, start commit `241cfa1`. Agent: W2LinearTexo2.

## Timing

- Start: 2026-09-08T03:41:18Z
- Time cap from Main: 04:03Z (17 minutes after the cap message at ~03:46Z)
- First browser-verified run (login + 10k issues list rendered): 03:52:18Z (11 minutes wall-clock)
- Board + drag + rejected patch verified: 03:54Z
- After 03:55Z the headless browser stopped rendering the React root on every route (including the pre-existing `/theme`), even after a vite restart and a browser kill; vite and the host both answered 200 in under 10ms via curl. Items 4 to 7 were not browser-verified before the cap.
- Turn count: about 60 tool calls (roughly 20 before the cap message were reads, the rest writes/verification).

## LOC (git diff --stat vs 241cfa1, lockfiles excluded)

```
 .../contracts-spike/app/entities/issue.json        |  85 ++++++-
 .../contracts-spike/app/entities/label.json        |  16 ++
 .../contracts-spike/app/entities/project.json      |  25 +-
 experiments/contracts-spike/app/entities/team.json |  16 ++
 experiments/contracts-spike/scripts/seed-linear.ts |  40 ++++
 experiments/reports/e2-linear/01-issues-list.webp  | Bin 0 -> 30024 bytes
 experiments/reports/e2-linear/02-board.webp        | Bin 0 -> 38462 bytes
 packages/ui/src/index.ts                           |   1 +
 packages/ui/src/texo-board.tsx                     |  94 ++++++++
 src/app/commands.tsx                               |   6 +-
 src/extensions/linear/index.ts                     |  37 +++
 src/extensions/linear/issue-detail.tsx             |  41 ++++
 src/extensions/linear/pages.tsx                    | 261 +++++++++++++++++++++
 src/extensions/linear/store.ts                     |  27 +++
 14 files changed, 632 insertions(+), 17 deletions(-)
```

## Source files opened beyond the skill, and why

The skill lists signatures but not prop/field shapes, so these were needed:

1. `contracts/extension.ts`: NavContribution/CommandContribution field names (`section`, `when`, `run` ctx shape).
2. `src/extensions/backend/index.ts`: how an existing extension is written (createElement for icons, ManifestProvider/useManifest).
3. `src/app/app.tsx` (App body): where registry routes/nav mount; whether a `Linear` rail section exists (it does not: only Theme/Pages/Backend rails, and BackendNav groups by `Backend/<sub>`).
4. `src/admin/backend-rail.tsx`: confirms only `Backend/Schema` and `Backend/Settings` are rendered, so Linear nav entries are duplicated under `Backend/Settings`.
5. `src/app/commands.tsx`: shell already binds `g p`, `g b`, `g t` to rails, colliding with the spec; renamed shell rail keys to `g 1/2/3`. Also learned the palette and help modal read `keys`/`when`.
6. `packages/ui/src/texo-hotkeys.ts`: how sequences/conflicts resolve (first exact match wins; `when` evaluated per keypress).
7. `src/extensions/load.ts`, `experiments/contracts-spike/scripts/seed.ts`, `app/server.ts`, `texo.config.ts`: seed approach and HTTP wire format (`POST /api/<entity>/create` with a JSON array of args; cookie login).
8. `src/admin/hooks/use-list.ts`, `use-optimistic.ts`, `use-live.ts`: ListHandle has `setOrderBy` not `setSort`, and `query.search`/`query.orderBy` shapes (the skill's usage line names `setSort` which does not exist).
9. `src/admin/live-demo.tsx`: module-level live store pattern.
10. `adapters/store-live.ts`, `adapters/store-http.ts`: `watch` semantics, `subscribe` passthrough, 422 mapping, local pre-validation on update.
11. `packages/ui/src/texo-data-table.tsx`, `texo-filter-bar.tsx`, `texo-panel.tsx`, `texo-nav.tsx`: prop interfaces (columns/sort/selected shapes, TexoFilterField kinds).
12. `src/admin/fields/field-control.tsx`, `relation.tsx`: `ctx` prop shape (the skill's usage line passes `store`/`resolveEntity` as props, but the real prop is `ctx`).
13. `contracts/store.ts`, `contracts/entity.ts`: ListQuery/FieldSpec shapes.
14. `adapters/auth-cookie.ts` (grep only): `_workspace` entity name.

Skill inaccuracies found: `list.setSort` (real: `setOrderBy`), `FieldControl store=/resolveEntity=` props (real: `ctx={ store, resolveEntity }`), `list.search` (real: `list.query.search`).

## Acceptance

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Login gate, seeded user works | PASS (partial) | Login form gated `/issues`; demo@texo.dev signed in and saw `10,000 issues`. Second-workspace user not tested (cap). |
| 2 | 10k list renders, scroll perf, sort, filter, search | PARTIAL | `01-issues-list.webp`: 10,000 issues, 213 virtualized rows in DOM, sorted priority desc by default. Scroll frame timing, header sort click, status filter and search were not measured (browser evaluate calls stalled). |
| 3 | Board 5 columns with counts, drag persists, 422 rolls back | PASS | `02-board.webp`: 5 columns, counts 2000 each. Drag todo -> done: server `get` returned `status: "done"`, counts became 1999/2001. `priority: 9` patch: rejected (`validation failed`), card text unchanged `Issue 0: login loginP0 None` before and after. |
| 4 | Detail panel inline edits persist | NOT VERIFIED | Implemented (`issue-detail.tsx`: FieldControl per field via live store) but not browser-exercised before cap. |
| 5 | Keybindings | NOT VERIFIED | Implemented: `c`, `g i/g b/g p`, `escape`, `/`, `j/k`, `enter`, `1..5`, `s <b/t/i/d/c>`, `a`; palette lists 11 Linear commands plus 11 shell plus entity commands (>= 15). Not exercised. |
| 6 | Realtime two tabs | NOT VERIFIED | One `createLiveStore(createHttpStore)` per app; board uses `useLive`, list refetches on SSE events (debounced 400ms). Not exercised. |
| 7 | Theme sidebar/table settings affect app | NOT VERIFIED | List uses TexoDataTable (config.table) and nav uses TexoNavItem/Section (config.sidebar). Not exercised. |

## Notes

- No `Linear` rail section exists in the shell; nav entries are contributed under both `Linear` (for a future rail) and `Backend/Settings` (visible today as `Linear: Issues/Board/Projects`).
- Shell rail keys `g t/g p/g b` were renamed to `g 1/g 2/g 3` so the spec's `g p`/`g b` reach Linear.
- The blank-root failure late in the run reproduced on `/theme` too, so it is not specific to the extension; the host and vite were healthy by curl. Not diagnosed before the cap.
- `bun test` in contracts-spike was not run (cap).

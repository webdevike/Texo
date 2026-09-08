# Slice B: query at scale + Linear-class list surface

Branch `eva/w1-b-query`, worktree `work/texo-w1-b-query`. Ports 4332 (host) / 4232 (vite).

## What landed

| File | Role |
| --- | --- |
| `src/admin/hooks/use-list.ts` | `useList(store, entity, initial?)`: owns a `ListQuery`; debounced `setSearch` (200ms), `setWhere`, `setOrderBy`, `setQuery`; offset paging via `loadMore` (append) and `refetch` (re-reads everything on screen in one call so scroll survives). Previous rows stay visible while loading; a monotonic seq drops stale responses. Returns `{ rows, total, loading, error, query, hasMore, ... }`. |
| `packages/ui/src/texo-data-table.tsx` (+ `.module.css`) | `TexoDataTable<T>`: `@tanstack/react-virtual` (new dep, `^3.14.10`) with `directDomUpdates` so scroll-only frames never touch React; memoized rows; sortable headers (click cycles asc/desc/none, shift-click adds a secondary key with a 1/2 index badge, `aria-sort`); optional row selection (`selectable`/`selected`/`onSelectedChange`); density/borders/striped/hover/sticky from `useTexoTheme().config.table` via `--texo-table-*`; `renderCell(column, value, row)` prop; keyboard on the focused grid: Up/Down/Home/End/PageUp/PageDown move focus, Enter -> `onOpen(row)`, Space toggles selection; `role="grid"/"row"/"gridcell"`, `aria-selected`, `aria-rowindex`. `onEndReached` fires when the last row is rendered (infinite scroll). Exported helper `cycleSort`. |
| `packages/ui/src/texo-filter-bar.tsx` | `TexoFilterBar`: search input + Filter popover (field -> kind-appropriate operator -> value: string contains/eq/isNull; number/date eq/lt/lte/gt/gte/isNull; boolean eq; enum in/nin with multi-select; relation eq by id/isNull) + removable chips + "1,234 issues" total. Contract-free (`TexoFilterField`, `TexoFilter`); `filtersToWhere(filters)` produces the store `Where`. |
| `src/admin/entity-page.tsx` | Rewritten on FilterBar + DataTable + useList + `BaseModal` with the existing `EntityForm` (`entity,row,onSubmit,onCancel` unchanged). Accepts optional `resolveEntity` and passes `store` + `resolveEntity` through to `EntityForm` (slice E contract); `include` = every single-relation field. `?new=1` opens the create modal (slice D's palette command). Infinite scroll via `onEndReached -> loadMore`, footer "N of total loaded". Exports a kind-aware `Cell` default renderer. |
| `experiments/contracts-spike/scripts/seed.ts` | `bun scripts/seed.ts [path] [count]`: deterministic `issueAt(i)` corpus (title "Issue i: word word", status cycling 4 enums, priority i%5, done = status==done, notes every third). Exports `loadIssueEntity`, `seedIssues` for the test. |
| `experiments/contracts-spike/adapters/scale.test.ts` | 10k rows in sqlite `:memory:`; median-of-20 timings printed; asserts totals against the generator and budgets (`where+orderBy+limit 50` < 50ms, `search` < 100ms, deep offset < 50ms), disjoint/stable paging, out-of-range page. |
| `packages/ui/src/components.ts`, `index.ts` | Appended aliases `BaseCloseButton, BaseDivider, BaseKbd, BaseLoader, BaseModal, BaseMultiSelect, BasePill, BasePopover` (+ Props types); exports for the two new primitives. `BaseMultiSelect` is the identical line W1Relations adds; dedupe on merge. |
| `package.json` / `pnpm-lock.yaml` | `@tanstack/react-virtual`. |
| Local only (this branch): `app/texo.config.ts` -> `app/data-10k.sqlite`; `app/server.ts` port 4332; `vite.config.mts` port 4232 + proxy. `app/data-*.sqlite` gitignored. Integration should revert the three port/config lines. |

## Verification

### `bun test` (spike, 76 pass = 71 baseline + 5 scale)

```
scale (sqlite, 10000 issue rows, median of 20)
  seed 10000 rows                              234ms (0.023ms/row)
  where{status=todo,priority>=2} order priority desc median 1.69ms  max 1.76ms  total=1500
  where{status in [todo,done]} limit 50        median 0.84ms  max 1.28ms  total=5000
  where{status nin [todo,done]} limit 50       median 1.10ms  max 1.18ms  total=5000
  search "issue 9" limit 50                    median 1.81ms  max 1.91ms  total=1111
  search "issue 9" + where{done=true} sorted   median 1.81ms  max 2.64ms  total=278
  page offset 0 limit 50 (2-key order)         median 1.28ms  max 1.32ms  total=10000
  page offset 9950 limit 50 (2-key order)      median 8.26ms  max 10.08ms  total=10000
  no filter, order title asc, offset 5000      median 4.28ms  max 4.94ms  total=10000
 76 pass, 0 fail, 967 expect() calls
```

Budgets are met by 5 to 50x. Seeding through `store.create` costs 0.02ms/row in memory (3.9s for 10k on the file db, one implicit transaction per insert; see Open).

### App typecheck

`tsc --noEmit -p tsconfig.app.json`: only the known pre-existing errors (texo-icons:54, primaryShade, theme-controls:234, `replaceAll`, custom-components-page).

### Browser (headless Chromium via omp browser tool, 1400x900, seeded 10k sqlite on :4232)

Screenshots in `experiments/reports/b-query/`:

1. `01-list-10k.webp`: Backend > Content > issue renders "10,000 issues", 27 rows in the DOM for a 643px viewport, flat hairline rows, no card stripes.
2. `02-sort-priority-desc.webp`: two header clicks -> `aria-sort=descending`, first rows priority 4 (`Issue 4, 9, 14, 19, 24`). Shift-click `status` afterwards gave headers `priority1:descending, status2:ascending` and rows priority 4 / backlog first.
3. `03-search-issue-9.webp`: typing "issue 9" -> total "1,111 issues" (same number the scale test asserts from the generator), rows `Issue 9, 90, 91, ...`.
4. `04-filter-editor.webp`, `05-filter-chip-556.webp`: Filter -> status / is any of / [todo, done] -> chip `status is any of todo, done`; total narrows 1,111 -> 556, only todo/done statuses visible, footer "100 of 556 loaded".
5. `06-keyboard-focus.webp`: grid focused, ArrowDown x6 -> `data-focused` row 5 with the inset accent; Up/Down/Home/End keep the focused row fully inside the viewport below the sticky header (measured `fullyVisible: true` at index 0, 39, 1, 99; End auto-paged to 200 rows).
6. `07-enter-opens-modal.webp`: Enter on the focused row opens the edit modal titled with that row (`Issue 939: billing webhook`), form prefilled; Escape closes it.

Scroll performance (`tab.evaluate`, tab brought to front so rAF runs; headless software raster):

| Measurement | Result |
| --- | --- |
| 10 wheel events x 400px, `performance.now()` delta wheel -> next painted frame | `[28.1, 34.2, 30.7, 33.2, 35.0, 31.7, 33.3, 33.3, 33.8, 32.8]` ms, avg 32.6ms (two rAF ticks at the headless 60Hz clock; each is exactly one or two frames) |
| 120 frames scrolling 60px/frame (range changes every frame) | avg 16.70ms, p95 18.2ms, max 28ms, 2 frames > 20ms |
| 120 frames scrolling 3px/frame | avg 16.67ms, p95 20.4ms, max 24ms |
| Idle baseline / plain static div scrolling | avg 16.36 / 16.40ms, max 16.9ms |

Before the two fixes (memoized rows; hoisted `[]` defaults for `sort`/`selected` that were invalidating every row's memo) the same sweep was avg 18.3ms, p95 59ms, max 87ms. Now within noise of the plain-div baseline, i.e. 60fps at 10k rows.

## Notes on the contract

- No contract holes hit. `search` and `where` compose, `in/nin` totals are exact, `orderBy` arrays work with `NULLS LAST`, deep offsets are fine at 10k (8ms at offset 9950; at 1M rows offset paging would need a keyset variant, not a contract change).
- `useList` treats `where` values as opaque, so `filtersToWhere` output (bare value for eq, `{op,value}` otherwise) goes straight through `createHttpStore`.

## Open

- Seeding the file db uses one `store.create` per row (3.9s/10k). Fine for a fixture; a bulk import path would want a transaction on the adapter side, not the contract.
- `TexoDataTable` renders `aria-rowcount` as loaded rows, not `total`; the FilterBar carries the true total. Could pass `total` in for `aria-rowcount` once a11y review wants it.
- The filter editor's relation value is a raw id text input (as specified). Slice E's `resolveEntity` could feed a picker later.
- `EntityForm` receives `store`/`resolveEntity` via an untyped spread until slice E's signature lands; integration should replace `formProps` with direct props.
- The app shell canvas grows with content, so `EntityPage` bounds its own height with `calc(100dvh - 136px)`; if the shell later gives the canvas a fixed height that line becomes `height: 100%`.

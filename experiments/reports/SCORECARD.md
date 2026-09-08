# Scorecard: K (from scratch) vs E2 (on Texo), per experiments/RUBRIC.md

Same prompt (experiments/LINEAR-LITE.md), same model (anthropic/claude-fable-5-1), same day.
E (first Texo run, no API skill) is recorded for the discoverability finding only: 72m50s,
79 reads / 3 writes, 0/7, cancelled.

## Gate

| | K (scratch) | E2 (Texo + skill) |
|---|---|---|
| Wall-clock to first verified run | 22m22s | 11m to list + login verified; cancelled at 24m44s (cap = control) |
| Turns | 111 | ~60 |
| Agent-written LOC | 1,623 | 632 (+17 deleted) |
| Call mix | 4 reads / 80 writes | 14 reads / 7 writes (E: 79 / 3) |
| Acceptance, builder-checked | 6/6 applicable | 1 pass, 1 partial, 1 pass (board + rollback), 4 not verified |
| Acceptance, orchestrator-checked | not yet (headless browser wedged; Isaac verified manually) | login gate, second-workspace 0 rows, list renders 10k, board renders: verified by Isaac in Chrome after the gallery crash fix |

Gate verdict: K passes. E2 meets the time gate (under 1.5x control) but not the acceptance
gate as delivered; the first Texo run (E) failed both. Scored anyway so the axes are visible.

## Axes (0 absent, 1 partial, 2 solid, 3 exemplary)

| Axis | K | E2 | Evidence |
|---|---|---|---|
| A1 shared primitives | 1 | 3 | K: own list (IssueList.tsx), own board, own detail, own fuzzy matcher. E2: TexoDataTable, TexoFilterBar, TexoBoard (new, in @texo/ui), FieldControl/RelationField, TexoCommandPalette, TexoNavItem; admin Content page shares the same table. |
| A2 one data path | 3 | 2 | K: one `fetch` in client/store.ts, everything through it. E2: one ClientStore, but pages.tsx:126 adds a `list.refetch()` on every SSE event (the slowness); fixed in W3 by collections. |
| A3 theme reach | 0 | 3 | K: hand CSS, no theme. E2: `config.sidebar` drives the rail, `config.table` drives row height/borders/striped in every table; verified in wave 1 (28px rows, filled active, hidden sections after a configurator change, persisted via Store). |
| A4 convention | 2 | 2 | Both consistent internally; E2 had to put Linear nav under `Backend/Settings` because the shell only renders two sections (contract hole, H found the same). |
| B1 tests defend behavior | 0 | 3 | K: 1 test (fuzzy). Texo: 183 tests: Store conformance across sqlite/memory/http/pglite/collections, auth conformance x2, extension registry, scale, SSE two-client, live behaviors. |
| B2 schema change safety | 0 | 3 | K: SQL strings in server/index.ts. Texo: `migrate` refuses required-without-default and retypes with StoreSchemaError; verified from the admin builder (P5a) and in the suite. |
| B3 swap cost | 0 | 3 | K: rewrite. Texo: P7, blind agent wrote a PGlite adapter in 9m34s, 160 tests green, host swapped with one config line and served auth + issue round trip. |
| B4 boundaries | 0 | 2 | K: none. Texo: Mantine only via `Base*` aliases (convention, no lint yet), server is schema authority, client never sees migrate. |
| B5 discoverability | n/a | 1 | E: 79 reads before writing. E2 with skill: 14. Skill had 3 inaccuracies E2 hit (setSort, FieldControl ctx, list.query.search). W3 (TanStack DB, no priors) stalled 55m: third-party APIs need the same treatment. |
| C1 hierarchy | 1 | 2 | K: competent default. E2: inherits Texo spacing/hierarchy rules through primitives. |
| C2 banned patterns | 3 | 3 | grep: no side-stripe cards, no em dashes, no translateY in either. |
| C3 keyboard density | 3 | 2 | K: 17 palette commands, all spec keys verified. E2: keys implemented, palette 15+, not all verified before cap. |
| C4 states | 1 | 1 | Both: loading/empty present, rollback toast in K verified; E2 rollback verified on board. |
| C5 copy | 2 | 2 | Sentence case both; E2 uppercase badges are status pills (allowed). |
| D1 scale | 3 | 1 | K: 10k rows, 6.9ms avg frame (prod build). E2: virtualized but 200-row pages with 2 includes and refetch-on-change; Isaac: "pretty damn slow". Store-level query at 10k is 1 to 9 ms on sqlite (suite). |
| D2 realtime | 3 | 2 | K: 18.9ms cross-tab. Texo: 61ms cross-tab on the merged live demo, 0.2 to 2.8ms in the SSE test; E2's views not verified for it. |
| D3 isolation | 3 | 3 | K: otto sees 0. Texo: two@texo.dev sees 0 via curl and browser; owner-only spec PUT 403 for members. |
| **Total /54** | **25** | **38** | |

## Reading

K wins the gate and the runtime axes (D1, D2, C3) on the day. Texo wins every structural axis
(A1, A3, B1, B2, B3, B4) by margins no amount of extra prompt time buys back, which is the
longevity claim. The two Texo losses are both discoverability, not architecture: E2 misused
the live store because nothing told it not to refetch on change (fixed at the root by the
collections adapter, 23 tests), and the first run could not find the primitives at all (fixed
by the generated skill). The one-shot number to re-measure is E3 = same prompt, skill +
collections adapter + no stale usage lines, with the from-scratch 22m22s as the gate.

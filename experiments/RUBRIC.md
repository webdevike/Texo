# Rubric: scoring an agent-built app

Speed is a gate, not a score. An app that misses the gate is not scored. Everything else is
graded 0 to 3 per criterion from the repo and a browser session, with the evidence command or
check written next to the score so two people scoring the same tree get the same number.

## Gate

- **Time**: first fully browser-verified run within 1.5x the from-scratch control on the same
  prompt, same model. (Control K: 22m22s, so the gate is 33m33s.)
- **Acceptance**: every functional item in the prompt's acceptance list passes when the
  ORCHESTRATOR checks it, not the builder.

## Axes (0 = absent, 1 = partial, 2 = solid, 3 = exemplary)

### A. Cohesion: one system, not a pile of files
| # | Criterion | How to measure |
|---|---|---|
| A1 | Surfaces share primitives | Count distinct list/table/form/board implementations. 3 = one each, reused everywhere; 0 = each page rolls its own. `grep -c` for `<table`, `useVirtualizer`, `<form` outside a shared component. |
| A2 | One data path | All reads/writes go through one client (store/hooks). 0 = raw `fetch` scattered in pages. `grep -rn "fetch(" src --include=*.tsx | grep -v client` count. |
| A3 | Theme reach | Change one configurator setting (table density, sidebar active indicator, primary color): count surfaces that visibly change. 3 = every surface; 0 = none, hardcoded styles. |
| A4 | Naming and structure | Files, routes, entities, commands follow one convention (kebab routes, snake fields, `g x` keys). Score by counting deviations in a 5-minute read. |

### B. Longevity: changeable in six months by someone else
| # | Criterion | How to measure |
|---|---|---|
| B1 | Tests defend behavior | Tests that fail on a plausible regression (not snapshots). Count + `bun test` output. 3 = contracts + conformance + app-level; 0 = none. |
| B2 | Schema change safety | Add a required field to `issue`: 3 = refused with a typed error until a default is given, then migrates additively; 0 = hand-edited SQL or silent data loss. |
| B3 | Swap cost | Replace the database (or auth) adapter: count files touched and whether the suite catches breakage. 3 = one config line + green suite; 0 = rewrite. |
| B4 | Boundaries enforced | Can a page import the UI library directly, bypass the store, or reach the DB? 3 = lint/alias boundary makes it impossible; 0 = anything goes. |
| B5 | Discoverability | Can a fresh agent add a feature without reading implementations? Count reads before first write in a blind extension task (P9 style). 3 = under 10; 0 = over 50. |

### C. Taste: not AI slop
| # | Criterion | How to measure |
|---|---|---|
| C1 | Hierarchy and spacing | Title+description grouped tight, sections spaced; no even-spaced lists of unrelated lines. Screenshot review against `.omp/skills/isaac-design`. |
| C2 | No banned patterns | Colored side-stripe cards, stacked shadows on bordered cards, lift-on-hover, inline glyph arrows, em dashes. `grep` for `box-shadow` on bordered elements, `border-left:`, `translateY`, `→`, `—`. 3 = zero hits. |
| C3 | Density and keyboard | Linear-class apps are dense and keyboard-first: `?` lists every binding, palette covers every action, no dead-end modals. Count actions reachable by keyboard vs mouse-only. |
| C4 | States | Empty, loading, error, rollback states designed, not defaulted. Trigger each in the browser. |
| C5 | Consistency of copy | Sentence case, no shouting badges except status pills, no "Successfully saved!" toasts. |

### D. Correctness under stress
| # | Criterion | How to measure |
|---|---|---|
| D1 | Scale | 10k rows: list scroll frame time (`performance.now()` over 10 wheel events), query latency from the store suite. 3 = under 16ms frames and under 10ms queries. |
| D2 | Realtime | Two tabs: propagation latency (MutationObserver timestamp), optimistic rollback on 422, reconnect after idle. |
| D3 | Isolation | Second workspace sees zero rows; owner-only actions 403 for members. |

## Scoring sheet

| Axis | K (scratch) | E2 (Texo) | Evidence |
|---|---|---|---|
| Gate: time | | | |
| Gate: acceptance (orchestrator-checked) | | | |
| A1 shared primitives | | | |
| A2 one data path | | | |
| A3 theme reach | | | |
| A4 convention | | | |
| B1 tests | | | |
| B2 schema safety | | | |
| B3 swap cost | | | |
| B4 boundaries | | | |
| B5 discoverability | | | |
| C1 hierarchy | | | |
| C2 banned patterns | | | |
| C3 keyboard density | | | |
| C4 states | | | |
| C5 copy | | | |
| D1 scale | | | |
| D2 realtime | | | |
| D3 isolation | | | |
| **Total /54** | | | |

Weighting: none. A single total hides which axis lost; report the row scores. If a shortcut is
needed, B and C are the axes the prompt cannot buy back with more time.

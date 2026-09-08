# Texo experiments: shared brief for wave agents

You are working in a git worktree of the Texo repo on your own branch. The frozen contract surface
is tag `wave1-base` (commit 8ac380a). Do NOT change files under `experiments/contracts-spike/contracts/`
unless your slice says so; if you must, keep every existing suite test green and note it in your report.

## Layout
- `experiments/contracts-spike/contracts/` entity, store (+ conformance suite), extension, auth.
- `experiments/contracts-spike/adapters/` sqlite (reference), memory, http (+ SSE feed), query (shared evaluator).
- `experiments/contracts-spike/host/` spec registry (JSON specs in `app/entities/`), manifest, settings.
- `experiments/contracts-spike/app/server.ts` host API on :4321. Run: `cd experiments/contracts-spike && bun run app/server.ts`.
- `packages/ui/` `@texo/ui` (Mantine `Base*` aliases + Texo primitives: theme provider, app shell, nav, field list, table).
- `src/app/app.tsx` the Texo app (rail: Theme / Pages / Backend; canvas routes). `src/admin/` admin surfaces (EntityPage, EntityForm, EntityTable, SchemaBuilder, BackendNav, client).
- Vite dev on :4200 proxies `/api` to :4321: `node node_modules/nx/dist/bin/nx.js serve Texo --port 4200` with `PATH=$HOME/.nvm/versions/node/v24.13.0/bin:$PATH NX_DAEMON=false`.
  Pick a FREE port pair for yourself (e.g. 42xx / 43xx) so agents do not collide; `app/texo.config.ts` + `vite.config.mts` proxy can be changed locally in your worktree.

## Rules
- Mantine only through `@texo/ui` `Base*` aliases in `src/` and `packages/ui/`; add a missing alias in `packages/ui/src/components.ts` rather than importing `@mantine/core` directly.
- Icons: `@tabler/icons-react`. No em dashes anywhere. No colored side-stripe cards, no stacked shadows.
- Tests: `cd experiments/contracts-spike && bun test`. Typecheck: `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json` (three pre-existing errors are known: texo-icons.tsx:54, texo-theme-provider primaryShade, theme-controls.tsx:234, replaceAll, custom-components-page; ignore those).
- Do NOT run formatters or project-wide lint. Do NOT run the browser tool against ports other than your own.
- Node: the shell `node`/`npx` are broken (nvm lazy-load); always use `$HOME/.nvm/versions/node/v24.13.0/bin/node`. `bun` is fine.
- Commit on your branch as you go. Final report: what landed (files), what is verified and how, what is open. Write it to `experiments/reports/<slice>.md` and commit.

## Contract cheat sheet
- `FieldSpec.kind`: string | number | boolean | enum | date | relation{to,many?} | group{fields,repeatable?}.
- `ClientStore.list(entity, { where, search, orderBy, offset, limit, include }) -> { rows, total }`. `where` values are bare (eq) or `{ op, value }`.
- `ClientStore.subscribe(entity | null, listener) -> unsubscribe`; events `{ entity, kind, id, row?, seq, origin? }`. HTTP transport streams `GET /api/_events` (SSE), `?origin=` drops own echoes; `createHttpStore(base, { origin })`.
- `Store.scoped({ workspaceId, actorId? })` partitions rows. Host derives scope from auth (contracts/auth.ts) and passes a per-request store to `storeHandler(resolveStore, resolve)`.
- Extension: `src/extensions/<name>/index.ts` default-exports `defineExtension({ id, name, routes, nav, commands, views, components })`. `buildRegistry(defs)` aggregates.

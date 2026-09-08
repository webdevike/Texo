# G: blind third Store adapter (PGlite)

P7 probe. Written from `contracts/store.ts`, `contracts/entity.ts`, `contracts/store.conformance.ts`, the sqlite reference adapter, `adapters/query.ts` and `adapters/store.test.ts` only. The memory adapter and the wave reports were not read. The host (`app/server.ts`, `adapters/store-http.ts`) was consulted only for the swap proof, after the adapter was green.

## Files

| File | Role |
| --- | --- |
| `experiments/contracts-spike/adapters/store-pglite.ts` | the adapter (323 lines) |
| `experiments/contracts-spike/adapters/store-pglite.test.ts` | `runStoreConformance("pglite", ...)` plus three pglite-specific tests (71 lines) |
| `experiments/contracts-spike/package.json` | `@electric-sql/pglite@0.5.8` dependency |
| `experiments/contracts-spike/.gitignore` | `app/data.pglite` |
| `experiments/contracts-spike/app/texo.config.ts` | swapped to pglite for the proof, reverted before the final commit |

Agent-written LOC (`git diff --stat 1bf4c3f`, lockfile and node_modules excluded): 396 insertions, 0 deletions.

## What the adapter does

- `createPgliteStore()` boots an in-memory Postgres; `createPgliteStore("dir")` persists to a directory; `createPgliteStore(pglite, { schema })` shares one PGlite and isolates by Postgres schema (the test file uses this because one PGlite boot costs about 1s).
- Real Postgres column types: `text` (string, enum, date, single relation), `double precision`, `boolean`, `jsonb` (group and many-relation). Types are compared back against `information_schema.columns.data_type`, so a retype is caught and raised as `StoreSchemaError`.
- `migrate` is additive (`ALTER TABLE ADD COLUMN`), refuses a required field without default when rows exist, refuses a relation to an entity it has not seen, leaves dropped columns in place.
- Filters, search, ordering and paging are SQL: `ILIKE` for `contains` and `search`, native `NULLS LAST`, `$n` placeholders, `COUNT(*)::int` for `total`.
- `_ws` column on every table, indexed; every statement is scoped by it; `scoped()` rebinds the same shared state with another workspace id.
- Referential integrity by query: single relations via equality, many relations via jsonb containment (`"labels" @> '["<id>"]'::jsonb`), both inside the scope.
- `include` resolves each requested single relation with one `IN (...)` query per field instead of one per row.
- Subscribe is the shared `createChangeBus`; emits on own writes only.

## Verification

### Test output

`bun test adapters/store-pglite.test.ts`:

```
bun test v1.4.0 (34cbb9a40)

 29 pass
 0 fail
 92 expect() calls
Ran 29 tests across 1 file. [2.32s]
```

Full spike suite, `bun test` in `experiments/contracts-spike` (sqlite, memory, pglite, http, sse, auth, specs, bench):

```
 160 pass
 0 fail
 1258 expect() calls
Ran 160 tests across 8 files. [6.07s]
```

The conformance suite is unchanged. The three extra tests in `store-pglite.test.ts` cover: retype refused with `StoreSchemaError`; the physical column types are the Postgres ones listed above; a directory-persisted store survives close and reopen.

### Swap proof

`app/texo.config.ts` changed to `createPgliteStore("app/data.pglite")`, then `TEXO_PORT=4342 bun run app/server.ts`. Boot log:

```
seeded first user: demo@texo.dev / demo1234 (workspace Demo)
texo host on http://localhost:4342 (API only; UI is the Texo app on :4200)
```

curl round trip (the data API is RPC-shaped, `POST /api/<entity>/<method>` with a JSON array of args):

```
# login
$ curl -s -c $J -X POST localhost:4342/api/_auth/login -H 'content-type: application/json' -d '{"email":"demo@texo.dev","password":"demo1234"}'
{"user":{"id":"c187efc8-10a4-4f2f-8d1f-3723927e412e","email":"demo@texo.dev","name":"Demo"},"workspace":{"id":"44759d47-0c96-4c5d-be22-3a412bfb14c4","slug":"demo","name":"Demo"},"workspaces":[{"id":"44759d47-0c96-4c5d-be22-3a412bfb14c4","slug":"demo","name":"Demo"}]}

# create issue
$ curl -s -b $J -X POST localhost:4342/api/issue/create -H 'content-type: application/json' -d '[{"title":"pglite round trip","priority":2,"checklist":[{"text":"boot"},{"text":"curl","done":true}]}]'
{"id":"9db36229-4765-4a23-ab86-cb24da618d5f","title":"pglite round trip","status":"backlog","priority":2,"done":false,"checklist":[{"done":false,"text":"boot"},{"done":true,"text":"curl"}]}

# list issues (search PGLITE, case-insensitive through ILIKE)
$ curl -s -b $J -X POST localhost:4342/api/issue/list -H 'content-type: application/json' -d '[{"search":"PGLITE"}]'
{"rows":[{"id":"9db36229-4765-4a23-ab86-cb24da618d5f","title":"pglite round trip","status":"backlog","priority":2,"done":false,"checklist":[{"done":false,"text":"boot"},{"done":true,"text":"curl"}]}],"total":1}

# unauthenticated list
401

# data dir
$ ls app/data.pglite | head -5
PG_VERSION
base
global
pg_commit_ts
pg_dynshmem
```

Restarted the host on the same directory, logged in again and listed:

```
{"id":"c187efc8-10a4-4f2f-8d1f-3723927e412e","email":"demo@texo.dev","name":"Demo"}
{"total":1,"titles":["pglite round trip"]}
```

Same user id (no reseed), issue still there: the auth adapter, the spec registry and the issue data all ran on Postgres unchanged. Server killed, `app/texo.config.ts` reverted, `app/data.pglite` removed and gitignored.

## Guesses and ambiguities

Every place the contract or the suite did not say and I had to decide. Resolution in each case is what the adapter does now.

1. **`migrate` on an entity that self-references.** The contract says migrate "refuses when `to` names an entity the store has not seen"; a fresh `issue -> issue` relation has not been seen yet at that moment. The reference adapter exempts `f.to === entity.name`; the suite does not test it. Kept the exemption.
2. **What "has seen" means.** Not defined: migrated, or merely touched by any call? The reference registers an entity in `known` on every `ensure`, i.e. any `list`/`get`/`create` also counts as seen. Copied that. A stricter "migrated only" reading would also pass the suite.
3. **Whether `list`/`get`/`create` on an unmigrated entity should auto-create the table.** The contract says the host calls `migrate` once per entity; it does not say the other methods may assume that. The reference auto-migrates on first touch; I kept it, because the conformance `prepared()` helper migrates everything but the suite's `Store` block relies on `create` after `migrate` only, so either would pass.
4. **Retype detection: comparing against what.** The contract says "destructive or unsupported change" throws. Postgres reports `information_schema.data_type` strings (`double precision`, not `float8`), so the adapter's declared type table must use those spellings. Chose to compare the reported `data_type` against the same string used in `CREATE`/`ALTER`. Not in the suite at all; added a test.
5. **Column removed from the entity.** The suite requires remaining data readable after a narrowing migrate; it does not say whether the column is dropped, nulled or kept. Kept in place, unread (same as the reference). A later re-add with the same type is then silently a no-op ALTER and old values resurface; the suite does not cover that.
6. **Required field re-added to a table with rows.** Guess 5 leads here: `hasRows && !additive` throws even though the column already exists with data. The reference has the same branch order (column missing check first), so an existing column never throws. Copied.
7. **`ne` and NULL.** SQL `col <> $1` drops NULL rows; the in-memory `matches` treats `undefined !== value` as true. Followed `query.ts` (`IS NULL OR <>`), as the reference does. The suite's `ne` case has no nulls in the filtered column.
8. **`in`/`nin` with a non-array value.** `query.ts` treats it as "no match" for `in` and "no match" for `nin` as well. The reference pushes `0` for `in` and `1` for `nin` (everything matches). Followed the reference (`false`/`true`); the two disagree and the suite only tests `in: []`.
9. **`lt`/`gt` on a NULL column.** Postgres returns no row (NULL comparison), `query.ts` returns false: agree. No decision needed but noted because the string comparison of ISO dates relies on `text` collation ordering `2026-01-02 < 2026-02-01`, which holds for `C`/`en_US` but is a property of the column type choice (guess 12).
10. **`contains` on a non-string queryable column (number, boolean, date).** Undefined. Cast with `::text ILIKE` so it never errors; `query.ts` would return false for non-strings. Suite tests strings only.
11. **`search` field set.** Contract: "across string fields (and the title)". `searchable()` in `query.ts` includes `enum` too and never adds the title separately (the title is always a scalar field). Used `searchable()` so pglite matches the other adapters.
12. **`date` storage type.** `text` (ISO string) rather than `timestamptz`/`date`: keeps round-trip byte-identical (`"2026-01-02"` in, `"2026-01-02"` out; the suite does `toEqual` on whole rows) and ordering works because ISO sorts lexically. A real Postgres date type would normalise the string and break `toEqual`.
13. **`number` storage type.** `double precision` for every number field, including `integer: true`. Postgres could use `bigint`/`integer` when `integer` is set, but that would change the retype rule (toggling `integer` becomes a retype) and the contract does not say that flag is structural. Stayed uniform.
14. **`total` type.** `COUNT(*)` is `bigint`, which PGlite hands back as a JS number in practice but is typed as possibly `BigInt`. Cast `::int` to be certain `total` is a `number`.
15. **What `subscribe` emits for `update` with an empty patch.** Not specified. Emits `updated` with the unchanged row (same as the reference).
16. **Order of events vs. the returned promise.** The suite waits 50ms then checks order; it does not say whether emit happens before or after the write resolves. Emit after the row is re-read, synchronously before `create`/`update`/`remove` resolve.
17. **`seq` scope.** Contract: "monotonic per store". Ambiguous whether `scoped()` views share the counter. They share it (one bus per `createPgliteStore` call), because the SSE transport subscribes per scoped store and a per-scope counter would restart on every request.
18. **`origin` on emitted events.** Contract says transports/hosts set it, the `Scope.actorId` doc says "for audit/origin". The reference forwards `scope.actorId` as `origin`; copied so the host's own-echo suppression keeps working.
19. **Whether `include` on a many relation should expand.** Contract says single relations only. Many relations are left as the id array, no error.
20. **`include` on a relation whose target row is gone or in another workspace.** Not specified. Returns `{ id, title: undefined }` (the reference does the same). Referential integrity should make this unreachable within one scope.
21. **`id` in `where`/`orderBy`.** Not in `entity.fields`; the reference special-cases `"id"`. Kept the special case so `where: { id: {...} }` works.
22. **Unknown or non-queryable field in `where`/`orderBy`.** Contract silent on the error type. Threw a plain `Error` like the reference (not a `StoreValidationError`).
23. **`remove` of an unknown id in a different workspace.** The row exists but not in scope; contract says idempotent for unknown ids. Treated as unknown (no-op, no event), no cross-scope leak.
24. **Referential check on `update` when the patch does not touch the relation.** Only the patched relation fields are checked; the reference does the same. Not tested with a stale dangling reference created by a concurrent remove, which the by-query approach cannot prevent without a transaction anyway.
25. **Many-relation reference scan.** The reference does a substring `LIKE '%"id"%'` on JSON text. Postgres has containment, so `@> '["id"]'::jsonb` is exact. Semantics equal for uuid ids; they would differ for ids that are substrings of other ids.
26. **Default workspace column default.** `_ws text NOT NULL DEFAULT 'default'` mirrors `DEFAULT_SCOPE.workspaceId`. Contract does not say the default workspace must be storable under that literal, but the suite's "default scope is its own partition" needs some fixed value.
27. **Persisted-store reopen when the on-disk `_ws` column is missing** (a table created by a pre-scoping build). Contract silent; kept the reference's `ALTER TABLE ADD COLUMN _ws` back-fill path.
28. **`kind` label format.** Contract: "adapter label for manifests". No format given. `pglite (<dataDir or memory://>[, schema <name>])`.
29. **Test isolation strategy.** The assignment allowed fresh instance per test or per-test schema. A PGlite boot is about 1s (measured 1078ms / 779ms), so per-test instances would make the 26 conformance tests take about 30s. Shared instance, fresh Postgres schema per store; all three adapters therefore run the identical suite.
30. **Concurrency inside one store.** PGlite is single-connection; parallel `await`s on one instance are serialised by its internal mutex. The adapter issues each statement independently (no explicit transaction around check + write), same as the reference. Two concurrent creates racing a remove could still produce a dangling id; the contract does not claim transactional integrity.

## Open

- No transaction around "check references, then write" (guess 30). The contract does not require it; a Postgres adapter could offer it cheaply with `db.transaction`, but that changes nothing the suite observes.
- `in`/`nin` with a non-array value differs between `query.ts` and the SQL adapters (guess 8). Worth pinning in the suite so the third adapter and the memory adapter cannot drift.
- Retype and column-removal semantics (guesses 4 to 6) are unpinned by the shared suite; only the pglite test file covers retype.

## Turns

About 30 tool-calling turns from first read to final commit, including the two probe scripts used to learn PGlite's parameter and result conventions and the swap proof.

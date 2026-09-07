# Pitfall ledger

Discovery mode. Each row is a hypothesis the contracts must survive, the probe that attacks it,
and what happened. A FAIL is the goal: it names a contract hole before the real build.

| # | Hypothesis | Probe | Result | Contract implication |
|---|---|---|---|---|
| P1 | A schema-driven form needs no per-field code | Drive every field kind in the browser | FAIL then fixed: Mantine NumberInput emits a string mid-typing; server 422'd `"3"` | UI adapters must coerce to the contract's wire types; contract was right to reject |
| P2 | Transport adds no semantics | http→sqlite runs the same suite as sqlite | PASS 10/10 | Suite is the proof; keep it adapter-agnostic |
| P3 | Adding a field to a live entity just works | Add `dueDate` to `issue` with existing sqlite data | FAIL: `list` silently returned old rows, `create` died with raw `SQLiteError: table issue has no column named dueDate` (500, not a contract error) | FIXED: `Store.migrate(entity)` is now in the contract with `StoreSchemaError`; additive changes reconcile, required-without-default and retype refuse. Two suite tests added; memory passes trivially, which is why the suite must run over a persistent adapter |
| P3a | A prepared-statement cache survives DDL | Same probe, after the ALTER fix | FAIL: bun:sqlite `db.query()` caches by SQL string, so `SELECT *` prepared before `ALTER TABLE` returned the old column set; new defaulted column read as false | FIXED with `db.prepare()`. Adapter-local, but the CLASS is contract-relevant: any adapter with a schema cache must invalidate on migrate. Suite catches it |
| P3c | The wire carries the entity, not just its name | http→sqlite runs the evolution tests | FAIL: `storeHandler` resolves `entities[name]` from the server registry, so a client-side evolved shape never reaches the server; migrate is a no-op over the wire | OPEN. The contract says `Store` methods take an `Entity` value; the transport silently degrades it to a name. Decision needed: (a) server is schema authority and `migrate` is host-only, not a Store method the client can call; or (b) entities serialize over the wire (zod does not). Leaning (a): it matches "code is schema truth" and the admin reading a manifest |
| P3b | Removing or retyping a field is also reconciled | After P3 fix: drop `notes`, change `priority` to enum | sqlite: drop leaves the column (non-destructive), retype refuses with StoreSchemaError. Not yet in the suite | Add suite rows once P3c settles who owns migrate |
| P4 | FieldMeta's 4 kinds cover a real app | Hostile entity: relation, date, string[], json, long text | pending | |
| P5 | Admin needs zero entity/adapter-specific code | Build admin from a manifest only; add entity + swap store, admin unchanged | pending | |
| P6 | Settings (theme) can dogfood the Store contract | Persist theme via `setting` entity, reload, swap store | pending | |
| P7 | Store contract does not leak sqlite | Blind subagent writes a third adapter with different semantics (async, eventually consistent) from contract + suite + reference only | pending | |
| P8 | UI never needs capabilities the Store hides | Table at 10k rows, search, pagination | pending | |
| P9 | A blind agent can extend the admin from contracts alone | Blind subagent adds a panel; count guesses | pending | |

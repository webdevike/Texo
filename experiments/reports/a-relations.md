# Wave 1, slice A: relations, dates, groups first-class in the admin UI

Branch `eva/w1-a-relations`, worktree `work/texo-w1-a-relations`. Ports used: host 4331, vite 4231 (local edits to `app/server.ts` port and `vite.config.mts`; drop on merge).

## What landed

Owned files:

- `src/admin/fields/relation.tsx` (new): `RelationField` (searchable `BaseSelect`) and `RelationManyField` (`BaseMultiSelect`). Options come from `store.list(target, { search, limit: 20 })`, labeled by the target's `title` field, value = id. Search is debounced 150 ms; the server filters, so the combobox's own filter is a passthrough. Ids already selected but absent from the current search page are resolved once via `where: { id: { op: 'in', value } }` so edit forms show titles, never raw ids.
- `src/admin/fields/field-control.tsx` (new): one recursive `FieldControl` per `FieldSpec.kind`. `date` is a native `type="date"` input (ISO `YYYY-MM-DD`, accepted by the contract's `ISO_DATE`). `group` renders a `BaseFieldset` sub-form from `field.fields`; `group repeatable` renders a repeater with add / remove / move up / move down. Also `initialValue`, `initialGroup`, and `compact` (drops empty strings and undefined recursively so optional fields are omitted from the payload).
- `src/admin/entity-form.tsx`: now takes `store: ClientStore` and `resolveEntity(name)`; renders through `FieldControl`; unwraps included `{ id, title }` single relations back to the id when editing. Mantine now only via `@texo/ui` `Base*`.
- `src/admin/entity-table.tsx`: relation cells show the included `title` (falls back to id), many relations show `N linked`, groups show `1 item` / `N items`, dates show the ISO date. Mantine via `Base*`.
- `src/admin/schema-builder.tsx`: kind select gains `date`, `relation`, `group`. Relation editor: target entity select (`entityNames` prop) + `Many` checkbox. Group editor: `Repeatable` checkbox; the group's `fields` render as nested `children` rows in `TexoFieldList`, with their own inline editors, per-level Add, and reorder within the nested level. Rows are addressed by index path (`field-0/2`), so any depth works. Badges: `REPEATABLE` on repeatable groups, `MANY` on many relations. Title field select excludes group/relation fields (the spec validator rejects them). Date editor gets a default date input.
- `packages/ui/src/texo-field-list.tsx`: unchanged; the primitive already rendered `children` and per-level Add, which was enough.

Shared / delimited edits (coordinated over hub):

- `src/admin/entity-page.tsx` (W1Query owns; three lines marked `// W1Relations`): `resolveEntity?` prop with a `() => undefined` default, `include` of every single-relation field on the list call, `store` + `resolveEntity` passed to `EntityForm`. W1Query confirmed they bake the same contract into their rewrite.
- `src/admin/admin-pages.tsx`: `AdminContent` passes `resolveEntity`; `AdminSchema` passes `entityNames={manifest.entities.map((e) => e.name)}`.
- `experiments/contracts-spike/app/server.ts` (W1Auth owns the rest): one block marked `W1Relations` that replaces the migrate loop with `migrateAll(registry, store)`, which migrates relation targets before the entities that reference them (sqlite refuses a relation to an entity it has not seen yet, and `readdirSync` order is alphabetical: `issue` before `member`/`project`). W1Auth keeps a `migrateAll` call site for this.
- `packages/ui/src/components.ts`: added `BaseFieldset` and `BaseMultiSelect` aliases (+ prop types). W1Query adds the identical `BaseMultiSelect` line; integration dedupes.
- `experiments/contracts-spike/app/entities/member.json` (new): `{ name, email? }`, title `name`.
- `experiments/contracts-spike/app/entities/issue.json`: gains `project: relation->project (optional)`, `assignee: relation->member (optional)`, `due: date (optional)`, `checklist: group repeatable { text: string, done: boolean default false } (optional)`. Existing fields kept. All optional, so W1Realtime's bare `create(issue, { title })` still works.

## Verification

- `cd experiments/contracts-spike && bun test`: 71 pass, 0 fail.
- App typecheck (`tsc --noEmit -p tsconfig.app.json`): only the known pre-existing errors (texo-icons:54, texo-theme-provider primaryShade, app.tsx replaceAll, custom-components-page x2, theme-controls:234). No new errors.
- Host boot against the existing `app/data.sqlite`: `bun run app/server.ts` starts; `pragma table_info(issue)` shows the four new columns added additively (`project TEXT`, `assignee TEXT`, `due TEXT`, `checklist TEXT`), `member` table created, existing issue row intact.
- Browser (headless Chromium via the `browser` tool against http://localhost:4231), screenshots in `experiments/reports/a-relations/`:
  - `schema-issue.webp`: Backend > Schema > issue shows `project` / `assignee` as Relation rows, `due` as Date, `checklist` as Component with the `REPEATABLE` badge and its two nested rows (`text` REQUIRED, `done` DEFAULT FALSE) with connector lines and a nested "Add new field".
  - `schema-nested-editor.webp`: the nested `done` row's inline editor open (Name / Kind / Optional).
  - `schema-nested-reorder.webp`: after a pointer drag inside the group, nested order is `done, text` (DOM labels read back as `["done","text"]`); root rows untouched.
  - `schema-relation-editor.webp`: `project` row editor showing Target entity = project and the Many checkbox.
  - `form-filled.webp`: Backend > Content > issue > New issue with project picked by typing `lin` (server search returned only `Linear-lite`), assignee picked by typing `gra` (only `Grace Hopper`), due `2026-10-15` via the date input, two checklist items (`Write spec` done, `Ship it`). Hidden select values read back as the target ids.
  - `table-after-create.webp`: after moving `Ship it` up and clicking Create, the table row reads `Relations demo | backlog | 0 | no | - | Linear-lite | Grace Hopper | 2026-10-15 | 2 items` (project title, not id).
  - `form-edit-rehydrated.webp`: clicking the row reopens the form with `Linear-lite` / `Grace Hopper` labels, the date, and the checklist in stored order.
  - Stored row via the API (`/api/issue/list` with `include`): `project: { id, title: "Linear-lite" }`, `assignee: { id, title: "Grace Hopper" }`, `due: "2026-10-15"`, `checklist: [{ text: "Ship it", done: false }, { text: "Write spec", done: true }]`.
- Servers were stopped and the browser tab released after verification.

## Open / notes

- Contract hole, worked around: `ListQuery.search` only matches string/enum fields (`searchable()` in `adapters/query.ts`), fine for title lookups; relation pickers cap at 20 results per search and do not page further.
- `TexoFieldList` reorder is per level only (cross-level drops are a no-op in the primitive); the schema builder mirrors that.
- Group `NEW` badge is computed only for root fields (nested names are not tracked in `saved`).
- `entity-page.tsx` and `server.ts` edits are intentionally minimal and marked `W1Relations` for Main to carry across W1Query's and W1Auth's rewrites.
- Ports in `app/server.ts` (4331) and `vite.config.mts` (4231) are local to this worktree; revert on merge.

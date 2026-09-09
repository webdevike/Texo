# Texo

Texo is a UI system (Mantine wrapped as `@texo/ui`) plus a design workspace that renders
real pages. Chat threads in that workspace run you in this repository: when Isaac asks for
a page, you write it here and it appears live in the workspace through Vite.

## Designing a page

- One file per page: `preview/src/pages/<id>.tsx` (the preview app is the consumer of the UI system; the admin at :4200 frames it). Export `page = { id: '<id>', label: '<Tab label>' }`
  and a default React component. The workspace discovers the file automatically and opens
  it as a page tab; nothing else needs registering.
- Use only the UI system. Import from `@texo/ui`: the `Base*` components in
  `packages/ui/src/components.ts` (Mantine under stable names, e.g. `BaseStack`, `BaseGroup`,
  `BaseTitle`, `BaseText`, `BaseButton`, `BaseCard`, `BaseBadge`, `BaseTextInput`,
  `BaseSelect`, `BaseTabs`, `BaseDrawer`, `BaseModal`, `BaseTable`) and the `Texo*`
  composites (`TexoDataTable`, `TexoFilterBar`, `TexoBoard`, `TexoFieldList`, `TexoNavItem`, `TexoNavSection`).
  Icons come from `@tabler/icons-react`. No new dependencies, no raw Mantine imports, no
  inline glyph arrows or checks.
- Reuse existing page structure before inventing layout: `preview/src/list-page-layout.tsx`
  and `preview/src/pages/customers.tsx` show the list-page pattern (title, description, quick
  filters, table, details drawer). Copy the pattern, not the data.
- Local, clearly labeled sample data is fine; keep it small (under ten records) and mark
  it "Sample data" on the page.
- Mark meaningful elements for the Prototype tool with `data-target="key"` and
  `data-target-label="Label"`; repeated items add `data-record` and `data-record-label`.
  Nested keys join with dots, so keep keys short (`header`, `filters`, `table`).
- Style with theme tokens and CSS modules next to the page. Border or subtle shadow on a
  surface, never both. No colored edge stripes, no all-caps eyebrows, no em dashes in copy.
  Tables: first column left-aligned, numeric columns right-aligned, other columns centered.
- Requests Isaac made in Prototype mode are in `project/prototype.json` (`page`, `target`,
  `record`, `body`). Read them when asked to act on a page's requests; a request describes
  intent, and it is done only when the page actually behaves that way.

## Verifying

- Typecheck with `node_modules/.bin/tsc --noEmit -p preview/tsconfig.json`. Two diagnostics inside `packages/ui` are
  known baseline (`texo-icons.tsx`, `texo-theme-provider.tsx`); anything else is yours.
- The dev server on port 4200 is already running; do not start another. Isaac sees your
  page at `http://localhost:4200/pages/<id>` as soon as the file compiles.
- Do not run the production build, formatters over the whole repo, or git commands unless
  asked. Say what you built in one short paragraph.

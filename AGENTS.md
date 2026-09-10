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

## Workspace agent context

- Context is owned by Texo, not by chat. Shared serializable types live in
  `src/context/agent-context.ts`; `AgentContextProvider` scopes contributions to the
  current route. Preview, Prototype, and Canvas publish their authoritative state
  with `useAgentContextSource`. Do not add route or iframe collectors to chat.
- Consumers use `useAgentContext().current` for live presentation and `capture()`
  at action time when context is attached. Captures detach nested state; messages persist the same snapshot
  that is delivered to the agent. Historical inspectors must use the message
  attachment, never current workspace state.
- A message attachment of `null` means context was deliberately cleared; an absent
  attachment means legacy history. Keep the composer attachment choice per thread.
  Clearing excludes context from future sends, but does not erase earlier conversation context.
- Preserve explicit `ready`, `loading`, and `unavailable` states. A ready `null`
  selection means nothing selected; it does not mean unavailable. Preview source
  paths come from discovered page modules, not guesses based on route IDs.
- Custom controls such as `TexoChatComposer` may have their own composition, but
  inherit global theme primitives. Register reusable custom examples in
  `src/extensions/registry.ts`; do not restyle ordinary inputs to match a special use case.
- Render agent Markdown with the shared `TexoMarkdown` component. It supports GFM
  while inheriting theme primitives; keep raw HTML disabled and preserve safe URL
  filtering rather than rendering agent output with `dangerouslySetInnerHTML`.

## Verifying

- Typecheck with `node_modules/.bin/tsc --noEmit -p preview/tsconfig.json`. Two diagnostics inside `packages/ui` are
  known baseline (`texo-icons.tsx`, `texo-theme-provider.tsx`); anything else is yours.
- The dev server on port 4200 is already running; do not start another. Isaac sees your
  page at `http://localhost:4200/pages/<id>` as soon as the file compiles.
- Do not run the production build, formatters over the whole repo, or git commands unless
  asked. Say what you built in one short paragraph.

# Wave 1, slice D: Extensions, command palette, hotkeys

Branch `eva/w1-d-extensions`, worktree `work/texo-w1-d-extensions`. Base: `wave1-base` (8ac380a) + brief commit f908026.

## What landed

### Extension loader (contract made real)
- `src/extensions/load.ts`: `import.meta.glob('./*/index.{ts,tsx}', { eager: true })` collects every `default` export, `buildRegistry` aggregates, exports `registry: ExtensionRegistry` and `projectComponents` (merge of every extension's `components`).
- `src/extensions/merge.ts`: the pure half of the loader (`collectExtensions(modules)` sorted by path, `componentsOf(registry)` with duplicate-id rejection). Split out so bun can test it without Vite.
- `src/extensions/index.ts`: re-exports `registry`, `projectComponents`, contract types.
- `src/extensions/registry.ts`: now `export { projectComponents } from './load'` (both importers, `app.tsx` and `custom-components-page.tsx`, keep working).
- `src/extensions/customer-health-card/index.ts`, `src/extensions/field-list/index.ts`: the two existing Custom-page components re-expressed as extensions contributing `components`.

### Backend as an extension
- `src/extensions/backend/index.ts`: routes `/admin`, `/admin/system`, `/admin/content/:name`, `/admin/schema/:name`; nav `New entity` (section `Backend/Schema`) and `System` (section `Backend/Settings`); commands `Go to system` (`g s`), `New entity` (`n e`), `Open app` (`g a`).
- Route elements are prop-less per the contract, so the manifest reaches them through `ManifestProvider` / `useManifest` (exported from the same file); `app.tsx` wraps `<Routes>` in it.
- `src/admin/backend-rail.tsx`: `BackendNav` gains a `nav: NavContribution[]` prop and renders the static Schema/Settings items from the registry (filtered by `Backend/<sub>` section). Entity items stay manifest-driven. Hard-coded `New entity` / `System` rows removed.
- `src/app/app.tsx`: renders `registry.routes` after the built-in preview routes; Backend rail body takes `registry.nav`; rail is now controlled (`activeRail` / `onRailChange`) so commands can drive it; the toolbar's color-scheme button and the `t` hotkey share one `toggleColorScheme`. Added `BaseModal`, `BaseNumberInput`, `BaseKbd`, `BaseComboboxPopover` preview cases (see "Found along the way").

### Command palette and hotkeys (`@texo/ui`)
- `packages/ui/src/texo-hotkeys.ts`: sequence-aware binder. `parseChord` / `parseSequence` (Mousetrap syntax: `mod+k`, `t`, `g i`, `shift+/`), `bindHotkeys(getCommands, target)` with 1s sequence window and `preventDefault` on prefix matches, editable-target filtering (`inInputs` opt-in), `useHotkeys(commands)` (binds once, reads latest via ref), `formatKeys` for keycap glyphs (macOS symbols / Ctrl on other platforms), `keysOf`.
- `packages/ui/src/texo-command-palette.tsx` + `.module.css`: `TexoCommandPalette` on `BaseModal`. Subsequence fuzzy match with word-start/contiguity scoring and highlighted hits, grouped by `group`, keyboard nav (up/down wrap, enter runs, esc closes), keycaps on the right via `TexoKeys`. `rankItems` / `fuzzyMatch` exported.
- `packages/ui/src/components.ts`: `BaseModal`, `BaseKbd` aliases (+ prop types). `index.ts` exports the two new modules.
- `packages/ui/src/texo-app-shell.tsx`: optional controlled `activeRail` / `onRailChange` (uncontrolled `defaultRail` path unchanged).

### App commands (`src/app/commands.tsx`)
- `shellCommands(host, ui)`: `mod+k` palette, `?` / `shift+/` help, `g t` / `g p` / `g b` rails, `[` / `]` cycle rail panel (past either end closes it), `Close rail panel` (palette only), `t` color scheme, `mod+z` / `mod+shift+z` theme undo/redo gated by `canUndo` / `canRedo`.
- `entityCommands(manifest)`: `Go to <entity>` and `New <entity>` per content entity (`/admin/content/<name>` and `?new=1`).
- `useCommands(build)`: flattens registry + shell + entity commands, binds all keys, owns palette and help state, renders both overlays. The help modal lists every command that has keys, grouped.
- Only the palette binding fires inside inputs (`inInputs`), so typing in a search box never triggers `g x` sequences while `mod+k` still works.

### Tests
- `experiments/contracts-spike/contracts/extension.test.ts` (10 tests): `defineExtension` id validation; `buildRegistry` duplicate extension id, duplicate command id across extensions, nav order sort (stable, missing order = 0), route/view flattening, empty input; loader-style merge of two fake extensions through the real `collectExtensions` / `componentsOf` (deterministic path order, non-extension module rejected, component id collision).

## Verification

- `cd experiments/contracts-spike && bun test`: 81 pass, 0 fail (71 existing + 10 new).
- `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json`: only the four known pre-existing errors (texo-icons.tsx:54, texo-theme-provider primaryShade, app.tsx replaceAll, theme-controls.tsx:234).
- Browser (headless Chromium via the omp browser tool, host :4334, vite :4234, screenshots in `experiments/reports/d-extensions/`):
  - `01-palette-sys.webp`: `mod+k` opens the palette; typing `sys` shows `BACKEND / Go to system` with `G S` keycaps and highlighted match. Enter navigates to `/admin/system` (`02-admin-system.webp`, URL asserted).
  - `03-g-b-backend-rail.webp`: `g b` opens the Backend rail with Content / Schema / Settings sections (project, issue, customer; New entity; System). Captured with `sidebar.sections = labeled`; under the default `plain` setting the section labels are `display: none` by design (`--texo-sidebar-section-display`), the items are identical.
  - `04-g-t-theme-rail.webp`: `g t` opens the Theme rail (aside `aria-label` asserted). `]` then `[` cycle Theme -> Pages -> Theme.
  - `05-help-modal.webp`: `?` opens "Keyboard shortcuts" listing 13 bindings in Shell / Rail / Theme / Backend groups (25 keycaps).
  - `06-palette-new-entity.webp`, `07-schema-new.webp`: palette query `new ent` + Enter lands on `/admin/schema/new` with heading "New entity".
  - `08-custom-page.webp`: `/custom` lists both registered components (Customer Health Card, Field List) from the loader-merged registry.
  - `09-palette-all.webp`: empty query shows 18 commands in Shell / Rail / Theme / Backend / Entities; ArrowDown x2 moves the active row; Escape closes.
  - Programmatic: `t` toggles `data-mantine-color-scheme`, `mod+z` reverts it, `mod+shift+z` re-applies; typing `gt` into the Pages search does not switch rails; `mod+k` from inside that input still opens the palette.

## Found along the way

- `/theme` was crashing at `wave1-base` (`input is a void element tag and must neither have children`): `ThemePage` renders every `Base*` alias through `ComponentPreview`, and the default branch passes the label as children. `BaseNumberInput`, `BaseComboboxPopover` (already exported) and the aliases I added (`BaseModal`, `BaseKbd`) all hit that branch. Added explicit preview cases; `/theme` renders again. Any future input-like alias needs a case there too.
- Mantine modals depend on `requestAnimationFrame` for their enter transition; a background headless tab never fires rAF so the palette (and the pre-existing entity create modal) never mount there. `page.bringToFront()` fixes it. Not a product bug, noting for anyone verifying with the browser tool.
- Contract hole: `NavContribution.section` names only the rail panel, but the Backend rail groups into sub-sections. Encoded as `Backend/<sub>` in the section string; `BackendNav` filters by that prefix. A `subsection?` field on the contract would be cleaner.
- Contract hole: `RouteContribution.element` is a bare `ComponentType`, so extension routes cannot receive shell state (the manifest). Solved with a context the extension file exports and the shell provides. A `providers` or `context` contribution, or passing a host object to route elements, would remove the coupling to `../extensions/backend` from `app.tsx`.
- Contract hole: `CommandContribution` has no way to say a binding should fire inside editable elements. The binder has `inInputs`; the shell sets it for the palette only.
- `pnpm` is not on PATH under the nx serve wrapper (`/bin/sh: pnpm: command not found` in the logs); vite still starts. Cosmetic.

## Open

- `New <entity>` navigates to `/admin/content/<name>?new=1`. W1Query (owner of `entity-page.tsx`) confirmed their version seeds the create modal from that param and clears it on close; on this branch the page just opens the entity list.
- Ports: verified with `server.ts` on 4334 and `vite.config.mts` on 4234 as local uncommitted edits (stashed, not on the branch). The branch still points at 4321 / 4200.
- W1Auth adds `<WorkspaceSwitcher />` as the first child of the `actions` BaseGroup in `app.tsx`; that block is unchanged in shape here except `onClick={toggleColorScheme}` on the scheme button, so the merge should be trivial.

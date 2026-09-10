# Pages workspace and Prototype requests

Route: `/pages/:pageId`. The page itself runs in the consumer app (`preview/`, its own Vite server on :4210 proxied at `/preview/`) inside a same-origin frame, so edits to pages or `packages/ui` only reload the frame. Layout follows the wireframe: icon rail,
sidebar, page tabs in the top row, a toolbar with **Prototype** on the right, and the real
page rendered inset below.

## Framing a project
`pnpm texo dev <path>` (or `node tools/texo.mts dev <path>`) frames the project at `path`
instead of the bundled consumer app. The project holds a `texo.json`:

```json
{ "url": "http://localhost:3000", "agentRoot": "../.." }
```

`/preview/` is proxied to `url` (the app must serve itself under `/preview/`, e.g. Vite `base`)
and chat agents run in `agentRoot` (default: the project directory itself; point it at the
monorepo root so the agent sees the whole repo). The app installs `@texo/ui`
(`github:webdevike/Texo#ui-v<version>`, published by `node tools/release-ui.mts`) and mounts
`useTexoBridge` with its page list (`id`, `label`, `path`, `sourcePath` relative to
`agentRoot`), `TexoThemeProvider`, and `TexoThemeSync` to follow the admin's theme.

Per-project state lives next to `texo.json`: `texo.theme.json` is the theme the admin last
saved (served at `/__texo/theme`, seeded into the admin at boot, and imported by the app as
its `TexoThemeProvider` initial so the decision ships with it; commit it) and `.texo/threads/`
holds chat transcripts plus their omp session mapping (gitignore it). Without a project,
`preview/` runs on :4210 and threads live in `project/threads/`.

## Prototype mode
- **Off**: the page runs as built (row click opens the details drawer).
- **On**: the page is inert. Hovering highlights the nearest `data-target` element and
  names it; clicking opens a floating composer anchored to that spot. Saving adds a pin and a
  row in the **Requests** rail panel.
- A request records intent only. Nothing wires the described interaction up.

## Targets
Pages (`preview/src/pages/*.tsx`) mark elements with `data-target="key"` and `data-target-label="Label"`. Nested keys
join with dots (`page.content.table.row`). Repeated elements add `data-record` and
`data-record-label`; `data-record-template` (table rows) makes the composer default to
"every record" instead of "only this one".

## Persistence
`project/prototype.json`, served by `tools/project-files.ts` alongside `project/canvas.json`.
Explicit **Save requests**; external edits while dirty surface as a conflict with a
**Reload requests** button. Requests whose record is not rendered (filtered out) are listed
as "Not on screen with the current filters." rather than dropped.

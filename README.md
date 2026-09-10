# Texo

A design system and a live design workspace for React apps.

- `packages/ui` is `@texo/ui`: Mantine 9 under stable `Base*` names, `Texo*` composites, theme presets, and the bridge that lets the workspace frame an app.
- The root app is the workspace (`:4200`): pages, Prototype requests, theme editing, a canvas, and chat threads that run an `omp` agent inside your project.

## Use it in a project

Install the design system from a release tag (no registry):

```sh
npm i "@texo/ui@github:webdevike/Texo#ui-v0.2.1"
```

Then plug the workspace in. TanStack Start:

```ts
// vite.config.ts
import { texo } from '@texo/ui/tanstack-start/vite'
export default defineConfig({ plugins: [texo(), tanstackStart(), viteReact()] })
```

```tsx
// root route
import { TexoColorSchemeScript, TexoThemeProvider, TexoThemeSync } from '@texo/ui'
import { TexoBridge } from '@texo/ui/tanstack-start'
import theme from '../texo.theme.json'

<TexoThemeProvider initial={theme}>
  <TexoThemeSync />
  <TexoBridge pages={[{ id: 'customers', label: 'Customers', path: '/customers', sourcePath: 'src/routes/customers.tsx' }]} />
  ...
</TexoThemeProvider>
```

Next.js: `withTexo()` from `@texo/ui/next/config` in `next.config` and `<TexoBridge pages />` from `@texo/ui/next` in the root layout.

Add a `texo.json` beside the app:

```json
{
  "url": "http://localhost:3000",
  "agentRoot": "../..",
  "components": "src/components/texo/*/definition.ts"
}
```

Run the app with `TEXO_PREVIEW=1` (it serves itself under `/preview/`), then from this repo:

```sh
pnpm install
pnpm texo dev ../my-app
```

Open http://localhost:4200. The workspace proxies `/preview/` to your dev server on its own origin, lists the pages your bridge declares, edits the theme (saved to your project's `texo.theme.json`), highlights `data-target` elements in Prototype mode, shows your `defineTexoComponent` modules on the Custom page, and runs chat agents in `agentRoot` with transcripts under `.texo/threads/` (gitignore it).

Details: `docs/pages-prototype.md`. Conventions for agents working in a Texo project: see `AGENTS.md` here and write one in your project.

## Develop the design system

```sh
pnpm texo dev            # workspace framing the bundled preview/ app
TEXO_UI_SRC=/path/to/Texo npm run dev   # in a consumer: use this checkout's packages/ui source with HMR
node tools/release-ui.mts               # build packages/ui and push ui-release + ui-v<version>
```

Bump `packages/ui/package.json` before releasing; the script refuses to reuse a tag.

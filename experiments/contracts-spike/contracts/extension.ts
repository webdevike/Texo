// FROZEN SURFACE (2026-09-07, wave 1). What a folder contributes to an app.
//
// An extension is `src/extensions/<name>/index.ts` exporting `default defineExtension({...})`.
// The loader (`src/extensions/load.ts`, wave 1 slice D) uses `import.meta.glob` and builds the
// registries the shell reads: routes, nav, commands, views, components. Entities are NOT
// contributed here: they are spec files owned by the host (schema authority); an extension
// may ship `entities/*.json` that the host imports at boot, but the runtime registry is the host's.
import type { ComponentType, ReactNode } from "react";

export interface RouteContribution {
  path: string;
  element: ComponentType;
  /** Optional page title for the shell. */
  title?: string;
}

export interface NavContribution {
  /** Which rail panel section the item belongs to, e.g. "Pages" or "Backend". */
  section: string;
  label: string;
  path: string;
  icon?: ReactNode;
  order?: number;
}

export interface CommandContribution {
  id: string;
  label: string;
  /** Mousetrap/hotkey syntax, e.g. "c", "g i", "mod+k". Global unless `when` narrows it. */
  keys?: string | string[];
  /** Optional predicate evaluated against the current location; absent = always. */
  when?: (ctx: { pathname: string }) => boolean;
  run: (ctx: { navigate: (path: string) => void; pathname: string }) => void | Promise<void>;
  /** Grouping label in the palette. */
  group?: string;
}

/** A named view over an entity (list, board, ...) that the Content page and app can render. */
export interface ViewContribution {
  id: string;
  entity: string;
  label: string;
  component: ComponentType<{ entity: string }>;
}

export interface ExtensionDefinition {
  id: string;
  name: string;
  routes?: RouteContribution[];
  nav?: NavContribution[];
  commands?: CommandContribution[];
  views?: ViewContribution[];
  /** Registry entries for the Custom page (existing `defineTexoComponent` shape). */
  components?: Record<string, unknown>;
}

export function defineExtension(def: ExtensionDefinition): ExtensionDefinition {
  if (!/^[a-z][a-z0-9-]*$/.test(def.id)) throw new Error(`extension id "${def.id}" must be kebab-case`);
  return def;
}

export interface ExtensionRegistry {
  extensions: ExtensionDefinition[];
  routes: RouteContribution[];
  nav: NavContribution[];
  commands: CommandContribution[];
  views: ViewContribution[];
}

export function buildRegistry(defs: ExtensionDefinition[]): ExtensionRegistry {
  const ids = new Set<string>();
  for (const d of defs) {
    if (ids.has(d.id)) throw new Error(`duplicate extension id "${d.id}"`);
    ids.add(d.id);
  }
  const commands = defs.flatMap((d) => d.commands ?? []);
  const cmdIds = new Set<string>();
  for (const c of commands) {
    if (cmdIds.has(c.id)) throw new Error(`duplicate command id "${c.id}"`);
    cmdIds.add(c.id);
  }
  return {
    extensions: defs,
    routes: defs.flatMap((d) => d.routes ?? []),
    nav: defs.flatMap((d) => d.nav ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    commands,
    views: defs.flatMap((d) => d.views ?? []),
  };
}

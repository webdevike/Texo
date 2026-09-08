// Pure merge step of the extension loader, kept free of `import.meta.glob` so the contract
// test can exercise it under bun without Vite.
import type { TexoComponentRegistry } from '@texo/ui';

import type { ExtensionDefinition, ExtensionRegistry } from '../../experiments/contracts-spike/contracts/extension';

/** Glob modules keyed by path, each default-exporting an extension. Sorted by path so the result is deterministic. */
export function collectExtensions(modules: Record<string, { default?: unknown }>): ExtensionDefinition[] {
  return Object.keys(modules)
    .sort()
    .map((path) => {
      const def = modules[path].default;
      if (!def || typeof def !== 'object' || typeof (def as ExtensionDefinition).id !== 'string') {
        throw new Error(`extension module ${path} must default-export defineExtension({...})`);
      }
      return def as ExtensionDefinition;
    });
}

/** Custom page registry: the merge of every extension's `components`, ids must be unique. */
export function componentsOf(registry: ExtensionRegistry): TexoComponentRegistry {
  const out: TexoComponentRegistry = {};
  for (const ext of registry.extensions) {
    for (const [id, def] of Object.entries(ext.components ?? {})) {
      if (out[id]) throw new Error(`duplicate component id "${id}" (extension "${ext.id}")`);
      out[id] = def as TexoComponentRegistry[string];
    }
  }
  return out;
}

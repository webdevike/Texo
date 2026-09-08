// The extension loader. Every `src/extensions/<name>/index.ts` default-exports
// `defineExtension({...})`; Vite collects them at build time and `buildRegistry` aggregates
// the routes, nav, commands, views and Custom-page components the shell reads.
import type { TexoComponentRegistry } from '@texo/ui';

import { buildRegistry, type ExtensionRegistry } from '../../experiments/contracts-spike/contracts/extension';
import { collectExtensions, componentsOf } from './merge';

const modules = import.meta.glob<{ default?: unknown }>('./*/index.{ts,tsx}', { eager: true });

export const registry: ExtensionRegistry = buildRegistry(collectExtensions(modules));

/** Custom page registry: the merge of every extension's `components`. */
export const projectComponents: TexoComponentRegistry = componentsOf(registry);

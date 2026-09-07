// What the admin knows about the running app. Read-only description; adapters are still
// chosen in texo.config.ts. This is the admin's ONLY input (P5).
import type { EntitySpec } from "../contracts/entity";
import { specOf } from "../contracts/entity";
import type { Store } from "../contracts/store";
import type { Registry } from "./specs";

export interface Manifest {
  entities: EntitySpec[];
  adapters: { store: string; transport: string };
  /** Built-in entities the framework owns (settings). Hidden from Content, editable in their own panel. */
  system: string[];
}

export function manifest(registry: Registry, store: Store, system: string[]): Manifest {
  return {
    entities: registry.all().map(specOf),
    adapters: { store: store.kind, transport: "http (Bun.serve)" },
    system,
  };
}

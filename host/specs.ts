// Entity specs live as JSON files (one per entity) so the admin, the agent and a human all
// edit the same artifact. The host loads them, derives zod, and migrates the store.
import { readdirSync, readFileSync, unlinkSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { defineEntity, type Entity, type EntitySpec, EntitySpecSchema, specOf } from "../contracts/entity";
import type { Store } from "../contracts/store";

export interface Registry {
  all(): Entity[];
  get(name: string): Entity | undefined;
  /** Validate, migrate the store against the new shape, then persist the spec file. */
  put(spec: EntitySpec): Promise<Entity>;
  remove(name: string): void;
}

export function createSpecRegistry(dir: string, store: Store): Registry {
  mkdirSync(dir, { recursive: true });
  const entities: Record<string, Entity> = {};

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const spec = EntitySpecSchema.parse(JSON.parse(readFileSync(join(dir, file), "utf8")));
    entities[spec.name] = defineEntity(spec);
  }

  return {
    all: () => Object.values(entities),
    get: (name) => entities[name],
    async put(spec) {
      const entity = defineEntity(spec); // validates
      await store.migrate(entity); // refuses destructive changes before anything is written
      writeFileSync(join(dir, `${entity.name}.json`), `${JSON.stringify(specOf(entity), null, 2)}\n`);
      entities[entity.name] = entity;
      return entity;
    },
    remove(name) {
      if (!entities[name]) return;
      delete entities[name];
      unlinkSync(join(dir, `${name}.json`)); // spec only; the store's data is left in place
    },
  };
}

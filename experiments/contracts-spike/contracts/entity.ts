// The one thing an app author (human, agent, or admin UI) writes: a serializable entity spec.
// zod is DERIVED from it, never authored, so specs travel over the wire and live as JSON files.
import { z } from "zod";

export type FieldKind = "string" | "number" | "boolean" | "enum";

interface FieldBase {
  name: string;
  optional?: boolean;
}
export type FieldSpec =
  | (FieldBase & { kind: "string"; default?: string; min?: number; max?: number; long?: boolean })
  | (FieldBase & { kind: "number"; default?: number; min?: number; max?: number; integer?: boolean })
  | (FieldBase & { kind: "boolean"; default?: boolean })
  | (FieldBase & { kind: "enum"; default?: string; options: string[] });

export interface EntitySpec {
  name: string;
  /** Field whose value labels a row. */
  title: string;
  fields: FieldSpec[];
}

export interface Entity extends EntitySpec {
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
}

export type Row = { id: string } & Record<string, unknown>;
export type Input = Record<string, unknown>;

const NAME = /^_?[a-z][a-z0-9_]*$/;

/** The spec's own validator: the admin API and the file loader both run it. */
export const EntitySpecSchema: z.ZodType<EntitySpec> = z.object({
  name: z.string().regex(NAME, "lowercase snake_case"),
  title: z.string(),
  fields: z.array(
    z.discriminatedUnion("kind", [
      z.object({ name: z.string().regex(NAME), kind: z.literal("string"), optional: z.boolean().optional(), default: z.string().optional(), min: z.number().optional(), max: z.number().optional(), long: z.boolean().optional() }),
      z.object({ name: z.string().regex(NAME), kind: z.literal("number"), optional: z.boolean().optional(), default: z.number().optional(), min: z.number().optional(), max: z.number().optional(), integer: z.boolean().optional() }),
      z.object({ name: z.string().regex(NAME), kind: z.literal("boolean"), optional: z.boolean().optional(), default: z.boolean().optional() }),
      z.object({ name: z.string().regex(NAME), kind: z.literal("enum"), optional: z.boolean().optional(), default: z.string().optional(), options: z.array(z.string()).min(1) }),
    ]),
  ),
}).superRefine((spec, ctx) => {
  const names = spec.fields.map((f) => f.name);
  if (names.includes("id")) ctx.addIssue({ code: "custom", message: `"id" is reserved, the store assigns it`, path: ["fields"] });
  if (new Set(names).size !== names.length) ctx.addIssue({ code: "custom", message: "duplicate field names", path: ["fields"] });
  if (!names.includes(spec.title)) ctx.addIssue({ code: "custom", message: `title "${spec.title}" is not a field`, path: ["title"] });
  for (const f of spec.fields) {
    if (f.kind === "enum" && f.default !== undefined && !f.options.includes(f.default)) {
      ctx.addIssue({ code: "custom", message: `default "${f.default}" is not an option`, path: ["fields", f.name] });
    }
  }
});

function zodFor(f: FieldSpec): z.ZodTypeAny {
  let t: z.ZodTypeAny;
  switch (f.kind) {
    case "string": {
      let s = z.string();
      if (f.min !== undefined) s = s.min(f.min);
      if (f.max !== undefined) s = s.max(f.max);
      t = s;
      break;
    }
    case "number": {
      let n = z.number();
      if (f.integer) n = n.int();
      if (f.min !== undefined) n = n.min(f.min);
      if (f.max !== undefined) n = n.max(f.max);
      t = n;
      break;
    }
    case "boolean":
      t = z.boolean();
      break;
    case "enum":
      t = z.enum(f.options as [string, ...string[]]);
      break;
  }
  if (f.default !== undefined) t = t.default(f.default);
  else if (f.optional) t = t.optional();
  return t;
}

export function defineEntity(spec: EntitySpec): Entity {
  const parsed = EntitySpecSchema.parse(spec);
  return { ...parsed, schema: z.object(Object.fromEntries(parsed.fields.map((f) => [f.name, zodFor(f)]))) };
}

/** The wire/file form: everything but the derived schema. */
export function specOf(entity: Entity): EntitySpec {
  return { name: entity.name, title: entity.title, fields: entity.fields };
}

/** True when `f` is satisfied by existing rows that lack it (used by migrations). */
export function fieldIsAdditive(f: FieldSpec): boolean {
  return f.optional === true || f.default !== undefined;
}

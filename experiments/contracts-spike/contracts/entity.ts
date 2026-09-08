// The one thing an app author (human, agent, or admin UI) writes: a serializable entity spec.
// zod is DERIVED from it, never authored, so specs travel over the wire and live as JSON files.
//
// FROZEN SURFACE (2026-09-07, wave 1). Field kinds:
//   string | number | boolean | enum          scalars (rung 1)
//   date                                       ISO-8601 string, validated
//   relation { to, many? }                     reference to another entity's row id(s); a value of
//                                              `string` (or `string[]` when many). Referential
//                                              integrity is the Store's job (see store.ts).
//   group { fields, repeatable? }              embedded value object (or array of them). Stored as
//                                              JSON by adapters; not filterable/sortable.
import { z } from "zod";

export type FieldKind = "string" | "number" | "boolean" | "enum" | "date" | "relation" | "group";

interface FieldBase {
  name: string;
  optional?: boolean;
}
export type FieldSpec =
  | (FieldBase & { kind: "string"; default?: string; min?: number; max?: number; long?: boolean })
  | (FieldBase & { kind: "number"; default?: number; min?: number; max?: number; integer?: boolean })
  | (FieldBase & { kind: "boolean"; default?: boolean })
  | (FieldBase & { kind: "enum"; default?: string; options: string[] })
  | (FieldBase & { kind: "date"; default?: string })
  | (FieldBase & { kind: "relation"; to: string; many?: boolean })
  | (FieldBase & { kind: "group"; fields: FieldSpec[]; repeatable?: boolean });

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
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

const name = z.string().regex(NAME, "lowercase snake_case");
const optional = z.boolean().optional();

const FieldSpecSchema: z.ZodType<FieldSpec> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({ name, kind: z.literal("string"), optional, default: z.string().optional(), min: z.number().optional(), max: z.number().optional(), long: z.boolean().optional() }),
    z.object({ name, kind: z.literal("number"), optional, default: z.number().optional(), min: z.number().optional(), max: z.number().optional(), integer: z.boolean().optional() }),
    z.object({ name, kind: z.literal("boolean"), optional, default: z.boolean().optional() }),
    z.object({ name, kind: z.literal("enum"), optional, default: z.string().optional(), options: z.array(z.string()).min(1) }),
    z.object({ name, kind: z.literal("date"), optional, default: z.string().regex(ISO_DATE).optional() }),
    z.object({ name, kind: z.literal("relation"), optional, to: name, many: z.boolean().optional() }),
    z.object({ name, kind: z.literal("group"), optional, fields: z.array(FieldSpecSchema).min(1), repeatable: z.boolean().optional() }),
  ]),
);

function checkFields(fields: FieldSpec[], ctx: z.RefinementCtx, path: (string | number)[]) {
  const names = fields.map((f) => f.name);
  if (names.includes("id")) ctx.addIssue({ code: "custom", message: `"id" is reserved, the store assigns it`, path });
  if (new Set(names).size !== names.length) ctx.addIssue({ code: "custom", message: "duplicate field names", path });
  for (const f of fields) {
    if (f.kind === "enum" && f.default !== undefined && !f.options.includes(f.default)) {
      ctx.addIssue({ code: "custom", message: `default "${f.default}" is not an option`, path: [...path, f.name] });
    }
    if (f.kind === "group") checkFields(f.fields, ctx, [...path, f.name, "fields"]);
  }
}

/** The spec's own validator: the admin API and the file loader both run it. */
export const EntitySpecSchema: z.ZodType<EntitySpec> = z
  .object({ name, title: z.string(), fields: z.array(FieldSpecSchema) })
  .superRefine((spec, ctx) => {
    checkFields(spec.fields, ctx, ["fields"]);
    const top = spec.fields.find((f) => f.name === spec.title);
    if (!top) ctx.addIssue({ code: "custom", message: `title "${spec.title}" is not a field`, path: ["title"] });
    else if (top.kind === "group" || top.kind === "relation") ctx.addIssue({ code: "custom", message: `title must be a scalar field`, path: ["title"] });
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
    case "date":
      t = z.string().regex(ISO_DATE, "ISO-8601 date");
      break;
    case "relation":
      t = f.many ? z.array(z.string()) : z.string();
      break;
    case "group": {
      const obj = z.object(Object.fromEntries(f.fields.map((c) => [c.name, zodFor(c)])));
      t = f.repeatable ? z.array(obj) : obj;
      break;
    }
  }
  if ("default" in f && f.default !== undefined) t = t.default(f.default);
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
  return f.optional === true || ("default" in f && f.default !== undefined);
}

/** Fields a store can filter/sort on: scalars, dates, single relations. Groups and many-relations are not. */
export function fieldIsQueryable(f: FieldSpec): boolean {
  return f.kind !== "group" && !(f.kind === "relation" && f.many);
}

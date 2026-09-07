// The one thing an app author writes. Everything else (storage, table, form) derives from it.
import { z } from "zod";

export type FieldKind = "string" | "number" | "boolean" | "enum";

export interface FieldMeta {
  name: string;
  kind: FieldKind;
  optional: boolean;
  /** Present when kind === "enum". */
  options?: readonly string[];
  /** Present when the schema declares a default. */
  defaultValue?: unknown;
}

// Default `any`: a concrete Entity<{title: ZodString}> must be assignable to bare `Entity`
// (ZodObject is invariant in its shape), and `Entity` is the type every contract names.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Entity<Shape extends z.ZodRawShape = any> {
  name: string;
  schema: z.ZodObject<Shape>;
  /** Field whose value labels a row (detail headers, selects). */
  title: keyof Shape & string;
  fields: FieldMeta[];
}

export type Row<E extends Entity> = z.infer<E["schema"]> & { id: string };
export type Input<E extends Entity> = z.input<E["schema"]>;

/** Unwrap optional/default wrappers and read the field kind from the zod v4 def. */
function describe(name: string, field: z.ZodTypeAny): FieldMeta {
  let def = field._zod.def as { type: string; innerType?: z.ZodTypeAny; entries?: Record<string, string>; defaultValue?: unknown };
  let optional = false;
  let defaultValue: unknown;
  while (def.type === "optional" || def.type === "default" || def.type === "nullable") {
    if (def.type === "optional" || def.type === "nullable") optional = true;
    if (def.type === "default") defaultValue = def.defaultValue;
    def = def.innerType!._zod.def as typeof def;
  }
  const kind = def.type;
  if (kind !== "string" && kind !== "number" && kind !== "boolean" && kind !== "enum") {
    throw new Error(`${name}: unsupported field type "${kind}" (rung 1 supports string, number, boolean, enum)`);
  }
  return {
    name,
    kind,
    optional,
    ...(kind === "enum" ? { options: Object.values(def.entries!) } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
  };
}

export function defineEntity<Shape extends z.ZodRawShape>(config: {
  name: string;
  fields: Shape;
  title: keyof Shape & string;
}): Entity<Shape> {
  if ("id" in config.fields) throw new Error(`${config.name}: "id" is reserved, the store assigns it`);
  const schema = z.object(config.fields);
  return {
    name: config.name,
    schema,
    title: config.title,
    fields: Object.entries(config.fields).map(([name, field]) => describe(name, field as z.ZodTypeAny)),
  };
}

// Form rendered from entity.fields. No per-entity code.
import { Button, Group, NumberInput, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useState } from "react";
import type { Entity, FieldMeta, Input } from "../contracts/entity";
import { StoreValidationError } from "../contracts/store";

function FieldControl({ field, value, onChange }: { field: FieldMeta; value: unknown; onChange: (v: unknown) => void }) {
  const label = field.name;
  switch (field.kind) {
    case "string":
      return <TextInput label={label} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.currentTarget.value)} required={!field.optional} />;
    case "number":
      return <NumberInput label={label} value={typeof value === "number" ? value : ""} onChange={(v) => onChange(v === "" ? undefined : typeof v === "string" ? Number(v) : v)} required={!field.optional} />;
    case "boolean":
      return <Switch label={label} checked={value === true} onChange={(e) => onChange(e.currentTarget.checked)} />;
    case "enum":
      return <Select label={label} data={[...(field.options ?? [])]} value={typeof value === "string" ? value : null} onChange={(v) => onChange(v ?? undefined)} required={!field.optional} />;
  }
}

function initial(entity: Entity, row?: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of entity.fields) out[f.name] = row?.[f.name] ?? f.defaultValue ?? (f.kind === "boolean" ? false : undefined);
  return out;
}

export function EntityForm<E extends Entity>({ entity, row, onSubmit, onCancel }: {
  entity: E;
  /** When present the form edits; otherwise it creates. */
  row?: Record<string, unknown>;
  onSubmit: (values: Input<E>) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(() => initial(entity, row));
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      const cleaned = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== ""));
      await onSubmit(cleaned as Input<E>);
    } catch (e) {
      if (e instanceof StoreValidationError) {
        setError(e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      } else setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="sm">
      {entity.fields.map((f) => (
        <FieldControl key={f.name} field={f} value={values[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
      ))}
      {error && <div style={{ color: "var(--mantine-color-red-6)", fontSize: 13 }}>{error}</div>}
      <Group justify="flex-end" gap="xs">
        <Button variant="subtle" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit} loading={busy}>{row ? "Save" : "Create"}</Button>
      </Group>
    </Stack>
  );
}

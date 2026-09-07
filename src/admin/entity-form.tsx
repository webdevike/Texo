// Form rendered from entity.fields. No per-entity code.
import { Button, Group, NumberInput, Select, Stack, Switch, Text, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";
import type { Entity, FieldSpec, Input, Row } from "../../experiments/contracts-spike/contracts/entity";
import { StoreValidationError } from "../../experiments/contracts-spike/contracts/store";

function FieldControl({ field, value, onChange }: { field: FieldSpec; value: unknown; onChange: (v: unknown) => void }) {
  const label = field.name;
  const required = !field.optional && field.default === undefined;
  switch (field.kind) {
    case "string":
      return field.long
        ? <Textarea label={label} autosize minRows={3} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.currentTarget.value)} required={required} />
        : <TextInput label={label} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.currentTarget.value)} required={required} />;
    case "number":
      // Mantine emits a string mid-typing (P1); the contract wants a number.
      return <NumberInput label={label} min={field.min} max={field.max} allowDecimal={!field.integer} value={typeof value === "number" ? value : ""} onChange={(v) => onChange(v === "" ? undefined : typeof v === "string" ? Number(v) : v)} required={required} />;
    case "boolean":
      return <Switch label={label} checked={value === true} onChange={(e) => onChange(e.currentTarget.checked)} />;
    case "enum":
      return <Select label={label} data={field.options} value={typeof value === "string" ? value : null} onChange={(v) => onChange(v ?? undefined)} required={required} />;
  }
}

function initial(entity: Entity, row?: Row): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of entity.fields) out[f.name] = row?.[f.name] ?? f.default ?? (f.kind === "boolean" ? false : undefined);
  return out;
}

export function EntityForm({ entity, row, onSubmit, onCancel }: {
  entity: Entity;
  /** When present the form edits; otherwise it creates. */
  row?: Row;
  onSubmit: (values: Input) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(() => initial(entity, row));
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== "")));
    } catch (e) {
      if (e instanceof StoreValidationError) setError(e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      else setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="sm">
      {entity.fields.map((f) => (
        <FieldControl key={f.name} field={f} value={values[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
      ))}
      {error && <Text c="red" size="sm">{error}</Text>}
      <Group justify="flex-end" gap="xs">
        <Button variant="subtle" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit} loading={busy}>{row ? "Save" : "Create"}</Button>
      </Group>
    </Stack>
  );
}

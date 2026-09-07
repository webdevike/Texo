// Strapi's content-type builder, over EntitySpec. Saving PUTs the spec: validate → migrate → write.
// A refused migration (StoreSchemaError) comes back as a 409 and is shown, nothing changes.
import { ActionIcon, Button, Checkbox, Group, NumberInput, Select, Stack, Table, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import type { EntitySpec, FieldSpec } from "../../experiments/contracts-spike/contracts/entity";
import { host } from "./client";

const KINDS: FieldSpec["kind"][] = ["string", "number", "boolean", "enum"];

function blankField(kind: FieldSpec["kind"] = "string"): FieldSpec {
  return kind === "enum" ? { name: "", kind, options: ["a", "b"] } : { name: "", kind };
}

function retype(f: FieldSpec, kind: FieldSpec["kind"]): FieldSpec {
  return { ...blankField(kind), name: f.name, optional: f.optional };
}

function FieldRow({ field, onChange, onRemove }: { field: FieldSpec; onChange: (f: FieldSpec) => void; onRemove: () => void }) {
  const set = (patch: Record<string, unknown>) => onChange({ ...field, ...patch } as FieldSpec);
  return (
    <Table.Tr>
      <Table.Td><TextInput size="xs" value={field.name} placeholder="field_name" onChange={(e) => set({ name: e.currentTarget.value })} /></Table.Td>
      <Table.Td><Select size="xs" data={KINDS} value={field.kind} onChange={(k) => k && onChange(retype(field, k as FieldSpec["kind"]))} /></Table.Td>
      <Table.Td>
        {field.kind === "string" && (
          <Group gap="xs" wrap="nowrap">
            <TextInput size="xs" w={110} placeholder="default" value={field.default ?? ""} onChange={(e) => set({ default: e.currentTarget.value || undefined })} />
            <Checkbox size="xs" label="long" checked={field.long ?? false} onChange={(e) => set({ long: e.currentTarget.checked || undefined })} />
          </Group>
        )}
        {field.kind === "number" && (
          <Group gap="xs" wrap="nowrap">
            <NumberInput size="xs" w={90} placeholder="default" value={field.default ?? ""} onChange={(v) => set({ default: v === "" ? undefined : Number(v) })} />
            <NumberInput size="xs" w={70} placeholder="min" value={field.min ?? ""} onChange={(v) => set({ min: v === "" ? undefined : Number(v) })} />
            <NumberInput size="xs" w={70} placeholder="max" value={field.max ?? ""} onChange={(v) => set({ max: v === "" ? undefined : Number(v) })} />
            <Checkbox size="xs" label="int" checked={field.integer ?? false} onChange={(e) => set({ integer: e.currentTarget.checked || undefined })} />
          </Group>
        )}
        {field.kind === "boolean" && (
          <Checkbox size="xs" label="default true" checked={field.default ?? false} onChange={(e) => set({ default: e.currentTarget.checked })} />
        )}
        {field.kind === "enum" && (
          <Group gap="xs" wrap="nowrap">
            <TextInput size="xs" w={200} placeholder="a, b, c" value={field.options.join(", ")} onChange={(e) => set({ options: e.currentTarget.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            <Select size="xs" w={110} placeholder="default" data={field.options} value={field.default ?? null} onChange={(v) => set({ default: v ?? undefined })} clearable />
          </Group>
        )}
      </Table.Td>
      <Table.Td><Checkbox size="xs" checked={field.optional ?? false} onChange={(e) => set({ optional: e.currentTarget.checked || undefined })} /></Table.Td>
      <Table.Td><ActionIcon variant="subtle" color="red" onClick={onRemove}><IconTrash size={14} /></ActionIcon></Table.Td>
    </Table.Tr>
  );
}

export function SchemaBuilder({ spec: initial, isNew, onSaved, onDeleted }: {
  spec: EntitySpec;
  isNew: boolean;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [spec, setSpec] = useState<EntitySpec>(initial);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(undefined);
    try {
      await host.putSpec(spec);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="md">
      <Group align="flex-end">
        <TextInput label="Entity name" value={spec.name} disabled={!isNew} onChange={(e) => setSpec({ ...spec, name: e.currentTarget.value })} />
        <Select label="Title field" data={spec.fields.map((f) => f.name).filter(Boolean)} value={spec.title || null} onChange={(v) => setSpec({ ...spec, title: v ?? "" })} />
      </Group>
      <Table withTableBorder>
        <Table.Thead>
          <Table.Tr><Table.Th>name</Table.Th><Table.Th>kind</Table.Th><Table.Th>options</Table.Th><Table.Th>optional</Table.Th><Table.Th /></Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {spec.fields.map((f, i) => (
            <FieldRow
              key={i}
              field={f}
              onChange={(nf) => setSpec({ ...spec, fields: spec.fields.map((x, j) => (j === i ? nf : x)) })}
              onRemove={() => setSpec({ ...spec, fields: spec.fields.filter((_, j) => j !== i) })}
            />
          ))}
        </Table.Tbody>
      </Table>
      <Group justify="space-between">
        <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={() => setSpec({ ...spec, fields: [...spec.fields, blankField()] })}>Add field</Button>
        <Group gap="xs">
          {!isNew && <Button variant="subtle" color="red" onClick={async () => { await host.deleteSpec(spec.name); onDeleted(); }}>Delete entity</Button>}
          <Button onClick={save} loading={busy}>{isNew ? "Create entity" : "Save"}</Button>
        </Group>
      </Group>
      {error && <Text c="red" size="sm">{error}</Text>}
      <Text c="dimmed" size="xs">Saving validates the spec, migrates storage (additive only; a required field without a default is refused while rows exist), then writes <code>{spec.name || "<name>"}.json</code>.</Text>
    </Stack>
  );
}

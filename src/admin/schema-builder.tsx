// Strapi's content-type builder over EntitySpec, rendered on the TexoFieldList primitive.
// Row order IS spec order (drives table columns and form order). Saving PUTs the spec:
// validate → migrate → write. A refused migration comes back as 409 and is shown, nothing changes.
import { IconDeviceFloppy, IconTrash } from '@tabler/icons-react';
import {
  BaseButton,
  BaseCheckbox,
  BaseGroup,
  BaseNumberInput,
  BaseSelect,
  BaseStack,
  BaseText,
  BaseTextInput,
  TexoFieldList,
  texoFieldKindLabel,
  type TexoFieldKindIcon,
  type TexoFieldListItem,
} from '@texo/ui';
import { useState } from 'react';

import type { EntitySpec, FieldSpec } from '../../experiments/contracts-spike/contracts/entity';
import { host } from './client';

const KINDS: FieldSpec['kind'][] = ['string', 'number', 'boolean', 'enum', 'date'];
const KIND_ICON: Record<FieldSpec['kind'], TexoFieldKindIcon> = {
  string: 'text',
  number: 'number',
  boolean: 'boolean',
  enum: 'enum',
  date: 'date',
  relation: 'relation',
  group: 'group',
};

function blankField(kind: FieldSpec['kind'] = 'string'): FieldSpec {
  switch (kind) {
    case 'enum':
      return { name: '', kind, options: ['a', 'b'] };
    case 'relation':
      return { name: '', kind, to: '' };
    case 'group':
      return { name: '', kind, fields: [{ name: 'value', kind: 'string' }] };
    default:
      return { name: '', kind };
  }
}

function retype(f: FieldSpec, kind: FieldSpec['kind']): FieldSpec {
  return { ...blankField(kind), name: f.name, optional: f.optional };
}

function describe(f: FieldSpec): string {
  switch (f.kind) {
    case 'string':
      return f.long ? 'Text (long)' : 'Text';
    case 'number':
      return f.integer ? 'Number (integer)' : 'Number';
    case 'boolean':
      return 'Boolean';
    case 'enum':
      return `Enumeration (${f.options.join(', ')})`;
    case 'date':
      return 'Date';
    case 'relation':
      return `Relation (${f.to})${f.many ? ' many' : ''}`;
    case 'group':
      return `Component (${f.fields.length} fields)`;
  }
}

function badgesOf(f: FieldSpec, saved: Set<string>): string[] {
  const out: string[] = [];
  if (!saved.has(f.name)) out.push('NEW');
  const dflt = 'default' in f ? f.default : undefined;
  if (!f.optional && dflt === undefined) out.push('REQUIRED');
  if (dflt !== undefined) out.push(`DEFAULT ${String(dflt)}`);
  if (f.kind === 'group' && f.repeatable) out.push('REPEATABLE');
  return out;
}

/** Row ids are positional: field names are editable and may be empty while drafting. */
const rowId = (index: number) => `field-${index}`;
const rowIndex = (id: string) => Number(id.slice('field-'.length));

function FieldEditor({ field, onChange }: { field: FieldSpec; onChange: (f: FieldSpec) => void }) {
  const set = (patch: Record<string, unknown>) => onChange({ ...field, ...patch } as FieldSpec);
  return (
    <BaseStack gap="xs">
      <BaseGroup align="flex-end" gap="sm">
        <BaseTextInput
          label="Name"
          onChange={(e) => set({ name: e.currentTarget.value })}
          placeholder="field_name"
          size="xs"
          value={field.name}
          w={180}
        />
        <BaseSelect
          data={KINDS.map((k) => ({ value: k, label: texoFieldKindLabel(KIND_ICON[k]) }))}
          label="Kind"
          onChange={(k) => k && onChange(retype(field, k as FieldSpec['kind']))}
          size="xs"
          value={field.kind}
          w={150}
        />
        <BaseCheckbox
          checked={field.optional ?? false}
          label="Optional"
          onChange={(e) => set({ optional: e.currentTarget.checked || undefined })}
          pb={6}
          size="xs"
        />
      </BaseGroup>
      <BaseGroup align="flex-end" gap="sm">
        {field.kind === 'string' && (
          <>
            <BaseTextInput label="Default" onChange={(e) => set({ default: e.currentTarget.value || undefined })} size="xs" value={field.default ?? ''} w={180} />
            <BaseNumberInput label="Min length" onChange={(v) => set({ min: v === '' ? undefined : Number(v) })} size="xs" value={field.min ?? ''} w={110} />
            <BaseNumberInput label="Max length" onChange={(v) => set({ max: v === '' ? undefined : Number(v) })} size="xs" value={field.max ?? ''} w={110} />
            <BaseCheckbox checked={field.long ?? false} label="Long text" onChange={(e) => set({ long: e.currentTarget.checked || undefined })} pb={6} size="xs" />
          </>
        )}
        {field.kind === 'number' && (
          <>
            <BaseNumberInput label="Default" onChange={(v) => set({ default: v === '' ? undefined : Number(v) })} size="xs" value={field.default ?? ''} w={110} />
            <BaseNumberInput label="Min" onChange={(v) => set({ min: v === '' ? undefined : Number(v) })} size="xs" value={field.min ?? ''} w={110} />
            <BaseNumberInput label="Max" onChange={(v) => set({ max: v === '' ? undefined : Number(v) })} size="xs" value={field.max ?? ''} w={110} />
            <BaseCheckbox checked={field.integer ?? false} label="Integer" onChange={(e) => set({ integer: e.currentTarget.checked || undefined })} pb={6} size="xs" />
          </>
        )}
        {field.kind === 'boolean' && (
          <BaseCheckbox checked={field.default ?? false} label="Default true" onChange={(e) => set({ default: e.currentTarget.checked })} size="xs" />
        )}
        {field.kind === 'enum' && (
          <>
            <BaseTextInput
              label="Options"
              onChange={(e) => set({ options: e.currentTarget.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder="a, b, c"
              size="xs"
              value={field.options.join(', ')}
              w={260}
            />
            <BaseSelect clearable data={field.options} label="Default" onChange={(v) => set({ default: v ?? undefined })} size="xs" value={field.default ?? null} w={150} />
          </>
        )}
      </BaseGroup>
    </BaseStack>
  );
}

export function SchemaBuilder({
  spec: initial,
  isNew,
  onSaved,
  onDeleted,
}: {
  spec: EntitySpec;
  isNew: boolean;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [spec, setSpec] = useState<EntitySpec>(initial);
  const [saved, setSaved] = useState(() => new Set(initial.fields.map((f) => f.name)));
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const setField = (index: number, f: FieldSpec) =>
    setSpec({ ...spec, fields: spec.fields.map((x, j) => (j === index ? f : x)) });

  const items: TexoFieldListItem[] = spec.fields.map((f, i) => ({
    id: rowId(i),
    label: f.name || '(unnamed)',
    description: describe(f),
    kind: KIND_ICON[f.kind],
    badges: badgesOf(f, saved),
  }));

  async function save() {
    setBusy(true);
    setError(undefined);
    try {
      await host.putSpec(spec);
      setSaved(new Set(spec.fields.map((f) => f.name)));
      setEditing(null);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <BaseStack gap="md">
      <BaseGroup align="flex-end" justify="space-between">
        <BaseGroup align="flex-end" gap="sm">
          <BaseTextInput
            disabled={!isNew}
            label="Entity name"
            onChange={(e) => setSpec({ ...spec, name: e.currentTarget.value })}
            value={spec.name}
          />
          <BaseSelect
            data={spec.fields.map((f) => f.name).filter(Boolean)}
            label="Title field"
            onChange={(v) => setSpec({ ...spec, title: v ?? '' })}
            value={spec.title || null}
          />
        </BaseGroup>
        <BaseGroup gap="xs">
          {!isNew && (
            <BaseButton
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={async () => {
                await host.deleteSpec(spec.name);
                onDeleted();
              }}
              variant="subtle"
            >
              Delete entity
            </BaseButton>
          )}
          <BaseButton leftSection={<IconDeviceFloppy size={14} />} loading={busy} onClick={save}>
            {isNew ? 'Create entity' : 'Save'}
          </BaseButton>
        </BaseGroup>
      </BaseGroup>

      <TexoFieldList
        editing={editing}
        items={items}
        onAdd={() => {
          setSpec({ ...spec, fields: [...spec.fields, blankField()] });
          setEditing(rowId(spec.fields.length));
        }}
        onEdit={(id) => setEditing(editing === id ? null : id)}
        onRemove={(id) => {
          setSpec({ ...spec, fields: spec.fields.filter((_, j) => j !== rowIndex(id)) });
          setEditing(null);
        }}
        onReorder={(_parent, ids) => {
          setSpec({ ...spec, fields: ids.map((id) => spec.fields[rowIndex(id)]) });
          setEditing(null);
        }}
        renderEditor={(item) => {
          const index = rowIndex(item.id);
          return <FieldEditor field={spec.fields[index]} onChange={(f) => setField(index, f)} />;
        }}
      />

      {error && (
        <BaseText c="red" size="sm">
          {error}
        </BaseText>
      )}
      <BaseText c="dimmed" size="xs">
        Row order is field order (table columns, form). Saving validates the spec, migrates storage
        (additive only; a required field without a default is refused while rows exist), then writes{' '}
        <code>{spec.name || '<name>'}.json</code>.
      </BaseText>
    </BaseStack>
  );
}

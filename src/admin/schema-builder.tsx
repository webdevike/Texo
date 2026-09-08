// Strapi's content-type builder over EntitySpec, rendered on the TexoFieldList primitive.
// Row order IS spec order (drives table columns and form order). Saving PUTs the spec:
// validate, migrate, write. A refused migration comes back as 409 and is shown, nothing changes.
// Group fields render their `fields` as nested rows; every row is addressed by its index path.
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

const KINDS: FieldSpec['kind'][] = ['string', 'number', 'boolean', 'enum', 'date', 'relation', 'group'];
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
      return `Relation to ${f.to || '?'}${f.many ? ' (many)' : ''}`;
    case 'group':
      return `Component (${f.fields.length} ${f.fields.length === 1 ? 'field' : 'fields'})`;
  }
}

function badgesOf(f: FieldSpec, isNew: boolean): string[] {
  const out: string[] = [];
  if (isNew) out.push('NEW');
  const dflt = 'default' in f ? f.default : undefined;
  if (!f.optional && dflt === undefined) out.push('REQUIRED');
  if (dflt !== undefined) out.push(`DEFAULT ${String(dflt)}`);
  if (f.kind === 'group' && f.repeatable) out.push('REPEATABLE');
  if (f.kind === 'relation' && f.many) out.push('MANY');
  return out;
}

/** Row ids are index paths (`field-0/2` = third child of the first field): names are editable and may be empty. */
const rowId = (path: number[]) => `field-${path.join('/')}`;
const pathOf = (id: string) => id.slice('field-'.length).split('/').map(Number);

/** Fields list at `path` (the root when empty; a group's children otherwise). */
function listAt(fields: FieldSpec[], path: number[]): FieldSpec[] {
  let list = fields;
  for (const i of path) {
    const f = list[i];
    list = f.kind === 'group' ? f.fields : [];
  }
  return list;
}

/** Returns a copy of `fields` with the list at `path` replaced by `update(list)`. */
function updateListAt(fields: FieldSpec[], path: number[], update: (list: FieldSpec[]) => FieldSpec[]): FieldSpec[] {
  if (path.length === 0) return update(fields);
  const [head, ...rest] = path;
  return fields.map((f, i) => (i === head && f.kind === 'group' ? { ...f, fields: updateListAt(f.fields, rest, update) } : f));
}

function FieldEditor({ field, onChange, entityNames }: { field: FieldSpec; onChange: (f: FieldSpec) => void; entityNames: string[] }) {
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
        {field.kind === 'date' && (
          <BaseTextInput label="Default" onChange={(e) => set({ default: e.currentTarget.value || undefined })} size="xs" type="date" value={field.default ?? ''} w={180} />
        )}
        {field.kind === 'relation' && (
          <>
            <BaseSelect
              data={entityNames}
              label="Target entity"
              onChange={(v) => set({ to: v ?? '' })}
              placeholder="Pick an entity"
              searchable
              size="xs"
              value={field.to || null}
              w={200}
            />
            <BaseCheckbox checked={field.many ?? false} label="Many" onChange={(e) => set({ many: e.currentTarget.checked || undefined })} pb={6} size="xs" />
          </>
        )}
        {field.kind === 'group' && (
          <>
            <BaseCheckbox checked={field.repeatable ?? false} label="Repeatable" onChange={(e) => set({ repeatable: e.currentTarget.checked || undefined })} size="xs" />
            <BaseText c="dimmed" size="xs">
              Fields of this component are the nested rows below.
            </BaseText>
          </>
        )}
      </BaseGroup>
    </BaseStack>
  );
}

export function SchemaBuilder({
  spec: initial,
  isNew,
  entityNames,
  onSaved,
  onDeleted,
}: {
  spec: EntitySpec;
  isNew: boolean;
  /** Relation targets offered by the relation editor (manifest entity names). */
  entityNames: string[];
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [spec, setSpec] = useState<EntitySpec>(initial);
  const [saved, setSaved] = useState(() => new Set(initial.fields.map((f) => f.name)));
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const setFields = (fields: FieldSpec[]) => setSpec({ ...spec, fields });

  const itemsOf = (fields: FieldSpec[], parent: number[]): TexoFieldListItem[] =>
    fields.map((f, i) => {
      const path = [...parent, i];
      return {
        id: rowId(path),
        label: f.name || '(unnamed)',
        description: describe(f),
        kind: KIND_ICON[f.kind],
        badges: badgesOf(f, parent.length === 0 && !saved.has(f.name)),
        children: f.kind === 'group' ? itemsOf(f.fields, path) : undefined,
      };
    });

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
            data={spec.fields.filter((f) => f.name && f.kind !== 'group' && f.kind !== 'relation').map((f) => f.name)}
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
        items={itemsOf(spec.fields, [])}
        onAdd={(parentId) => {
          const parent = parentId ? pathOf(parentId) : [];
          const index = listAt(spec.fields, parent).length;
          setFields(updateListAt(spec.fields, parent, (list) => [...list, blankField()]));
          setEditing(rowId([...parent, index]));
        }}
        onEdit={(id) => setEditing(editing === id ? null : id)}
        onRemove={(id) => {
          const path = pathOf(id);
          const index = path[path.length - 1];
          setFields(updateListAt(spec.fields, path.slice(0, -1), (list) => list.filter((_, j) => j !== index)));
          setEditing(null);
        }}
        onReorder={(parentId, ids) => {
          const parent = parentId ? pathOf(parentId) : [];
          setFields(updateListAt(spec.fields, parent, (list) => ids.map((id) => list[pathOf(id)[parent.length]])));
          setEditing(null);
        }}
        renderEditor={(item) => {
          const path = pathOf(item.id);
          const index = path[path.length - 1];
          const field = listAt(spec.fields, path.slice(0, -1))[index];
          return (
            <FieldEditor
              entityNames={entityNames}
              field={field}
              onChange={(f) => setFields(updateListAt(spec.fields, path.slice(0, -1), (list) => list.map((x, j) => (j === index ? f : x))))}
            />
          );
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

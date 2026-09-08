// One control per FieldSpec kind, recursive for groups. Knows the store and the entity registry
// so relation pickers can search their target; nothing here is per-entity.
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  BaseActionIcon,
  BaseButton,
  BaseFieldset,
  BaseGroup,
  BaseNumberInput,
  BaseSelect,
  BaseStack,
  BaseSwitch,
  BaseText,
  BaseTextInput,
  BaseTextarea,
} from '@texo/ui';

import type { Entity, FieldSpec } from '../../../experiments/contracts-spike/contracts/entity';
import type { ClientStore } from '../../../experiments/contracts-spike/contracts/store';
import { RelationField, RelationManyField } from './relation';

export interface FieldContext {
  store: ClientStore;
  resolveEntity: (name: string) => Entity | undefined;
}

/** Default value for a field, used for new rows and new repeater items. */
export function initialValue(f: FieldSpec): unknown {
  if ('default' in f && f.default !== undefined) return f.default;
  if (f.kind === 'boolean') return false;
  if (f.kind === 'group' && !f.repeatable && !f.optional) return initialGroup(f.fields);
  return undefined;
}

export function initialGroup(fields: FieldSpec[]): Record<string, unknown> {
  return Object.fromEntries(fields.map((c) => [c.name, initialValue(c)]));
}

/** Drop empty strings and undefined so optional fields are omitted, recursively through groups. */
export function compact(fields: FieldSpec[], values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.name];
    if (v === undefined || v === '') continue;
    if (f.kind === 'group') {
      if (f.repeatable) {
        const items = Array.isArray(v) ? v : [];
        if (items.length === 0 && f.optional) continue;
        out[f.name] = items.map((item) => compact(f.fields, (item ?? {}) as Record<string, unknown>));
      } else {
        out[f.name] = compact(f.fields, v as Record<string, unknown>);
      }
      continue;
    }
    if (f.kind === 'relation' && f.many && Array.isArray(v) && v.length === 0 && f.optional) continue;
    out[f.name] = v;
  }
  return out;
}

function asRecord(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function FieldControl({ field, value, onChange, ctx }: {
  field: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
  ctx: FieldContext;
}) {
  const label = field.name;
  const dflt = 'default' in field ? field.default : undefined;
  const required = !field.optional && dflt === undefined;
  switch (field.kind) {
    case 'string':
      return field.long ? (
        <BaseTextarea autosize label={label} minRows={3} onChange={(e) => onChange(e.currentTarget.value)} required={required} value={typeof value === 'string' ? value : ''} />
      ) : (
        <BaseTextInput label={label} onChange={(e) => onChange(e.currentTarget.value)} required={required} value={typeof value === 'string' ? value : ''} />
      );
    case 'number':
      // Mantine emits a string mid-typing; the contract wants a number.
      return (
        <BaseNumberInput
          allowDecimal={!field.integer}
          label={label}
          max={field.max}
          min={field.min}
          onChange={(v) => onChange(v === '' ? undefined : typeof v === 'string' ? Number(v) : v)}
          required={required}
          value={typeof value === 'number' ? value : ''}
        />
      );
    case 'boolean':
      return <BaseSwitch checked={value === true} label={label} onChange={(e) => onChange(e.currentTarget.checked)} />;
    case 'enum':
      return <BaseSelect data={field.options} label={label} onChange={(v) => onChange(v ?? undefined)} required={required} value={typeof value === 'string' ? value : null} />;
    case 'date':
      // Native date input yields ISO YYYY-MM-DD, which the contract's ISO_DATE accepts.
      return (
        <BaseTextInput
          label={label}
          onChange={(e) => onChange(e.currentTarget.value || undefined)}
          required={required}
          type="date"
          value={typeof value === 'string' ? value.slice(0, 10) : ''}
        />
      );
    case 'relation': {
      const target = ctx.resolveEntity(field.to);
      return field.many ? (
        <RelationManyField label={label} onChange={onChange} required={required} store={ctx.store} target={target} value={Array.isArray(value) ? (value as string[]) : undefined} />
      ) : (
        <RelationField label={label} onChange={onChange} required={required} store={ctx.store} target={target} value={typeof value === 'string' ? value : undefined} />
      );
    }
    case 'group':
      return field.repeatable ? (
        <RepeaterField ctx={ctx} field={field} onChange={onChange} value={Array.isArray(value) ? value : []} />
      ) : (
        <BaseFieldset legend={label} variant="filled">
          <GroupFields ctx={ctx} fields={field.fields} onChange={onChange} value={asRecord(value)} />
        </BaseFieldset>
      );
  }
}

function GroupFields({ fields, value, onChange, ctx }: {
  fields: FieldSpec[];
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  ctx: FieldContext;
}) {
  return (
    <BaseStack gap="sm">
      {fields.map((f) => (
        <FieldControl ctx={ctx} field={f} key={f.name} onChange={(v) => onChange({ ...value, [f.name]: v })} value={value[f.name]} />
      ))}
    </BaseStack>
  );
}

function RepeaterField({ field, value, onChange, ctx }: {
  field: Extract<FieldSpec, { kind: 'group' }>;
  value: unknown[];
  onChange: (v: unknown[]) => void;
  ctx: FieldContext;
}) {
  const move = (from: number, to: number) => {
    const next = value.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  return (
    <BaseFieldset legend={`${field.name} (${value.length})`} variant="filled">
      <BaseStack gap="sm">
        {value.length === 0 && (
          <BaseText c="dimmed" size="sm">
            No items
          </BaseText>
        )}
        {value.map((item, i) => (
          <BaseGroup align="flex-start" gap="xs" key={i} wrap="nowrap">
            <BaseStack flex={1} gap="sm">
              <GroupFields ctx={ctx} fields={field.fields} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} value={asRecord(item)} />
            </BaseStack>
            <BaseGroup gap={2} pt={24} wrap="nowrap">
              <BaseActionIcon aria-label={`Move ${field.name} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, i - 1)} size="sm" variant="subtle">
                <IconArrowUp size={14} />
              </BaseActionIcon>
              <BaseActionIcon aria-label={`Move ${field.name} ${i + 1} down`} disabled={i === value.length - 1} onClick={() => move(i, i + 1)} size="sm" variant="subtle">
                <IconArrowDown size={14} />
              </BaseActionIcon>
              <BaseActionIcon aria-label={`Remove ${field.name} ${i + 1}`} color="red" onClick={() => onChange(value.filter((_, j) => j !== i))} size="sm" variant="subtle">
                <IconTrash size={14} />
              </BaseActionIcon>
            </BaseGroup>
          </BaseGroup>
        ))}
        <BaseButton leftSection={<IconPlus size={14} />} onClick={() => onChange([...value, initialGroup(field.fields)])} size="xs" style={{ alignSelf: 'flex-start' }} variant="subtle">
          Add {field.name} item
        </BaseButton>
      </BaseStack>
    </BaseFieldset>
  );
}

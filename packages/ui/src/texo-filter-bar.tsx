import { IconFilter, IconSearch, IconX } from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';

import {
  BaseButton,
  BaseCloseButton,
  BaseGroup,
  BaseMultiSelect,
  BaseNumberInput,
  BasePill,
  BasePopover,
  BaseSelect,
  BaseStack,
  BaseSwitch,
  BaseText,
  BaseTextInput,
} from './components';

/**
 * Search input + filter chips. The bar is kind-aware but contract-free: describe the fields
 * with `TexoFilterField` and it emits `TexoFilter[]`; `filtersToWhere` turns those into the
 * store contract's `Where` shape ({ field: value } for eq, { field: { op, value } } otherwise).
 */
export type TexoFilterKind = 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'relation';

export interface TexoFilterField {
  name: string;
  kind: TexoFilterKind;
  label?: ReactNode;
  /** Enum choices. */
  options?: string[];
}

export type TexoFilterOp = 'eq' | 'ne' | 'in' | 'nin' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'isNull';

export interface TexoFilter {
  field: string;
  op: TexoFilterOp;
  value?: unknown;
}

export type TexoWhere = Record<string, unknown | { op: TexoFilterOp; value?: unknown }>;

const OPS_BY_KIND: Record<TexoFilterKind, TexoFilterOp[]> = {
  string: ['contains', 'eq', 'isNull'],
  number: ['eq', 'lt', 'lte', 'gt', 'gte', 'isNull'],
  date: ['eq', 'lt', 'lte', 'gt', 'gte', 'isNull'],
  boolean: ['eq'],
  enum: ['in', 'nin'],
  relation: ['eq', 'isNull'],
};

// Dropdowns inside the filter popover stay in its DOM subtree; a portal would make every option
// click count as a click outside the popover and close it.
const INNER_COMBOBOX = { withinPortal: false } as const;

const OP_LABEL: Record<TexoFilterOp, string> = {
  eq: 'is',
  ne: 'is not',
  in: 'is any of',
  nin: 'is none of',
  lt: '<',
  lte: '<=',
  gt: '>',
  gte: '>=',
  contains: 'contains',
  isNull: 'is empty',
};

/** Fold chips into the store's Where: one entry per field (a later chip on the same field wins). */
export function filtersToWhere(filters: readonly TexoFilter[]): TexoWhere {
  const where: TexoWhere = {};
  for (const f of filters) where[f.field] = f.op === 'eq' ? f.value : { op: f.op, value: f.value };
  return where;
}

function describe(filter: TexoFilter, field: TexoFilterField | undefined) {
  const label = field?.label ?? filter.field;
  if (filter.op === 'isNull') return <><b>{label}</b> is empty</>;
  const value = Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value);
  return <><b>{label}</b> {OP_LABEL[filter.op]} {value}</>;
}

function FilterEditor({ fields, onAdd }: { fields: readonly TexoFilterField[]; onAdd: (filter: TexoFilter) => void }) {
  const [fieldName, setFieldName] = useState<string | null>(fields[0]?.name ?? null);
  const field = fields.find((f) => f.name === fieldName);
  const ops = field ? OPS_BY_KIND[field.kind] : [];
  const [op, setOp] = useState<TexoFilterOp>(ops[0] ?? 'eq');
  const [value, setValue] = useState<unknown>(field?.kind === 'boolean' ? true : field?.kind === 'enum' ? [] : '');
  const effectiveOp = ops.includes(op) ? op : ops[0];

  const pickField = (name: string | null) => {
    const next = fields.find((f) => f.name === name);
    setFieldName(name);
    if (!next) return;
    setOp(OPS_BY_KIND[next.kind][0]);
    setValue(next.kind === 'boolean' ? true : next.kind === 'enum' ? [] : '');
  };

  const ready =
    !!field &&
    (effectiveOp === 'isNull' ||
      (field.kind === 'boolean') ||
      (field.kind === 'enum' ? Array.isArray(value) && value.length > 0 : value !== '' && value !== undefined && value !== null));

  const submit = () => {
    if (!field || !ready) return;
    const v =
      effectiveOp === 'isNull' ? undefined : field.kind === 'number' ? Number(value) : value;
    onAdd({ field: field.name, op: effectiveOp, value: v });
  };

  return (
    <BaseStack gap="xs" miw={260}>
      <BaseSelect
        allowDeselect={false}
        comboboxProps={INNER_COMBOBOX}
        data={fields.map((f) => ({ value: f.name, label: typeof f.label === 'string' ? f.label : f.name }))}
        label="Field"
        onChange={pickField}
        size="xs"
        value={fieldName}
      />
      {field && (
        <BaseSelect
          allowDeselect={false}
          comboboxProps={INNER_COMBOBOX}
          data={ops.map((o) => ({ value: o, label: OP_LABEL[o] }))}
          label="Condition"
          onChange={(v) => v && setOp(v as TexoFilterOp)}
          size="xs"
          value={effectiveOp}
        />
      )}
      {field && effectiveOp !== 'isNull' && field.kind === 'enum' && (
        <BaseMultiSelect
          comboboxProps={INNER_COMBOBOX}
          data={field.options ?? []}
          label="Values"
          onChange={setValue}
          size="xs"
          value={Array.isArray(value) ? (value as string[]) : []}
        />
      )}
      {field && effectiveOp !== 'isNull' && field.kind === 'boolean' && (
        <BaseSwitch checked={value === true} label={value === true ? 'true' : 'false'} onChange={(e) => setValue(e.currentTarget.checked)} size="xs" />
      )}
      {field && effectiveOp !== 'isNull' && field.kind === 'number' && (
        <BaseNumberInput label="Value" onChange={setValue} size="xs" value={typeof value === 'number' ? value : (value as string)} />
      )}
      {field && effectiveOp !== 'isNull' && (field.kind === 'string' || field.kind === 'date' || field.kind === 'relation') && (
        <BaseTextInput
          label={field.kind === 'relation' ? 'Id' : field.kind === 'date' ? 'Date (ISO)' : 'Value'}
          onChange={(e) => setValue(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={field.kind === 'date' ? '2026-01-31' : undefined}
          size="xs"
          value={String(value ?? '')}
        />
      )}
      <BaseButton disabled={!ready} onClick={submit} size="xs">
        Add filter
      </BaseButton>
    </BaseStack>
  );
}

export interface TexoFilterBarProps {
  fields: readonly TexoFilterField[];
  filters: readonly TexoFilter[];
  onFiltersChange: (filters: TexoFilter[]) => void;
  search: string;
  onSearchChange: (search: string) => void;
  /** Matching row count, shown as "1,234 issues". */
  total?: number;
  /** Noun for the total, singular ("issue"). */
  noun?: string;
  searchPlaceholder?: string;
  /** Right-aligned actions (e.g. a New button). */
  actions?: ReactNode;
}

export function TexoFilterBar({
  fields,
  filters,
  onFiltersChange,
  search,
  onSearchChange,
  total,
  noun = 'row',
  searchPlaceholder = 'Search',
  actions,
}: TexoFilterBarProps) {
  const [opened, setOpened] = useState(false);
  const plural = total === 1 ? noun : `${noun}s`;
  return (
    <BaseStack gap="xs">
      <BaseGroup gap="xs" wrap="nowrap">
        <BaseTextInput
          aria-label="Search"
          leftSection={<IconSearch size={14} />}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          placeholder={searchPlaceholder}
          rightSection={search ? <BaseCloseButton aria-label="Clear search" onClick={() => onSearchChange('')} size="xs" /> : undefined}
          size="xs"
          style={{ flex: 1, maxWidth: 360 }}
          value={search}
        />
        <BasePopover onChange={setOpened} opened={opened} position="bottom-start" shadow="sm" withinPortal>
          <BasePopover.Target>
            <BaseButton leftSection={<IconFilter size={14} />} onClick={() => setOpened((o) => !o)} size="xs" variant="default">
              Filter
            </BaseButton>
          </BasePopover.Target>
          <BasePopover.Dropdown>
            <FilterEditor
              fields={fields}
              key={opened ? 'open' : 'closed'}
              onAdd={(filter) => {
                onFiltersChange([...filters, filter]);
                setOpened(false);
              }}
            />
          </BasePopover.Dropdown>
        </BasePopover>
        {total !== undefined && (
          <BaseText c="dimmed" data-testid="filter-total" size="xs" style={{ whiteSpace: 'nowrap' }}>
            {total.toLocaleString()} {plural}
          </BaseText>
        )}
        {actions && <BaseGroup gap="xs" ml="auto" wrap="nowrap">{actions}</BaseGroup>}
      </BaseGroup>
      {filters.length > 0 && (
        <BaseGroup gap={6}>
          {filters.map((filter, i) => (
            <BasePill
              key={`${filter.field}-${filter.op}-${i}`}
              onRemove={() => onFiltersChange(filters.filter((_, j) => j !== i))}
              size="sm"
              withRemoveButton
            >
              {describe(filter, fields.find((f) => f.name === filter.field))}
            </BasePill>
          ))}
          <BaseButton leftSection={<IconX size={12} />} onClick={() => onFiltersChange([])} size="compact-xs" variant="subtle">
            Clear
          </BaseButton>
        </BaseGroup>
      )}
    </BaseStack>
  );
}


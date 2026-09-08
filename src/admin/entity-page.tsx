// One page per entity: filter bar + virtualized table + create/edit modal. Talks to the
// ClientStore contract only, through useList.
import {
  BaseBadge,
  BaseButton,
  BaseGroup,
  BaseKbd,
  BaseLoader,
  BaseModal,
  BaseStack,
  BaseText,
  BaseTitle,

  type TexoDataTableColumn,
  TexoDataTable,
  type TexoFilter,
  TexoFilterBar,
  type TexoFilterField,
  filtersToWhere,
} from '@texo/ui';
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Entity, FieldSpec, Row } from '../../experiments/contracts-spike/contracts/entity';
import type { ClientStore } from '../../experiments/contracts-spike/contracts/store';
import { EntityForm } from './entity-form';
import { useList } from './hooks/use-list';

/** Default cell renderer, kind-aware. Slice A's field renderers can replace this at merge time. */
export function Cell({ field, value }: { field: FieldSpec; value: unknown }) {
  if (value === undefined || value === null) return <BaseText c="dimmed" size="sm">-</BaseText>;
  if (field.kind === 'boolean') return <BaseBadge color={value ? 'green' : 'gray'} size="sm" variant="light">{value ? 'yes' : 'no'}</BaseBadge>;
  if (field.kind === 'enum') return <BaseBadge size="sm" variant="outline">{String(value)}</BaseBadge>;
  if (field.kind === 'relation') {
    let text = String(value);
    if (Array.isArray(value)) text = `${value.length} linked`;
    else if (typeof value === 'object' && 'title' in value) text = String(value.title ?? '');
    return <BaseText size="sm" truncate>{text}</BaseText>;
  }
  if (field.kind === 'group') return <BaseText c="dimmed" size="sm">{Array.isArray(value) ? `${value.length} items` : '1 item'}</BaseText>;
  return <BaseText size="sm" truncate>{String(value)}</BaseText>;
}

const WIDTH_BY_KIND: Record<FieldSpec['kind'], string> = {
  string: 'minmax(200px, 2fr)',
  number: '96px',
  boolean: '88px',
  enum: '140px',
  date: '160px',
  relation: 'minmax(160px, 1fr)',
  group: '120px',
};

export function EntityPage({ entity, store, resolveEntity }: {
  entity: Entity;
  store: ClientStore;
  resolveEntity?: (name: string) => Entity | undefined;
}) {
  const include = useMemo(() => entity.fields.filter((f) => f.kind === 'relation' && !f.many).map((f) => f.name), [entity]);
  const list = useList(store, entity, { include: include.length ? include : undefined });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TexoFilter[]>([]);
  // `?new=1` (command palette "New <entity>") opens the create modal on arrival.
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Row | 'new' | undefined>(() => (params.has('new') ? 'new' : undefined));

  const fieldByName = useMemo(() => Object.fromEntries(entity.fields.map((f) => [f.name, f])) as Record<string, FieldSpec>, [entity]);
  const columns = useMemo<TexoDataTableColumn[]>(
    () => entity.fields.map((f) => ({ key: f.name, label: f.name, width: WIDTH_BY_KIND[f.kind], align: f.kind === 'number' ? 'right' : 'left' })),
    [entity],
  );
  const filterFields = useMemo<TexoFilterField[]>(
    () =>
      entity.fields
        .filter((f) => f.kind !== 'group' && !(f.kind === 'relation' && f.many))
        .map((f) => ({ name: f.name, kind: f.kind as TexoFilterField['kind'], options: f.kind === 'enum' ? f.options : undefined })),
    [entity],
  );
  const renderCell = useCallback(
    (column: TexoDataTableColumn, value: unknown) => <Cell field={fieldByName[column.key]} value={value} />,
    [fieldByName],
  );
  const sort = useMemo(() => {
    const o = list.query.orderBy;
    return o === undefined ? [] : Array.isArray(o) ? o : [o];
  }, [list.query.orderBy]);

  const close = () => {
    setEditing(undefined);
    if (params.has('new')) setParams((p) => { p.delete('new'); return p; }, { replace: true });
  };
  // Slice E extends EntityForm with `store` + `resolveEntity`; passed through untyped until merge.
  const formProps: Record<string, unknown> = { store, resolveEntity };

  return (
    <BaseStack gap="sm" style={{ height: 'calc(100dvh - 136px)', minHeight: 360 }}>
      <BaseGroup justify="space-between">
        <BaseTitle order={3}>{entity.name}</BaseTitle>
        <BaseGroup gap="xs">
          {list.loading && <BaseLoader size="xs" />}
          <BaseButton onClick={() => setEditing('new')} size="xs">New {entity.name}</BaseButton>
        </BaseGroup>
      </BaseGroup>
      <TexoFilterBar
        fields={filterFields}
        filters={filters}
        noun={entity.name}
        onFiltersChange={(next) => {
          setFilters(next);
          list.setWhere(filtersToWhere(next));
        }}
        onSearchChange={(value) => {
          setSearch(value);
          list.setSearch(value);
        }}
        search={search}
        searchPlaceholder={`Search ${entity.name}s`}
        total={list.total}
      />
      {list.error && <BaseText c="red" size="sm">{list.error}</BaseText>}
      <TexoDataTable
        columns={columns}
        emptyLabel={`No ${entity.name}s match`}
        loading={list.loading}
        onEndReached={list.loadMore}
        onOpen={setEditing}
        onSortChange={list.setOrderBy}
        renderCell={renderCell}
        rows={list.rows}
        sort={sort}
      />
      <BaseGroup gap="xs" justify="space-between">
        <BaseText c="dimmed" size="xs">
          {list.rows.length.toLocaleString()} of {list.total.toLocaleString()} loaded
        </BaseText>
        <BaseGroup gap={4}>
          <BaseKbd size="xs">Shift</BaseKbd>
          <BaseText c="dimmed" size="xs">+ click header for secondary sort</BaseText>
        </BaseGroup>
      </BaseGroup>
      <BaseModal onClose={close} opened={editing !== undefined} title={editing === 'new' ? `New ${entity.name}` : String(editing?.[entity.title])}>
        {editing !== undefined && (
          <BaseStack gap="sm">
            <EntityForm
              key={editing === 'new' ? 'new' : editing.id}
              entity={entity}
              row={editing === 'new' ? undefined : editing}
              onCancel={close}
              onSubmit={async (values) => {
                if (editing === 'new') await store.create(entity, values);
                else await store.update(entity, editing.id, values);
                close();
                list.refetch();
              }}
              {...formProps}
            />
            {editing !== 'new' && (
              <BaseButton color="red" onClick={async () => { await store.remove(entity, editing.id); close(); list.refetch(); }} variant="subtle">
                Delete
              </BaseButton>
            )}
          </BaseStack>
        )}
      </BaseModal>
    </BaseStack>
  );
}

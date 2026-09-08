// Relation pickers: options come from the target entity via `store.list({ search, limit: 20 })`,
// labeled by the target's title field. Selected ids that the current search does not return are
// resolved once (`where: { id: { op: 'in' } }`) so an edit form shows titles, never raw ids.
import { BaseMultiSelect, BaseSelect } from '@texo/ui';
import { useEffect, useMemo, useState } from 'react';

import type { Entity, Row } from '../../../experiments/contracts-spike/contracts/entity';
import type { ClientStore } from '../../../experiments/contracts-spike/contracts/store';

type Option = { value: string; label: string };

const PAGE = 20;

function labelOf(entity: Entity, row: Row): string {
  const t = row[entity.title];
  return t === undefined || t === null || t === '' ? row.id : String(t);
}

/** Search-backed options plus labels for whatever is already selected. */
function useRelationOptions(store: ClientStore, target: Entity | undefined, selected: string[]) {
  const [search, setSearch] = useState('');
  const [found, setFound] = useState<Option[]>([]);
  const [known, setKnown] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!target) return;
    let live = true;
    const timer = setTimeout(async () => {
      const { rows } = await store.list(target, { search: search || undefined, limit: PAGE });
      if (!live) return;
      const options = rows.map((r) => ({ value: r.id, label: labelOf(target, r) }));
      setFound(options);
      setKnown((k) => Object.assign({ ...k }, Object.fromEntries(options.map((o) => [o.value, o.label]))));
    }, search ? 150 : 0);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [store, target, search]);

  const missing = selected.filter((id) => known[id] === undefined).join(',');
  useEffect(() => {
    if (!target || !missing) return;
    const ids = missing.split(',');
    let live = true;
    void store.list(target, { where: { id: { op: 'in', value: ids } }, limit: ids.length }).then(({ rows }) => {
      if (!live) return;
      setKnown((k) => {
        const next = { ...k };
        for (const r of rows) next[r.id] = labelOf(target, r);
        for (const id of ids) next[id] ??= id;
        return next;
      });
    });
    return () => {
      live = false;
    };
  }, [store, target, missing]);

  const data = useMemo(() => {
    const out: Option[] = selected.map((id) => ({ value: id, label: known[id] ?? id }));
    for (const o of found) if (!selected.includes(o.value)) out.push(o);
    return out;
  }, [selected, known, found]);

  return { data, search, setSearch };
}

/** The server already filtered; do not let the combobox filter labels a second time. */
const passthrough = <T,>({ options }: { options: T }) => options;

interface RelationProps {
  label: string;
  target: Entity | undefined;
  store: ClientStore;
  required?: boolean;
}

export function RelationField({ label, target, store, required, value, onChange }: RelationProps & {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const selected = useMemo(() => (value ? [value] : []), [value]);
  const { data, search, setSearch } = useRelationOptions(store, target, selected);
  return (
    <BaseSelect
      clearable={!required}
      data={data}
      disabled={!target}
      filter={passthrough}
      label={label}
      nothingFoundMessage={target ? `No ${target.name} matches` : `Unknown entity`}
      onChange={(v) => onChange(v ?? undefined)}
      onSearchChange={setSearch}
      placeholder={target ? `Search ${target.name}` : undefined}
      required={required}
      searchValue={search}
      searchable
      value={value ?? null}
    />
  );
}

export function RelationManyField({ label, target, store, required, value, onChange }: RelationProps & {
  value: string[] | undefined;
  onChange: (v: string[]) => void;
}) {
  const selected = useMemo(() => value ?? [], [value]);
  const { data, search, setSearch } = useRelationOptions(store, target, selected);
  return (
    <BaseMultiSelect
      clearable
      data={data}
      disabled={!target}
      filter={passthrough}
      hidePickedOptions
      label={label}
      nothingFoundMessage={target ? `No ${target.name} matches` : `Unknown entity`}
      onChange={onChange}
      onSearchChange={setSearch}
      placeholder={target ? `Search ${target.name}` : undefined}
      required={required}
      searchValue={search}
      searchable
      value={selected}
    />
  );
}

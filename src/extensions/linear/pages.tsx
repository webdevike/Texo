// Linear-lite pages: issues list (+ detail side panel), board, projects, project detail.
import { IconPlus } from '@tabler/icons-react';
import {
  BaseBadge,
  BaseButton,
  BaseGroup,
  BaseModal,
  BaseStack,
  BaseText,
  BaseTextInput,
  BaseTitle,
  TexoBoard,
  TexoDataTable,
  TexoFilterBar,
  filtersToWhere,
  useHotkeys,
  type TexoFilter,
  type TexoFilterField,
} from '@texo/ui';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { Entity, Row } from '../../../experiments/contracts-spike/contracts/entity';
import type { Where } from '../../../experiments/contracts-spike/contracts/store';
import { useList } from '../../admin/hooks/use-list';
import { useLive } from '../../admin/hooks/use-live';
import { useOptimistic } from '../../admin/hooks/use-optimistic';
import { RelationField } from '../../admin/fields/relation';
import { IssueDetail } from './issue-detail';
import { liveStore, PRIORITY_LABEL, STATUS_KEY, STATUS_LABEL, STATUSES, useEntities } from './store';

const COLUMNS = [
  { key: 'title', label: 'Title', width: 'minmax(280px, 2fr)' },
  { key: 'status', label: 'Status', width: 130 },
  { key: 'priority', label: 'Priority', width: 110 },
  { key: 'assignee', label: 'Assignee', width: 150 },
  { key: 'project', label: 'Project', width: 160 },
  { key: 'due', label: 'Due', width: 110 },
];

function cell(key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return <BaseText c="dimmed" size="sm">-</BaseText>;
  if (key === 'status') return <BaseBadge size="sm" variant="light">{STATUS_LABEL[String(value)] ?? String(value)}</BaseBadge>;
  if (key === 'priority') return <BaseText size="sm">P{String(value)} {PRIORITY_LABEL[Number(value)] ?? ''}</BaseText>;
  if (typeof value === 'object' && value && 'title' in value) return <BaseText size="sm">{String(value.title ?? '')}</BaseText>;
  return <BaseText size="sm" lineClamp={1}>{String(value)}</BaseText>;
}

/** New issue modal, opened by `c` / `?new=1`. */
function NewIssue({ entity, opened, onClose }: { entity: Entity; opened: boolean; onClose: () => void }) {
  const { create } = useOptimistic(liveStore, entity);
  const { team } = useEntities();
  const [title, setTitle] = useState('');
  const [teamId, setTeamId] = useState<string | undefined>();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    void create({ title: title.trim(), team: teamId, status: 'todo', priority: 0 }).catch(() => undefined);
    setTitle('');
    onClose();
  };
  return (
    <BaseModal onClose={onClose} opened={opened} title="New issue">
      <form onSubmit={submit}>
        <BaseStack gap="sm">
          <BaseTextInput autoFocus data-autofocus label="Title" onChange={(e) => setTitle(e.currentTarget.value)} value={title} />
          <RelationField label="Team" onChange={setTeamId} store={liveStore} target={team} value={teamId} />
          <BaseButton type="submit">Create</BaseButton>
        </BaseStack>
      </form>
    </BaseModal>
  );
}

function useNewIssueRoute() {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const opened = new URLSearchParams(search).get('new') === '1';
  return { opened, close: () => navigate(pathname, { replace: true }) };
}

/** Selection keys on the issue list and board: 1..5 priority, s <letter> status, a assign. */
function useIssueKeys(entity: Entity, selectedId: string | undefined, onAssign: () => void) {
  const { update } = useOptimistic(liveStore, entity);
  const commands = useMemo(
    () => [
      ...[1, 2, 3, 4, 5].map((n) => ({ id: `linear.prio.${n}`, keys: String(n), when: () => !!selectedId, run: () => void update(selectedId!, { priority: n - 1 }).catch(() => undefined) })),
      ...Object.entries(STATUS_KEY).map(([k, status]) => ({ id: `linear.status.${status}`, keys: `s ${k}`, when: () => !!selectedId, run: () => void update(selectedId!, { status }).catch(() => undefined) })),
      { id: 'linear.assign', keys: 'a', when: () => !!selectedId, run: onAssign },
    ],
    [update, selectedId, onAssign],
  );
  useHotkeys(commands);
}

export function IssuesPage({ where: fixedWhere }: { where?: Where } = {}) {
  const { issue, all } = useEntities();
  return issue ? <IssuesList entity={issue} entities={all} fixedWhere={fixedWhere} /> : null;
}

function IssuesList({ entity, entities, fixedWhere }: { entity: Entity; entities: Entity[]; fixedWhere?: Where }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { pathname } = useLocation();
  const initial = useMemo(() => ({ where: fixedWhere, orderBy: [{ field: 'priority', direction: 'desc' as const }], limit: 200, include: ['assignee', 'project'] }), [fixedWhere]);
  const list = useList(liveStore, entity, initial);
  const [filters, setFilters] = useState<TexoFilter[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const newIssue = useNewIssueRoute();
  const { update } = useOptimistic(liveStore, entity);
  const listBase = fixedWhere ? pathname.replace(/\/issues\/.*$/, '') : '';
  const openId = fixedWhere ? undefined : routeId;

  const fields: TexoFilterField[] = useMemo(
    () => entity.fields.filter((f) => ['status', 'priority', 'assignee', 'project', 'labels', 'team'].includes(f.name)).map((f) => ({ name: f.name, kind: f.kind === 'relation' ? 'relation' : f.kind === 'enum' ? 'enum' : 'number', label: f.name, options: f.kind === 'enum' ? f.options : undefined })),
    [entity],
  );

  // The live cache re-applies edits to rows the list already holds (list rows are refetched on change).
  useEffect(() => liveStore.subscribe(entity, () => list.refetch()), [entity, list.refetch]);

  const sort = useMemo(() => {
    const o = list.query.orderBy;
    return Array.isArray(o) ? o : o ? [o] : [];
  }, [list.query.orderBy]);

  const selectedId = selected[0];
  useIssueKeys(entity, selectedId, useCallback(() => setAssigning(true), []));
  useHotkeys(useMemo(() => [
    { id: 'linear.list.down', keys: 'j', run: () => move(1) },
    { id: 'linear.list.up', keys: 'k', run: () => move(-1) },
    { id: 'linear.list.open', keys: 'enter', when: () => !!selectedId && !openId, run: () => navigate(`${listBase}/issues/${selectedId}`) },
    { id: 'linear.search', keys: '/', run: () => (document.querySelector('input[placeholder="Search issues"]') as HTMLInputElement | null)?.focus() },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [selectedId, openId, list.rows]));
  function move(delta: number) {
    const rows = list.rows;
    if (!rows.length) return;
    const at = rows.findIndex((r) => r.id === selectedId);
    const next = Math.max(0, Math.min(rows.length - 1, at + delta));
    setSelected([rows[next].id]);
    document.querySelector(`[role="row"][aria-rowindex="${next + 1}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  const member = entities.find((e) => e.name === 'member');
  return (
    <BaseGroup align="stretch" gap={0} style={{ height: 'calc(100vh - 120px)' }} wrap="nowrap">
      <BaseStack gap="sm" style={{ flex: 1, minWidth: 0 }}>
        <TexoFilterBar
          actions={<BaseButton leftSection={<IconPlus size={14} />} onClick={() => navigate(`${pathname}?new=1`)} size="xs">New issue</BaseButton>}
          fields={fields}
          filters={filters}
          noun="issue"
          onFiltersChange={(f) => { setFilters(f); list.setWhere({ ...fixedWhere, ...filtersToWhere(f) } as Where); }}
          onSearchChange={list.setSearch}
          search={list.query.search ?? ''}
          searchPlaceholder="Search issues"
          total={list.total}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <TexoDataTable
            columns={COLUMNS}
            loading={list.loading}
            onEndReached={list.loadMore}
            onOpen={(row) => { setSelected([row.id]); navigate(`${listBase}/issues/${row.id}`); }}
            onSelectedChange={setSelected}
            onSortChange={(s) => list.setOrderBy(s)}
            renderCell={(c, v) => cell(c.key, v)}
            rows={list.rows}
            selectable
            selected={selected}
            sort={sort}
          />
        </div>
      </BaseStack>
      {openId && <IssueDetail entity={entity} id={openId} onClose={() => navigate('/issues')} />}
      <NewIssue entity={entity} onClose={newIssue.close} opened={newIssue.opened} />
      <BaseModal onClose={() => setAssigning(false)} opened={assigning} title="Assign">
        <RelationField label="Assignee" onChange={(id) => { if (selectedId) void update(selectedId, { assignee: id }).catch(() => undefined); setAssigning(false); }} store={liveStore} target={member} value={undefined} />
      </BaseModal>
    </BaseGroup>
  );
}

export function BoardPage() {
  const { issue } = useEntities();
  return issue ? <Board entity={issue} /> : null;
}

function Board({ entity }: { entity: Entity }) {
  const navigate = useNavigate();
  const { update } = useOptimistic(liveStore, entity);
  const newIssue = useNewIssueRoute();
  const cols = STATUSES.map((s) => ({ id: s, label: STATUS_LABEL[s], ...useLive(liveStore, entity, { where: { status: s }, orderBy: [{ field: 'priority', direction: 'desc' }], limit: 50 }) }));
  return (
    <div style={{ height: 'calc(100vh - 120px)' }}>
      <TexoBoard
        columns={cols.map((c) => ({ id: c.id, label: c.label, cards: c.rows, total: c.total }))}
        onMove={(id, status) => void update(id, { status }).catch(() => undefined)}
        onOpen={(card) => navigate(`/issues/${card.id}`)}
        renderCard={(card: Row) => (
          <BaseStack gap={2}>
            <BaseText size="sm" lineClamp={2}>{String(card.title)}</BaseText>
            <BaseText c="dimmed" size="xs">P{String(card.priority)} {PRIORITY_LABEL[Number(card.priority)] ?? ''}</BaseText>
          </BaseStack>
        )}
      />
      <NewIssue entity={entity} onClose={newIssue.close} opened={newIssue.opened} />
    </div>
  );
}

export function ProjectsPage() {
  const { project } = useEntities();
  return project ? <Projects entity={project} /> : null;
}

function Projects({ entity }: { entity: Entity }) {
  const navigate = useNavigate();
  const { rows, total } = useLive(liveStore, entity, { orderBy: [{ field: 'name', direction: 'asc' }], include: ['team'] });
  return (
    <BaseStack gap="sm">
      <BaseGroup gap={6}><BaseTitle order={4}>Projects</BaseTitle><BaseText c="dimmed" size="sm">{total}</BaseText></BaseGroup>
      <TexoDataTable
        columns={[{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status', width: 130 }, { key: 'team', label: 'Team', width: 160 }]}
        onOpen={(row) => navigate(`/projects/${row.id}`)}
        renderCell={(c, v) => cell(c.key, v)}
        rows={rows}
      />
    </BaseStack>
  );
}

export function ProjectPage() {
  const { id } = useParams();
  const { project } = useEntities();
  const [row, setRow] = useState<Row | undefined>();
  useEffect(() => {
    if (!project || !id) return;
    return liveStore.watch(project, { where: { id }, limit: 1 }, ({ rows }) => setRow(rows[0]));
  }, [project, id]);
  const where = useMemo(() => ({ project: id }), [id]);
  return (
    <BaseStack gap="sm" style={{ height: '100%' }}>
      <BaseStack gap={0}>
        <BaseTitle order={4}>{row ? String(row.name) : 'Project'}</BaseTitle>
        {row && <BaseText c="dimmed" size="sm">{STATUS_LABEL[String(row.status)] ?? String(row.status)}</BaseText>}
      </BaseStack>
      <IssuesPage where={where} />
    </BaseStack>
  );
}

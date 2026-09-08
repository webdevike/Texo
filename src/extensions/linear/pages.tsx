// Linear-lite pages: issues list (+ detail side panel), board, projects, project detail.
// Every view is a live query over the app's collections: rows load once, SSE and optimistic
// writes update the collection in place, and the queries re-evaluate locally. Nothing refetches.
import { IconPlus } from '@tabler/icons-react';
import { and, eq, gt, gte, ilike, inArray, isNull, isUndefined, lt, lte, not, or, useLiveQuery, type Collection, type ContextFromSource, type QueryBuilder } from '@tanstack/react-db';
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
  type TexoDataTableSort,
  type TexoFilter,
  type TexoFilterField,
} from '@texo/ui';
import { useCallback, useDeferredValue, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { Entity } from '../../../experiments/contracts-spike/contracts/entity';
import type { Where } from '../../../experiments/contracts-spike/contracts/store';
import { RelationField } from '../../admin/fields/relation';
import { IssueDetail } from './issue-detail';
import { describeError, issuesOf, namedOf, patchRow, PRIORITY_LABEL, STATUS_KEY, STATUS_LABEL, STATUSES, store, useEntities, type IssueRow } from './store';
import { notify, Toasts } from './toast';

const PAGE = 200;

/** Live `id -> name` lookup over a small relation target (members, projects, teams). */
function useNames(entity: Entity | undefined) {
  const { data } = useLiveQuery({
    queryKey: ['names', entity?.name],
    query: (q) => (entity ? q.from({ r: namedOf(entity) }) : undefined),
  });
  return useMemo(() => new Map((data ?? []).map((r) => [r.id, r.name])), [data]);
}

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
  return <BaseText size="sm" lineClamp={1}>{String(value)}</BaseText>;
}

type Expr = Parameters<typeof isNull>[0];
type Cond = { op: string; value?: unknown };

/**
 * TexoFilterBar / fixed `Where` conditions as TanStack DB predicates over the row ref. `labels` is
 * a many-relation (an array on the row) no operator covers; `filteredOf` applies it functionally.
 */
function predicatesOf(ref: Record<string, Expr>, where: Where): Expr[] {
  const exprs: Expr[] = [];
  for (const [field, raw] of Object.entries(where)) {
    if (field === 'labels') continue;
    const cond: Cond = raw && typeof raw === 'object' && 'op' in raw ? (raw as Cond) : { op: 'eq', value: raw };
    const col = ref[field];
    switch (cond.op) {
      case 'eq': exprs.push(eq(col, cond.value)); break;
      case 'ne': exprs.push(not(eq(col, cond.value))); break;
      case 'in': exprs.push(inArray(col, cond.value as unknown[])); break;
      case 'nin': exprs.push(not(inArray(col, cond.value as unknown[]))); break;
      case 'lt': exprs.push(lt(col, cond.value)); break;
      case 'lte': exprs.push(lte(col, cond.value)); break;
      case 'gt': exprs.push(gt(col, cond.value)); break;
      case 'gte': exprs.push(gte(col, cond.value)); break;
      case 'contains': exprs.push(ilike(col as string, `%${String(cond.value)}%`)); break;
      case 'isNull': exprs.push(or(isNull(col), isUndefined(col))); break;
    }
  }
  return exprs;
}

type IssueQuery = QueryBuilder<ContextFromSource<{ i: Collection<IssueRow, string> }>>;

/** Where chips, fixed conditions and the search box applied to an issue query. */
function filteredOf(b: IssueQuery, where: Where, search: string): IssueQuery {
  const fields = Object.keys(where);
  const arrays = fields.filter((f) => f === 'labels');
  let out = b;
  if (search || fields.length > arrays.length) {
    out = out.where(({ i }) => {
      const exprs = predicatesOf(i as unknown as Record<string, Expr>, where);
      if (search) exprs.push(ilike((i as unknown as IssueRow).title, `%${search}%`));
      return exprs.length > 1 ? and(exprs[0], exprs[1], ...exprs.slice(2)) : exprs[0];
    });
  }
  for (const field of arrays) {
    const raw = where[field] as Cond | string;
    const value = String(typeof raw === 'object' && raw ? raw.value : raw);
    out = out.fn.where((row) => ((row as { i: IssueRow }).i[field] as string[] | undefined)?.includes(value) ?? false);
  }
  return out;
}

/** New issue modal, opened by `c` / `?new=1`. */
function NewIssue({ entity, opened, onClose }: { entity: Entity; opened: boolean; onClose: () => void }) {
  const { team } = useEntities();
  const [title, setTitle] = useState('');
  const [teamId, setTeamId] = useState<string | undefined>();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    void store.create(entity, { title: title.trim(), team: teamId, status: 'todo', priority: 0 }).catch((err: unknown) => notify(describeError(err)));
    setTitle('');
    onClose();
  };
  return (
    <BaseModal onClose={onClose} opened={opened} title="New issue">
      <form onSubmit={submit}>
        <BaseStack gap="sm">
          <BaseTextInput autoFocus data-autofocus label="Title" onChange={(e) => setTitle(e.currentTarget.value)} value={title} />
          <RelationField label="Team" onChange={setTeamId} store={store} target={team} value={teamId} />
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
  const commands = useMemo(
    () => [
      ...[1, 2, 3, 4, 5].map((n) => ({ id: `linear.prio.${n}`, keys: String(n), when: () => !!selectedId, run: () => patchRow(entity, selectedId!, { priority: n - 1 }) })),
      ...Object.entries(STATUS_KEY).map(([k, status]) => ({ id: `linear.status.${status}`, keys: `s ${k}`, when: () => !!selectedId, run: () => patchRow(entity, selectedId!, { status }) })),
      { id: 'linear.assign', keys: 'a', when: () => !!selectedId, run: onAssign },
    ],
    [entity, selectedId, onAssign],
  );
  useHotkeys(commands);
}

export function IssuesPage({ where: fixedWhere }: { where?: Where } = {}) {
  const { issue } = useEntities();
  return issue ? <IssuesList entity={issue} fixedWhere={fixedWhere} /> : null;
}

const DEFAULT_SORT: TexoDataTableSort[] = [{ field: 'priority', direction: 'desc' }];

function IssuesList({ entity, fixedWhere }: { entity: Entity; fixedWhere?: Where }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { pathname } = useLocation();
  const { member, project } = useEntities();
  const [filters, setFilters] = useState<TexoFilter[]>([]);
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search.trim());
  const [sort, setSort] = useState<TexoDataTableSort[]>(DEFAULT_SORT);
  const [visible, setVisible] = useState(PAGE);
  const [selected, setSelected] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const newIssue = useNewIssueRoute();
  const listBase = fixedWhere ? pathname.replace(/\/issues\/.*$/, '') : '';
  const openId = fixedWhere ? undefined : routeId;
  const where = useMemo(() => ({ ...fixedWhere, ...filtersToWhere(filters) }) as Where, [fixedWhere, filters]);
  const whereKey = JSON.stringify(where);

  // The visible page and its total are two live queries over the same predicates; the second
  // has no limit, so the header is the true size of the filtered collection.
  const page = useLiveQuery({
    queryKey: ['issues', entity.name, whereKey, query, visible, sort],
    query: (q) => {
      let b = filteredOf(q.from({ i: issuesOf(entity) }), where, query);
      for (const s of sort.length ? sort : DEFAULT_SORT) b = b.orderBy(({ i }) => (i as unknown as Record<string, Expr>)[s.field], s.direction);
      return b.limit(visible);
    },
  });
  const total = useLiveQuery({
    queryKey: ['issues-total', entity.name, whereKey, query],
    query: (q) => filteredOf(q.from({ i: issuesOf(entity) }), where, query),
  });
  const rows = page.data ?? [];
  const totalCount = total.data?.length ?? 0;
  const memberNames = useNames(member);
  const projectNames = useNames(project);

  const fields: TexoFilterField[] = useMemo(
    () => entity.fields.filter((f) => ['status', 'priority', 'assignee', 'project', 'labels', 'team'].includes(f.name)).map((f) => ({ name: f.name, kind: f.kind === 'relation' ? 'relation' : f.kind === 'enum' ? 'enum' : 'number', label: f.name, options: f.kind === 'enum' ? f.options : undefined })),
    [entity],
  );

  const loadMore = useCallback(() => setVisible((v) => (v < totalCount ? v + PAGE : v)), [totalCount]);

  const selectedId = selected[0];
  useIssueKeys(entity, selectedId, useCallback(() => setAssigning(true), []));
  useHotkeys(useMemo(() => [
    { id: 'linear.list.down', keys: 'j', run: () => move(1) },
    { id: 'linear.list.up', keys: 'k', run: () => move(-1) },
    { id: 'linear.list.open', keys: 'enter', when: () => !!selectedId && !openId, run: () => navigate(`${listBase}/issues/${selectedId}`) },
    { id: 'linear.search', keys: '/', run: () => (document.querySelector('input[placeholder="Search issues"]') as HTMLInputElement | null)?.focus() },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [selectedId, openId, rows]));
  function move(delta: number) {
    if (!rows.length) return;
    const at = rows.findIndex((r) => r.id === selectedId);
    const next = Math.max(0, Math.min(rows.length - 1, at + delta));
    setSelected([rows[next].id]);
    document.querySelector(`[role="row"][aria-rowindex="${next + 1}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  return (
    <BaseGroup align="stretch" gap={0} style={{ height: 'calc(100vh - 120px)' }} wrap="nowrap">
      <BaseStack gap="sm" style={{ flex: 1, minWidth: 0 }}>
        <TexoFilterBar
          actions={<BaseButton leftSection={<IconPlus size={14} />} onClick={() => navigate(`${pathname}?new=1`)} size="xs">New issue</BaseButton>}
          fields={fields}
          filters={filters}
          noun="issue"
          onFiltersChange={(f) => { setFilters(f); setVisible(PAGE); }}
          onSearchChange={(s) => { setSearch(s); setVisible(PAGE); }}
          search={search}
          searchPlaceholder="Search issues"
          total={totalCount}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <TexoDataTable
            columns={COLUMNS}
            loading={page.isLoading}
            onEndReached={loadMore}
            onOpen={(row) => { setSelected([row.id]); navigate(`${listBase}/issues/${row.id}`); }}
            onSelectedChange={setSelected}
            onSortChange={setSort}
            renderCell={(c, v) => cell(c.key, c.key === 'assignee' ? memberNames.get(String(v)) : c.key === 'project' ? projectNames.get(String(v)) : v)}
            rows={rows}
            selectable
            selected={selected}
            sort={sort}
          />
        </div>
        {rows.length < totalCount && (
          <BaseGroup gap="sm" justify="center">
            <BaseText c="dimmed" size="xs">{rows.length.toLocaleString()} of {totalCount.toLocaleString()}</BaseText>
            <BaseButton data-load-more onClick={loadMore} size="xs" variant="subtle">Load more</BaseButton>
          </BaseGroup>
        )}
      </BaseStack>
      {openId && <IssueDetail entity={entity} id={openId} onClose={() => navigate('/issues')} />}
      <NewIssue entity={entity} onClose={newIssue.close} opened={newIssue.opened} />
      <BaseModal onClose={() => setAssigning(false)} opened={assigning} title="Assign">
        <RelationField label="Assignee" onChange={(id) => { if (selectedId) patchRow(entity, selectedId, { assignee: id }); setAssigning(false); }} store={store} target={member} value={undefined} />
      </BaseModal>
      <Toasts />
    </BaseGroup>
  );
}

export function BoardPage() {
  const { issue } = useEntities();
  return issue ? <Board entity={issue} /> : null;
}

function Board({ entity }: { entity: Entity }) {
  const navigate = useNavigate();
  const newIssue = useNewIssueRoute();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [assigning, setAssigning] = useState(false);
  const { member } = useEntities();
  // STATUSES is a fixed tuple, so the hook order is stable across renders.
  const columns = STATUSES.map((status) => {
    const { data } = useLiveQuery({
      queryKey: ['board', entity.name, status],
      query: (q) => q.from({ i: issuesOf(entity) }).where(({ i }) => eq(i.status, status)).orderBy(({ i }) => i.priority, 'desc'),
    });
    return { id: status, label: STATUS_LABEL[status], cards: data, total: data.length };
  });
  useIssueKeys(entity, selectedId, useCallback(() => setAssigning(true), []));
  return (
    <div style={{ height: 'calc(100vh - 120px)' }}>
      <TexoBoard
        columns={columns}
        onMove={(id, status) => patchRow(entity, id, { status })}
        onOpen={(card) => { setSelectedId(card.id); navigate(`/issues/${card.id}`); }}
        renderCard={(card) => (
          <BaseStack gap={2}>
            <BaseText size="sm" lineClamp={2}>{card.title}</BaseText>
            <BaseText c="dimmed" size="xs">P{card.priority} {PRIORITY_LABEL[card.priority] ?? ''}</BaseText>
          </BaseStack>
        )}
      />
      <NewIssue entity={entity} onClose={newIssue.close} opened={newIssue.opened} />
      <BaseModal onClose={() => setAssigning(false)} opened={assigning} title="Assign">
        <RelationField label="Assignee" onChange={(id) => { if (selectedId) patchRow(entity, selectedId, { assignee: id }); setAssigning(false); }} store={store} target={member} value={undefined} />
      </BaseModal>
      <Toasts />
    </div>
  );
}

export function ProjectsPage() {
  const { project } = useEntities();
  return project ? <Projects entity={project} /> : null;
}

function Projects({ entity }: { entity: Entity }) {
  const navigate = useNavigate();
  const { team } = useEntities();
  const teamNames = useNames(team);
  const { data } = useLiveQuery({
    queryKey: ['projects', entity.name],
    query: (q) => q.from({ p: namedOf(entity) }).orderBy(({ p }) => p.name, 'asc'),
  });
  return (
    <BaseStack gap="sm">
      <BaseGroup gap={6}><BaseTitle order={4}>Projects</BaseTitle><BaseText c="dimmed" size="sm">{data.length}</BaseText></BaseGroup>
      <TexoDataTable
        columns={[{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status', width: 130 }, { key: 'team', label: 'Team', width: 160 }]}
        onOpen={(row) => navigate(`/projects/${row.id}`)}
        renderCell={(c, v) => cell(c.key, c.key === 'team' ? teamNames.get(String(v)) : v)}
        rows={data}
      />
    </BaseStack>
  );
}

export function ProjectPage() {
  const { id } = useParams();
  const { project } = useEntities();
  const { data: row } = useLiveQuery({
    queryKey: ['project', id],
    query: (q) => (project && id ? q.from({ p: namedOf(project) }).where(({ p }) => eq(p.id, id)).findOne() : undefined),
  });
  const where = useMemo(() => ({ project: id }), [id]);
  return (
    <BaseStack gap="sm" style={{ height: '100%' }}>
      <BaseStack gap={0}>
        <BaseTitle order={4}>{row ? row.name : 'Project'}</BaseTitle>
        {row && <BaseText c="dimmed" size="sm">{STATUS_LABEL[String(row.status)] ?? String(row.status)}</BaseText>}
      </BaseStack>
      <IssuesPage where={where} />
    </BaseStack>
  );
}

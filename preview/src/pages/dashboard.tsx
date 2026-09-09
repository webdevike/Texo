import { useMemo, useState } from 'react';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { barY, defineChart, lineY } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import {
  BaseBadge,
  BaseCard,
  BaseGroup,
  BaseSelect,
  BaseStack,
  BaseText,
  BaseTitle,
  TexoDataTable,
  type TexoDataTableColumn,
} from '@texo/ui';
import { ListPageLayout } from '../list-page-layout';
import classes from './dashboard.module.css';

export const page = { id: 'dashboard', label: 'Dashboard' };

type Period = 'This week' | 'This month' | 'This quarter';
type Stat = {
  id: string;
  label: string;
  value: string;
  change: number;
  note: string;
};
type Renewal = {
  id: string;
  customer: string;
  type: 'Renewal' | 'Expansion' | 'Downgrade';
  owner: string;
  closes: string;
  week: string;
  value: number;
};
type MrrPoint = { label: string; mrr: number };
type Attention = {
  id: string;
  customer: string;
  reason: string;
  severity: 'High' | 'Medium' | 'Low';
  owner: string;
};

const periods: Period[] = ['This week', 'This month', 'This quarter'];
const owners = ['Priya Shah', 'Marcus Lee', 'Dana Ortiz', 'Sam Iqbal'];

// Local sample figures for the dashboard experiment.
const statsByPeriod: Record<Period, Stat[]> = {
  'This week': [
    { id: 'active', label: 'Active customers', value: '128', change: 2, note: 'vs last week' },
    { id: 'mrr', label: 'Monthly recurring revenue', value: '$84.2k', change: 0.8, note: 'vs last week' },
    { id: 'renewals', label: 'Renewals due', value: '3', change: -1, note: '1 at risk' },
    { id: 'tickets', label: 'Open tickets', value: '14', change: -5, note: 'vs last week' },
  ],
  'This month': [
    { id: 'active', label: 'Active customers', value: '128', change: 6, note: 'vs last month' },
    { id: 'mrr', label: 'Monthly recurring revenue', value: '$84.2k', change: 3.1, note: 'vs last month' },
    { id: 'renewals', label: 'Renewals due', value: '9', change: 2, note: '3 at risk' },
    { id: 'tickets', label: 'Open tickets', value: '14', change: -9, note: 'vs last month' },
  ],
  'This quarter': [
    { id: 'active', label: 'Active customers', value: '128', change: 17, note: 'vs last quarter' },
    { id: 'mrr', label: 'Monthly recurring revenue', value: '$84.2k', change: 9.4, note: 'vs last quarter' },
    { id: 'renewals', label: 'Renewals due', value: '27', change: 4, note: '6 at risk' },
    { id: 'tickets', label: 'Open tickets', value: '14', change: -12, note: 'vs last quarter' },
  ],
};

// Recurring revenue in thousands, one point per unit of the selected period.
const mrrByPeriod: Record<Period, MrrPoint[]> = {
  'This week': [
    { label: 'Mon', mrr: 83.5 },
    { label: 'Tue', mrr: 83.6 },
    { label: 'Wed', mrr: 83.9 },
    { label: 'Thu', mrr: 83.8 },
    { label: 'Fri', mrr: 84.0 },
    { label: 'Sat', mrr: 84.1 },
    { label: 'Sun', mrr: 84.2 },
  ],
  'This month': [
    { label: 'Wk 1', mrr: 81.7 },
    { label: 'Wk 2', mrr: 82.4 },
    { label: 'Wk 3', mrr: 82.1 },
    { label: 'Wk 4', mrr: 83.3 },
    { label: 'Wk 5', mrr: 84.2 },
  ],
  'This quarter': [
    { label: 'Jul', mrr: 77.0 },
    { label: 'Aug', mrr: 80.6 },
    { label: 'Sep', mrr: 84.2 },
  ],
};

const weeks = ['8 Sep', '15 Sep', '22 Sep', '29 Sep'];
const types: Renewal['type'][] = ['Renewal', 'Expansion', 'Downgrade'];
const typeColors: Record<Renewal['type'], string> = {
  Renewal: 'var(--texo-chart-1)',
  Expansion: 'var(--texo-chart-2)',
  Downgrade: 'var(--texo-chart-4)',
};

const renewals: Renewal[] = [
  { id: 'r1', customer: 'Northwind Traders', type: 'Renewal', owner: 'Priya Shah', closes: '12 Sep', week: '8 Sep', value: 18400 },
  { id: 'r2', customer: 'Lumen Health', type: 'Expansion', owner: 'Marcus Lee', closes: '15 Sep', week: '15 Sep', value: 7200 },
  { id: 'r3', customer: 'Harbor Logistics', type: 'Renewal', owner: 'Dana Ortiz', closes: '18 Sep', week: '15 Sep', value: 12600 },
  { id: 'r4', customer: 'Pinecrest Schools', type: 'Downgrade', owner: 'Sam Iqbal', closes: '19 Sep', week: '15 Sep', value: 3100 },
  { id: 'r5', customer: 'Atlas Robotics', type: 'Expansion', owner: 'Priya Shah', closes: '22 Sep', week: '22 Sep', value: 9800 },
  { id: 'r6', customer: 'Bluebird Media', type: 'Renewal', owner: 'Marcus Lee', closes: '24 Sep', week: '22 Sep', value: 5400 },
  { id: 'r7', customer: 'Coastal Dental', type: 'Renewal', owner: 'Dana Ortiz', closes: '27 Sep', week: '22 Sep', value: 2900 },
  { id: 'r8', customer: 'Summit Outfitters', type: 'Expansion', owner: 'Priya Shah', closes: '30 Sep', week: '29 Sep', value: 11300 },
];

const attention: Attention[] = [
  { id: 'a1', customer: 'Harbor Logistics', reason: 'Renewal unsigned, 9 days left', severity: 'High', owner: 'Dana Ortiz' },
  { id: 'a2', customer: 'Pinecrest Schools', reason: 'Requested seat reduction', severity: 'High', owner: 'Sam Iqbal' },
  { id: 'a3', customer: 'Bluebird Media', reason: 'Two escalated tickets this week', severity: 'Medium', owner: 'Marcus Lee' },
  { id: 'a4', customer: 'Coastal Dental', reason: 'No login in 21 days', severity: 'Medium', owner: 'Dana Ortiz' },
  { id: 'a5', customer: 'Atlas Robotics', reason: 'Invoice overdue by 6 days', severity: 'Low', owner: 'Priya Shah' },
];

const columns: TexoDataTableColumn[] = [
  { key: 'customer', label: 'Customer', width: 'minmax(112px, 1fr)' },
  { key: 'type', label: 'Type', width: 112 },
  { key: 'owner', label: 'Owner', width: 104 },
  { key: 'closes', label: 'Closes', width: 72 },
  { key: 'value', label: 'Value', align: 'right', width: 82 },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function TypeBadge({ value }: { value: Renewal['type'] }) {
  return (
    <BaseBadge
      variant="light"
      color={
        value === 'Expansion'
          ? 'green'
          : value === 'Downgrade'
            ? 'orange'
            : 'gray'
      }
      tt="none"
      fw={500}
    >
      {value}
    </BaseBadge>
  );
}

function SeverityBadge({ value }: { value: Attention['severity'] }) {
  return (
    <BaseBadge
      variant="light"
      color={value === 'High' ? 'red' : value === 'Medium' ? 'orange' : 'gray'}
      tt="none"
      fw={500}
    >
      {value}
    </BaseBadge>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const up = stat.change >= 0;
  const good = stat.id === 'tickets' ? !up : up;
  return (
    <BaseCard
      withBorder
      padding="lg"
      className={classes.card}
      data-target="stat"
      data-target-label="Stat"
      data-record={stat.id}
      data-record-label={stat.label}
    >
      <BaseStack gap={8}>
        <BaseText size="sm" c="dimmed">
          {stat.label}
        </BaseText>
        <BaseText className={classes.value}>{stat.value}</BaseText>
        <BaseGroup gap={6} wrap="nowrap">
          <BaseBadge
            variant="light"
            color={good ? 'green' : 'red'}
            tt="none"
            fw={500}
            leftSection={
              up ? (
                <IconArrowUpRight size={12} />
              ) : (
                <IconArrowDownRight size={12} />
              )
            }
          >
            {up ? '+' : ''}
            {stat.change}
            {stat.id === 'mrr' ? '%' : ''}
          </BaseBadge>
          <BaseText size="xs" c="dimmed" truncate>
            {stat.note}
          </BaseText>
        </BaseGroup>
      </BaseStack>
    </BaseCard>
  );
}

function MrrChart({ period }: { period: Period }) {
  const points = mrrByPeriod[period];
  const definition = useMemo(() => {
    const values = points.map((point) => point.mrr);
    const low = Math.floor(Math.min(...values) - 2);
    const high = Math.ceil(Math.max(...values) + 2);
    return defineChart({
      marks: [
        lineY(points, {
          x: 'label',
          y: 'mrr',
          stroke: 'var(--texo-chart-1)',
          strokeWidth: 2,
          points: true,
        }),
      ],
      scales: {
        x: { scale: () => scalePoint<string>().padding(0.2) },
        y: {
          scale: scaleLinear().domain([low, high]),
          grid: true,
          axis: { ticks: { format: (value) => `$${value}k` } },
        },
      },
      svgAnimation: true,
      tooltip,
    });
  }, [points]);
  const first = points[0].mrr;
  const last = points[points.length - 1].mrr;
  return (
    <BaseCard
      withBorder
      padding="lg"
      className={classes.card}
      data-target="mrr-chart"
      data-target-label="MRR trend"
    >
      <BaseStack gap="md">
        <BaseGroup justify="space-between" align="baseline">
          <BaseTitle order={2} size="h4">
            Recurring revenue
          </BaseTitle>
          <BaseText size="sm" c="dimmed" role="status">
            {`$${first}k to $${last}k, ${period.toLowerCase()}`}
          </BaseText>
        </BaseGroup>
        <Chart ariaLabel={`Monthly recurring revenue, ${period}`} definition={definition} height={220} />
      </BaseStack>
    </BaseCard>
  );
}

function PipelineChart({ rows }: { rows: Renewal[] }) {
  const definition = useMemo(() => {
    const totals = new Map<string, { week: string; type: Renewal['type']; value: number }>();
    for (const row of rows) {
      const key = `${row.week}/${row.type}`;
      const cell = totals.get(key) ?? { week: row.week, type: row.type, value: 0 };
      cell.value += row.value;
      totals.set(key, cell);
    }
    const cells = [...totals.values()];
    return defineChart({
      marks: [
        barY(cells, {
          x: 'week',
          y: 'value',
          color: 'type',
          key: (cell) => `${cell.week}/${cell.type}`,
          inset: 6,
          radius: 3,
        }),
      ],
      scales: {
        x: { scale: scaleBand<string>().domain(weeks).padding(0.3) },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: { ticks: { format: (value) => `$${Number(value) / 1000}k` } },
        },
      },
      color: { domain: types, range: types.map((type) => typeColors[type]) },
      svgAnimation: true,
      tooltip,
    });
  }, [rows]);
  return (
    <BaseCard
      withBorder
      padding="lg"
      className={classes.card}
      data-target="pipeline-chart"
      data-target-label="Pipeline by week"
    >
      <BaseStack gap="md">
        <BaseGroup justify="space-between" align="baseline">
          <BaseTitle order={2} size="h4">
            Pipeline by close week
          </BaseTitle>
          <BaseGroup gap="md">
            {types.map((type) => (
              <BaseGroup key={type} gap={6} wrap="nowrap">
                <span className={classes.dot} style={{ background: typeColors[type] }} />
                <BaseText size="xs" c="dimmed">
                  {type}
                </BaseText>
              </BaseGroup>
            ))}
          </BaseGroup>
        </BaseGroup>
        {rows.length === 0 ? (
          <BaseText size="sm" c="dimmed">
            No renewals for this owner.
          </BaseText>
        ) : (
          <Chart ariaLabel="Pipeline value by close week and type" definition={definition} height={220} />
        )}
      </BaseStack>
    </BaseCard>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('This month');
  const [owner, setOwner] = useState('All owners');
  const all = owner === 'All owners';
  const rows = renewals.filter((row) => all || row.owner === owner);
  const flagged = attention.filter((item) => all || item.owner === owner);
  const pipeline = rows.reduce((sum, row) => sum + row.value, 0);
  const byOwner = owners
    .filter((name) => all || name === owner)
    .map((name) => ({
      name,
      count: renewals.filter((row) => row.owner === name).length,
    }));
  const most = Math.max(1, ...byOwner.map((entry) => entry.count));

  return (
    <ListPageLayout
      title="Dashboard"
      description="Account health, renewals, and the customers that need a hand this period."
      filters={
        <BaseGroup justify="space-between" gap="md">
          <BaseGroup gap="sm">
            <BaseSelect
              aria-label="Period"
              data={periods}
              value={period}
              onChange={(value) => value && setPeriod(value as Period)}
              allowDeselect={false}
              w={160}
              data-target="period"
              data-target-label="Period"
            />
            <BaseSelect
              aria-label="Account owner"
              data={['All owners', ...owners]}
              value={owner}
              onChange={(value) => value && setOwner(value)}
              allowDeselect={false}
              w={180}
              data-target="owner"
              data-target-label="Owner filter"
            />
          </BaseGroup>
          <BaseText size="xs" c="dimmed">
            Sample data, updated 9 Sep at 08:00
          </BaseText>
        </BaseGroup>
      }
    >
      <div className={classes.stats} data-target="stats" data-target-label="Stats">
        {statsByPeriod[period].map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
      <div className={classes.charts} data-target="charts" data-target-label="Charts">
        <MrrChart period={period} />
        <PipelineChart rows={rows} />
      </div>
      <div className={classes.columns}>
        <BaseCard
          withBorder
          padding="lg"
          className={classes.card}
          data-target="renewals"
          data-target-label="Upcoming renewals"
        >
          <BaseStack gap="md">
            <BaseGroup justify="space-between" align="baseline">
              <BaseTitle order={2} size="h4">
                Upcoming renewals
              </BaseTitle>
              <BaseText size="sm" c="dimmed" role="status">
                {rows.length} deals, {currency.format(pipeline)}
              </BaseText>
            </BaseGroup>
            <div
              className={classes.table}
              data-target="table"
              data-target-label="Renewals table"
            >
              <TexoDataTable
                columns={columns}
                rows={rows}
                renderCell={(column, value, row) => {
                  if (column.key === 'customer')
                    return (
                      <BaseText size="sm" fw={500} truncate>
                        {row.customer}
                      </BaseText>
                    );
                  if (column.key === 'type') return <TypeBadge value={row.type} />;
                  if (column.key === 'value')
                    return <BaseText size="sm">{currency.format(row.value)}</BaseText>;
                  return (
                    <BaseText size="sm" truncate>
                      {String(value)}
                    </BaseText>
                  );
                }}
                emptyLabel={
                  <BaseText size="sm">No renewals for this owner.</BaseText>
                }
              />
            </div>
          </BaseStack>
        </BaseCard>
        <BaseStack gap="md">
          <BaseCard
            withBorder
            padding="lg"
            className={classes.card}
            data-target="attention"
            data-target-label="Needs attention"
          >
            <BaseStack gap="md">
              <BaseTitle order={2} size="h4">
                Needs attention
              </BaseTitle>
              {flagged.length === 0 ? (
                <BaseText size="sm" c="dimmed">
                  Nothing flagged for this owner.
                </BaseText>
              ) : (
                <ul className={classes.list}>
                  {flagged.map((item) => (
                    <li
                      key={item.id}
                      data-target="flag"
                      data-target-label="Flagged customer"
                      data-record={item.id}
                      data-record-label={item.customer}
                    >
                      <BaseStack gap={2} style={{ minWidth: 0 }}>
                        <BaseText size="sm" fw={500} truncate>
                          {item.customer}
                        </BaseText>
                        <BaseText size="xs" c="dimmed" truncate>
                          {item.reason}
                        </BaseText>
                      </BaseStack>
                      <SeverityBadge value={item.severity} />
                    </li>
                  ))}
                </ul>
              )}
            </BaseStack>
          </BaseCard>
          <BaseCard
            withBorder
            padding="lg"
            className={classes.card}
            data-target="workload"
            data-target-label="Renewals by owner"
          >
            <BaseStack gap="md">
              <BaseTitle order={2} size="h4">
                Renewals by owner
              </BaseTitle>
              <BaseStack gap="sm">
                {byOwner.map((entry) => (
                  <BaseStack
                    key={entry.name}
                    gap={4}
                    data-target="bar"
                    data-target-label="Owner bar"
                    data-record={entry.name}
                    data-record-label={entry.name}
                  >
                    <BaseGroup justify="space-between" wrap="nowrap">
                      <BaseText size="sm" truncate>
                        {entry.name}
                      </BaseText>
                      <BaseText size="sm" c="dimmed">
                        {entry.count}
                      </BaseText>
                    </BaseGroup>
                    <div
                      className={classes.track}
                      role="meter"
                      aria-label={`${entry.name} renewals`}
                      aria-valuenow={entry.count}
                      aria-valuemin={0}
                      aria-valuemax={most}
                    >
                      <div
                        className={classes.fill}
                        style={{ width: `${(entry.count / most) * 100}%` }}
                      />
                    </div>
                  </BaseStack>
                ))}
              </BaseStack>
            </BaseStack>
          </BaseCard>
        </BaseStack>
      </div>
    </ListPageLayout>
  );
}

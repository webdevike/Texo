import { barY, defineChart } from '@tanstack/charts';
import { pie, polar, radialArc } from '@tanstack/charts/polar';
import { Chart } from '@tanstack/charts/react';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { BaseBox, BaseCard, BaseGroup, BaseStack, BaseText, BaseTitle } from '@texo/ui';

import classes from './business-metrics-charts.module.css';

const revenueRows = [
  { color: 'var(--texo-chart-3)', label: 'Jul Plus', value: 0.75 },
  { color: 'var(--texo-chart-5)', label: 'Jul Pro', value: 1.9 },
  { color: 'var(--texo-chart-4)', label: 'Jul Enterprise', value: 1.05 },
  { color: 'var(--texo-chart-3)', label: 'Aug Plus', value: 1.1 },
  { color: 'var(--texo-chart-5)', label: 'Aug Pro', value: 2.5 },
  { color: 'var(--texo-chart-4)', label: 'Aug Enterprise', value: 0.85 },
  { color: 'var(--texo-chart-3)', label: 'Sep Plus', value: 1.4 },
  { color: 'var(--texo-chart-5)', label: 'Sep Pro', value: 2.8 },
  { color: 'var(--texo-chart-4)', label: 'Sep Enterprise', value: 1.55 },
];

const revenueChart = defineChart({
  marks: [
    barY(revenueRows, {
      fill: (row) => row.color,
      inset: 5,
      x: 'label',
      y: 'value',
    }),
  ],
  scales: {
    x: {
      axis: { ticks: { format: (value) => String(value).split(' ')[0] } },
      scale: () => scaleBand<string>().padding(0.1),
    },
    y: { axis: { label: 'Revenue ($M)' }, grid: true, nice: true, scale: scaleLinear },
  },
  svgAnimation: true,
  tooltip,
});

const dealRows = [
  { label: 'ICP', value: 40 },
  { label: 'VC', value: 22 },
  { label: 'SP', value: 17 },
  { label: 'TtS', value: 10 },
  { label: 'Other', value: 11 },
];
const dealColors = [
  'var(--texo-chart-1)',
  'var(--texo-chart-2)',
  'var(--texo-chart-3)',
  'var(--texo-chart-4)',
  'var(--texo-chart-5)',
] as const;
const dealSlices = pie(dealRows, { gapAngle: 0.025, value: 'value' });
const dealChart = defineChart({
  marks: [
    polar({
      inset: 12,
      marks: [
        radialArc(dealSlices, {
          color: 'label',
          cornerRadius: 5,
          innerRadius: ({ radius }) => radius * 0.58,
          key: 'label',
        }),
      ],
      radiusRatio: 0.9,
      scales: { angle: null, radius: null },
    }),
  ],
  scales: { x: null, y: null },
  color: { domain: dealRows.map((row) => row.label), range: dealColors },
  svgAnimation: true,
  tooltip,
});

const revenueLegend = [
  ['Plus', 'var(--texo-chart-3)'],
  ['Pro', 'var(--texo-chart-5)'],
  ['Enterprise', 'var(--texo-chart-4)'],
] as const;
const dealLegend = dealRows.map((row, index) => [row.label, dealColors[index]] as const);

function Legend({ items }: { items: ReadonlyArray<readonly [string, string | undefined]> }) {
  return (
    <BaseGroup gap="md">
      {items.map(([label, color]) => (
        <BaseGroup gap={6} key={label} wrap="nowrap">
          <BaseBox className={classes.dot} style={{ background: color }} />
          <BaseText c="dimmed" size="xs">{label}</BaseText>
        </BaseGroup>
      ))}
    </BaseGroup>
  );
}

export function BusinessMetricsCharts() {
  return (
    <BaseStack gap="sm">
      <div>
        <BaseTitle order={3}>Business Metrics</BaseTitle>
        <BaseText c="dimmed" size="sm">Sales pipeline, revenue growth, and customer segments.</BaseText>
      </div>
      <BaseBox className={classes.grid}>
        <BaseCard className={classes.card} padding="md">
          <BaseStack gap="md">
            <BaseText fw={600}>Revenue growth by paid plan</BaseText>
            <Legend items={revenueLegend} />
            <Chart ariaLabel="Revenue growth by paid plan" definition={revenueChart} height={280} />
          </BaseStack>
        </BaseCard>
        <BaseCard className={classes.card} padding="md">
          <BaseStack gap="md">
            <BaseText fw={600}>Closed-won deals by MQL type</BaseText>
            <Legend items={dealLegend} />
            <Chart ariaLabel="Closed-won deals by MQL type" definition={dealChart} height={280} />
          </BaseStack>
        </BaseCard>
      </BaseBox>
    </BaseStack>
  );
}

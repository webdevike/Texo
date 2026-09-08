// The /insights route: one card per user entity with its total and a bar list over the
// entity's first enum field. Data comes from the manifest (host) and `ClientStore.list`
// totals over the HTTP store; both are fetched here because RouteContribution.element takes
// no props and the extension contract has no provider hook.
import { IconRefresh } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { BaseActionIcon, BaseBox, BaseGroup, BaseLoader, BaseStack, BaseText, BaseTitle, BaseTooltip } from '@texo/ui';

import { host, type Manifest } from '../../admin/client';
import { createHttpStore } from '../../../experiments/contracts-spike/adapters/store-http';
import type { ClientStore } from '../../../experiments/contracts-spike/contracts/store';
import { type EntityInsight, insightsOf, onRefresh } from './stats';

export const store: ClientStore = createHttpStore('/api', { origin: 'insights' });

/** `--texo-chart-1..5` cycle; the theme provider sets them on the app root. */
export function chartColor(index: number): string {
  return `var(--texo-chart-${(index % 5) + 1})`;
}

export function BarList({ buckets, total }: { buckets: { option: string; count: number }[]; total: number }) {
  return (
    <BaseStack gap={6}>
      {buckets.map((b, i) => (
        <BaseBox key={b.option}>
          <BaseGroup justify="space-between" gap="xs" mb={2}>
            <BaseText size="sm">{b.option}</BaseText>
            <BaseText size="sm" c="dimmed" ff="monospace">{b.count}</BaseText>
          </BaseGroup>
          <BaseBox style={{ height: 6, borderRadius: 3, background: 'var(--mantine-color-default-border)' }}>
            <BaseBox
              style={{
                height: '100%',
                borderRadius: 3,
                width: total > 0 ? `${(b.count / total) * 100}%` : 0,
                background: chartColor(i),
              }}
            />
          </BaseBox>
        </BaseBox>
      ))}
    </BaseStack>
  );
}

function InsightCard({ insight }: { insight: EntityInsight }) {
  return (
    <BaseBox p="md" style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-default)' }}>
      <BaseStack gap="md">
        <BaseStack gap={0}>
          <BaseText fw={600}>{insight.entity}</BaseText>
          <BaseText size="sm" c="dimmed">
            {insight.total} {insight.total === 1 ? 'row' : 'rows'}
            {insight.breakdown ? ` by ${insight.breakdown.field}` : ''}
          </BaseText>
        </BaseStack>
        {insight.breakdown ? (
          <BarList buckets={insight.breakdown.buckets} total={insight.total} />
        ) : (
          <BaseText size="sm" c="dimmed">No enum field to break down by.</BaseText>
        )}
      </BaseStack>
    </BaseBox>
  );
}

/** Loads manifest + insights; `onRefresh` (palette command) and the button re-run it. */
export function useInsights() {
  const [manifest, setManifest] = useState<Manifest>();
  const [insights, setInsights] = useState<EntityInsight[]>();
  const [error, setError] = useState<string>();
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => onRefresh(refresh), [refresh]);
  useEffect(() => {
    let live = true;
    setError(undefined);
    host
      .manifest()
      .then(async (m) => {
        const rows = await insightsOf(store, m);
        if (!live) return;
        setManifest(m);
        setInsights(rows);
      })
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [tick]);

  return { manifest, insights, error, refresh, loading: insights === undefined && !error };
}

export function InsightsPage() {
  const { insights, error, refresh, loading } = useInsights();
  return (
    <BaseStack gap="lg" p="lg">
      <BaseGroup justify="space-between">
        <BaseStack gap={0}>
          <BaseTitle order={3}>Insights</BaseTitle>
          <BaseText size="sm" c="dimmed">Row totals per entity, split by its first enum field.</BaseText>
        </BaseStack>
        <BaseTooltip label="Refresh insights">
          <BaseActionIcon variant="default" aria-label="Refresh insights" onClick={refresh}>
            <IconRefresh size={16} />
          </BaseActionIcon>
        </BaseTooltip>
      </BaseGroup>
      {error ? <BaseText c="red">{error}</BaseText> : null}
      {loading ? <BaseLoader size="sm" /> : null}
      {insights ? (
        <BaseBox style={{ display: 'grid', gap: 'var(--mantine-spacing-md)', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {insights.map((insight) => (
            <InsightCard key={insight.entity} insight={insight} />
          ))}
        </BaseBox>
      ) : null}
    </BaseStack>
  );
}

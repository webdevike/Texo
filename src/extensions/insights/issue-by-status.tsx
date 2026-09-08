// The `issue-by-status` view: a bar list of issue counts per status option. The contract
// hands a view only `{ entity }`, so the spec comes from the manifest and the counts from the
// shared HTTP store, same as the page.
import { useEffect, useState } from 'react';
import { BaseLoader, BaseStack, BaseText } from '@texo/ui';

import { host } from '../../admin/client';
import { BarList, store } from './insights-page';
import { type EntityInsight, insightOf, onRefresh } from './stats';

export function IssueByStatus({ entity }: { entity: string }) {
  const [insight, setInsight] = useState<EntityInsight>();
  const [error, setError] = useState<string>();
  const [tick, setTick] = useState(0);

  useEffect(() => onRefresh(() => setTick((t) => t + 1)), []);
  useEffect(() => {
    let live = true;
    host
      .manifest()
      .then(async (m) => {
        const spec = m.entities.find((e) => e.name === entity);
        if (!spec) throw new Error(`unknown entity "${entity}"`);
        const next = await insightOf(store, spec);
        if (live) setInsight(next);
      })
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [entity, tick]);

  if (error) return <BaseText c="red">{error}</BaseText>;
  if (!insight) return <BaseLoader size="sm" />;
  return (
    <BaseStack gap="xs" p="md" maw={420}>
      <BaseText size="sm" c="dimmed">
        {insight.total} {entity} rows{insight.breakdown ? ` by ${insight.breakdown.field}` : ''}
      </BaseText>
      {insight.breakdown ? <BarList buckets={insight.breakdown.buckets} total={insight.total} /> : null}
    </BaseStack>
  );
}

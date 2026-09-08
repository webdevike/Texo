// Insights: per-entity row totals broken down by the first enum field. Route, rail nav
// entry, palette commands and one entity view, all from the extension contract alone.
import { IconChartBar } from '@tabler/icons-react';
import { createElement } from 'react';

import { defineExtension } from '../../../experiments/contracts-spike/contracts/extension';
import { InsightsPage } from './insights-page';
import { IssueByStatus } from './issue-by-status';
import { requestRefresh } from './stats';

export default defineExtension({
  id: 'insights',
  name: 'Insights',
  routes: [{ path: '/insights', element: InsightsPage, title: 'Insights' }],
  nav: [{ section: 'Insights', label: 'Insights', path: '/insights', icon: createElement(IconChartBar, { size: 16 }), order: 30 }],
  commands: [
    { id: 'insights.go', label: 'Go to insights', keys: 'g n', group: 'Insights', run: ({ navigate }) => navigate('/insights') },
    { id: 'insights.refresh', label: 'Refresh insights', group: 'Insights', run: () => requestRefresh() },
  ],
  views: [{ id: 'issue-by-status', entity: 'issue', label: 'By status', component: IssueByStatus }],
});

// Insights: per-entity row totals broken down by the first enum field. Route, rail nav
// entry, palette commands and one entity view, all from the extension contract alone.
//
// Two extras beyond the brief, both because the shell reads less than the contract offers:
// the shell renders only `Backend/Schema` and `Backend/Settings` nav sections, so the
// contract-shaped `Insights` section entry is kept and a second entry rides in
// `Backend/Settings` so the item is actually reachable; and nothing consumes
// `registry.views`, so `/insights/issue-by-status` mounts the view for verification.
import { IconChartBar } from '@tabler/icons-react';
import { createElement } from 'react';

import { defineExtension } from '../../../experiments/contracts-spike/contracts/extension';
import { InsightsPage } from './insights-page';
import { IssueByStatus } from './issue-by-status';
import { requestRefresh } from './stats';

const icon = createElement(IconChartBar, { size: 16 });

function IssueByStatusRoute() {
  return createElement(IssueByStatus, { entity: 'issue' });
}

export default defineExtension({
  id: 'insights',
  name: 'Insights',
  routes: [
    { path: '/insights', element: InsightsPage, title: 'Insights' },
    { path: '/insights/issue-by-status', element: IssueByStatusRoute, title: 'Issues by status' },
  ],
  nav: [
    { section: 'Insights', label: 'Insights', path: '/insights', icon, order: 30 },
    { section: 'Backend/Settings', label: 'Insights', path: '/insights', icon, order: 30 },
  ],
  commands: [
    { id: 'insights.go', label: 'Go to insights', keys: 'g n', group: 'Insights', run: ({ navigate }) => navigate('/insights') },
    { id: 'insights.refresh', label: 'Refresh insights', group: 'Insights', run: () => requestRefresh() },
  ],
  views: [{ id: 'issue-by-status', entity: 'issue', label: 'By status', component: IssueByStatus }],
});

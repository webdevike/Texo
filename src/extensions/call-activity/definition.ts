import { defineTexoComponent } from '@texo/ui';

import { CallActivity, type CallActivityProps } from './component';

export const callActivity = defineTexoComponent<CallActivityProps>({
  component: CallActivity,
  defaultProps: {
    title: 'Call activity',
    subtitle: 'Every call, newest first',
    density: 'comfortable',
    showSummary: true,
    showQuickFilters: true,
    showSearch: true,
    showBranch: true,
    showAttempts: true,
    maxAttempts: 3,
    empty: false,
  },
  id: 'call-activity',
  name: 'Call Activity',
  properties: {
    title: { default: 'Call activity', label: 'Title', type: 'string' },
    subtitle: { default: 'Every call, newest first', label: 'Subtitle', type: 'string' },
    density: { default: 'comfortable', label: 'Density', options: ['comfortable', 'compact'], type: 'enum' },
    showSummary: { default: true, label: 'Show summary', type: 'boolean' },
    showQuickFilters: { default: true, label: 'Show quick filters', type: 'boolean' },
    showSearch: { default: true, label: 'Show search', type: 'boolean' },
    showBranch: { default: true, label: 'Show branch column', type: 'boolean' },
    showAttempts: { default: true, label: 'Show calls column', type: 'boolean' },
    maxAttempts: { default: 3, label: 'Max calls per customer', max: 6, min: 1, type: 'number' },
    empty: { default: false, label: 'Preview empty state', type: 'boolean' },
  },
});

import { defineTexoComponent } from '@texo/ui';

import { CustomerHealthCard, type CustomerHealthCardProps } from './component';

export const customerHealthCard = defineTexoComponent<CustomerHealthCardProps>({
  component: CustomerHealthCard,
  defaultProps: {
    accent: 'theme',
    actionLabel: 'View customer',
    company: 'GreenLeaf',
    icon: { name: 'activity', stroke: 1.75, variant: 'outline' },
    score: 91,
    showTrend: true,
    status: 'Healthy',
  },
  id: 'customer-health-card',
  name: 'Customer Health Card',
  properties: {
    accent: { default: 'theme', label: 'Accent', type: 'color' },
    actionLabel: { default: 'View customer', label: 'Action label', type: 'string' },
    company: { default: 'GreenLeaf', label: 'Company', type: 'string' },
    icon: {
      default: { name: 'activity', stroke: 1.75, variant: 'outline' },
      label: 'Icon',
      type: 'icon',
    },
    score: { default: 91, label: 'Health score', max: 100, min: 0, type: 'number' },
    showTrend: { default: true, label: 'Show trend', type: 'boolean' },
    status: { default: 'Healthy', label: 'Status', options: ['Healthy', 'At risk', 'Critical'], type: 'enum' },
  },
});

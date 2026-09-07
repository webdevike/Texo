import type { TexoComponentRegistry } from '@texo/ui';

import { customerHealthCard } from './customer-health-card/definition';
import { fieldListDemo } from './field-list/definition';

export const projectComponents = {
  [customerHealthCard.id]: customerHealthCard,
  [fieldListDemo.id]: fieldListDemo,
} satisfies TexoComponentRegistry;

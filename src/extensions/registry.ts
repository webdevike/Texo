import type { TexoComponentRegistry } from '@texo/ui';

import { customerHealthCard } from './customer-health-card/definition';

export const projectComponents = {
  [customerHealthCard.id]: customerHealthCard,
} satisfies TexoComponentRegistry;

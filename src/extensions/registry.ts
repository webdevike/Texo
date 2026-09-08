import type { TexoComponentRegistry } from '@texo/ui';

import { baseButton, baseStack, baseTextInput } from './base-components';
import { customerHealthCard } from './customer-health-card/definition';
import { fieldListDemo } from './field-list/definition';

export const projectComponents = {
  [customerHealthCard.id]: customerHealthCard,
  [fieldListDemo.id]: fieldListDemo,
} satisfies TexoComponentRegistry;

export const componentLibrary: TexoComponentRegistry = {
  [baseButton.id]: baseButton,
  [baseTextInput.id]: baseTextInput,
  [baseStack.id]: baseStack,
  ...projectComponents,
};

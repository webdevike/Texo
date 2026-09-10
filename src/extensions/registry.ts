import type { TexoComponentRegistry } from '@texo/ui';

import { baseButton, baseStack, baseTextInput } from './base-components';
import { callActivity } from './call-activity/definition';
import { chatComposerDemo } from './chat-composer/definition';
import { customerHealthCard } from './customer-health-card/definition';
import { fieldListDemo } from './field-list/definition';
import { markdownExample } from './markdown/definition';

export const projectComponents = {
  [callActivity.id]: callActivity,
  [chatComposerDemo.id]: chatComposerDemo,
  [customerHealthCard.id]: customerHealthCard,
  [fieldListDemo.id]: fieldListDemo,
  [markdownExample.id]: markdownExample,
} satisfies TexoComponentRegistry;

export const componentLibrary: TexoComponentRegistry = {
  [baseButton.id]: baseButton,
  [baseTextInput.id]: baseTextInput,
  [baseStack.id]: baseStack,
  ...projectComponents,
  ...(import.meta.env.DEV
    ? {
        [customerHealthCard.id]: {
          ...customerHealthCard,
          targets: { action: { label: 'Customer action', selector: 'button' } },
        },
      }
    : {}),
};

import { isTexoComponentDefinition, type TexoComponentRegistry } from '@texo/ui';
import { modules } from 'virtual:texo-project-components';

import { baseButton, baseStack, baseTextInput } from './base-components';
import { chatComposerDemo } from './chat-composer/definition';
import { customerHealthCard } from './customer-health-card/definition';
import { fieldListDemo } from './field-list/definition';
import { markdownExample } from './markdown/definition';

/** Examples shipped with Texo itself. */
const texoExamples = {
  [chatComposerDemo.id]: chatComposerDemo,
  [customerHealthCard.id]: customerHealthCard,
  [fieldListDemo.id]: fieldListDemo,
  [markdownExample.id]: markdownExample,
} satisfies TexoComponentRegistry;

/**
 * Definitions exported by the framed project's component modules (texo.json
 * `components`). Any export produced by `defineTexoComponent` counts; a
 * duplicate id from the project replaces the Texo example of the same name.
 */
const discovered: TexoComponentRegistry = {};
for (const { path, module } of modules) {
  for (const value of Object.values(module)) {
    if (!isTexoComponentDefinition(value)) continue;
    if (discovered[value.id]) console.warn(`Texo: component id "${value.id}" defined twice (${path}); keeping the first.`);
    else discovered[value.id] = value;
  }
}

export const projectComponents: TexoComponentRegistry = { ...texoExamples, ...discovered };

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

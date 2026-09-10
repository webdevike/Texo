import type { TexoThemeState } from '@texo/ui';

import { fields, identifier, object } from './canvas-document';

/**
 * texo.theme.json in the framed project: the theme the admin last saved,
 * in the shape `TexoThemeProvider` takes as `initial`. The project imports it
 * so the design decision ships with the app, while localStorage stays the live
 * channel between the admin and the frame during a session.
 */
export function validateThemeDocument(
  value: unknown,
): asserts value is TexoThemeState {
  object(value, 'texo.theme.json');
  fields(value, ['config', 'preset'], 'texo.theme.json');
  object(value.config, 'texo.theme.json config');
  identifier(value.preset, 'texo.theme.json preset');
}

export const themeFile = {
  endpoint: '/__texo/theme',
  label: 'texo.theme.json',
  validate: validateThemeDocument,
  optional: true,
};

import type { PropsWithChildren } from 'react';

import {
  MantineProvider,
  mergeThemeOverrides,
  type MantineProviderProps,
  type MantineThemeOverride,
} from './mantine';
import { theme } from './theme';

export type BaseProviderProps = PropsWithChildren<
  Omit<MantineProviderProps, 'children' | 'theme'> & {
    themeOverride?: MantineThemeOverride;
  }
>;

export function BaseProvider({
  children,
  themeOverride = {},
  ...props
}: BaseProviderProps) {
  return (
    <MantineProvider theme={mergeThemeOverrides(theme, themeOverride)} {...props}>
      {children}
    </MantineProvider>
  );
}

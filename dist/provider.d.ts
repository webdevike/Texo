import type { PropsWithChildren } from 'react';
import { type MantineProviderProps, type MantineThemeOverride } from './mantine';
export type BaseProviderProps = PropsWithChildren<Omit<MantineProviderProps, 'children' | 'theme'> & {
    themeOverride?: MantineThemeOverride;
}>;
export declare function BaseProvider({ children, themeOverride, ...props }: BaseProviderProps): import("react").JSX.Element;
//# sourceMappingURL=provider.d.ts.map
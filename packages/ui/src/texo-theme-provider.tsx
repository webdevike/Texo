import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  BaseCard,
  BaseCheckbox,
  BaseColorInput,
  BaseInputBase,
  BaseMenu,
  BaseSelect,
  BaseTextarea,
  BaseTextInput,
} from './components';
import componentClasses from './theme-components.module.css';
import { BaseProvider } from './provider';
import type {
  CSSVariablesResolver,
  MantineColorsTuple,
  MantineThemeOverride,
} from './mantine';

export const TEXO_SIZE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type TexoSize = (typeof TEXO_SIZE_KEYS)[number];
export type TexoColorScheme = 'light' | 'dark';

export interface TexoSemanticColors {
  body: string;
  card: string;
  border: string;
  dimmed: string;
  placeholder: string;
  input: string;
  muted: string;
  surface: string;
  popover: string;
  text: string;
}

export interface TexoSidebarConfig {
  activeIndicator: 'fill' | 'subtle' | 'text';
  collapsible: boolean;
  density: 'compact' | 'comfortable';
  hierarchy: 'flat' | 'tree';
  nestedIndent: 'tight' | 'default';
  sections: 'plain' | 'labeled' | 'collapsible';
  width: 'compact' | 'default' | 'wide';
}

export interface TexoTableConfig {
  borders: 'horizontal' | 'grid' | 'none';
  density: 'compact' | 'comfortable';
  header: 'plain' | 'muted' | 'primary';
  hover: boolean;
  stickyHeader: boolean;
  striped: boolean;
}

export interface TexoThemeConfig {
  autoContrast: boolean;
  chartColors: [string, string, string, string, string];
  colorScheme: TexoColorScheme;
  cursorType: 'default' | 'pointer';
  effects: {
    cardShadow: string;
    controlShadow: string;
  };
  defaultRadius: TexoSize;
  focusRing: 'auto' | 'always' | 'never';
  fontFamily: string;
  fontFamilyHeadings: string;
  fontFamilyMonospace: string;
  fontSizes: Record<TexoSize, string>;
  fontSmoothing: boolean;
  lineHeights: Record<TexoSize, string>;
  luminanceThreshold: number;
  primaryColor: string;
  primaryPalette: MantineColorsTuple;
  primaryShade: { dark: number; light: number };
  radius: Record<TexoSize, string>;
  respectReducedMotion: boolean;
  scale: number;
  semantic: Record<TexoColorScheme, TexoSemanticColors>;
  sidebar: TexoSidebarConfig;
  table: TexoTableConfig;
  shadows: Record<TexoSize, string>;
  spacing: Record<TexoSize, string>;
}

export interface TexoThemePreset {
  config: TexoThemeConfig;
  label: string;
  value: string;
}

const systemSans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const blue: MantineColorsTuple = [
  '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7',
  '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab',
];
const cyan: MantineColorsTuple = [
  '#e3fafc', '#c5f6fa', '#99e9f2', '#66d9e8', '#3bc9db',
  '#22b8cf', '#15aabf', '#1098ad', '#0c8599', '#0b7285',
];
const teal: MantineColorsTuple = [
  '#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9',
  '#20c997', '#12b886', '#0ca678', '#099268', '#087f5b',
];
const violet: MantineColorsTuple = [
  '#f3f0ff', '#e5dbff', '#d0bfff', '#b197fc', '#9775fa',
  '#845ef7', '#7950f2', '#7048e8', '#6741d9', '#5f3dc4',
];
const pink: MantineColorsTuple = [
  '#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f783ac',
  '#f06595', '#e64980', '#d6336c', '#c2255c', '#a61e4d',
];
const orange: MantineColorsTuple = [
  '#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d',
  '#ff922b', '#fd7e14', '#f76707', '#e8590c', '#d9480f',
];

const defaultConfig: TexoThemeConfig = {
  autoContrast: true,
  chartColors: ['#228be6', '#15aabf', '#7950f2', '#fd7e14', '#e64980'],
  colorScheme: 'light',
  cursorType: 'pointer',
  effects: {
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    controlShadow: 'none',
  },
  defaultRadius: 'md',
  focusRing: 'auto',
  fontFamily: systemSans,
  fontFamilyHeadings: systemSans,
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSizes: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
  fontSmoothing: true,
  lineHeights: { xs: '1.4', sm: '1.45', md: '1.55', lg: '1.6', xl: '1.65' },
  luminanceThreshold: 0.3,
  primaryColor: 'blue',
  primaryPalette: blue,
  primaryShade: { light: 6, dark: 8 },
  radius: { xs: '0.125rem', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' },
  respectReducedMotion: true,
  scale: 1,
  semantic: {
    light: {
      body: '#ffffff', border: '#dee2e6', card: '#ffffff',
      dimmed: '#868e96', input: '#ffffff', muted: '#f1f3f5',
      placeholder: '#adb5bd', popover: '#ffffff', surface: '#f8f9fa', text: '#212529',
    },
    dark: {
      body: '#1a1b1e', border: '#373a40', card: '#1a1b1e',
      dimmed: '#909296', input: '#25262b', muted: '#2c2e33',
      placeholder: '#5c5f66', popover: '#25262b', surface: '#25262b', text: '#c1c2c5',
    },
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.10)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 16px 40px rgba(0, 0, 0, 0.14)',
  },
  spacing: { xs: '0.625rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '2rem' },
  sidebar: {
    activeIndicator: 'subtle',
    collapsible: true,
    density: 'comfortable',
    hierarchy: 'flat',
    nestedIndent: 'default',
    sections: 'labeled',
    width: 'default',
  },
  table: {
    borders: 'horizontal',
    density: 'comfortable',
    header: 'muted',
    hover: true,
    stickyHeader: false,
    striped: false,
  },
};

function preset(value: string, label: string, overrides: Partial<TexoThemeConfig>): TexoThemePreset {
  return {
    value,
    label,
    config: {
      ...defaultConfig,
      ...overrides,
      primaryShade: { ...defaultConfig.primaryShade, ...overrides.primaryShade },
      semantic: {
        light: { ...defaultConfig.semantic.light, ...overrides.semantic?.light },
        dark: { ...defaultConfig.semantic.dark, ...overrides.semantic?.dark },
      },
    },
  };
}

export const TEXO_THEME_PRESETS: TexoThemePreset[] = [
  preset('default', 'Default', {}),
  preset('ocean', 'Ocean', {
    primaryColor: 'cyan',
    primaryPalette: cyan,
    defaultRadius: 'lg',
    semantic: {
      light: { ...defaultConfig.semantic.light, body: '#fafdff', surface: '#eef8fc' },
      dark: { ...defaultConfig.semantic.dark, body: '#102027', surface: '#142a33' },
    },
  }),
  preset('forest', 'Forest', {
    primaryColor: 'teal',
    primaryPalette: teal,
    defaultRadius: 'sm',
    semantic: {
      light: { ...defaultConfig.semantic.light, body: '#fbfdfb', surface: '#f0f7f2' },
      dark: { ...defaultConfig.semantic.dark, body: '#17201a', surface: '#1d2921' },
    },
  }),
  preset('violet', 'Violet', {
    primaryColor: 'violet',
    primaryPalette: violet,
    defaultRadius: 'xl',
    semantic: {
      light: { ...defaultConfig.semantic.light, body: '#fdfcff', surface: '#f5f1ff' },
      dark: { ...defaultConfig.semantic.dark, body: '#1d1925', surface: '#282132' },
    },
  }),
  preset('amber-minimal', 'Amber Minimal', {
    effects: {
      cardShadow: 'none',
      controlShadow: 'none',
    },
    primaryColor: 'orange',
    primaryPalette: orange,
    defaultRadius: 'xs',
    fontFamily: 'Inter, Arial, sans-serif',
    fontFamilyHeadings: 'Inter, Arial, sans-serif',
    radius: { xs: '0', sm: '0.125rem', md: '0.25rem', lg: '0.375rem', xl: '0.5rem' },
    shadows: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none' },
    spacing: { xs: '0.5rem', sm: '0.625rem', md: '0.875rem', lg: '1.125rem', xl: '1.75rem' },
  }),
  preset('bold-tech', 'Bold Tech', {
    primaryColor: 'violet',
    primaryPalette: violet,
    defaultRadius: 'sm',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontFamilyHeadings: 'Arial Black, Arial, sans-serif',
    fontSizes: { xs: '0.6875rem', sm: '0.8125rem', md: '0.9375rem', lg: '1.125rem', xl: '1.375rem' },
    radius: { xs: '0', sm: '0.2rem', md: '0.35rem', lg: '0.5rem', xl: '0.75rem' },
    shadows: {
      xs: '2px 2px 0 rgba(0, 0, 0, 0.9)',
      sm: '3px 3px 0 rgba(0, 0, 0, 0.9)',
      md: '5px 5px 0 rgba(0, 0, 0, 0.9)',
      lg: '7px 7px 0 rgba(0, 0, 0, 0.9)',
      xl: '10px 10px 0 rgba(0, 0, 0, 0.9)',
    },
    effects: {
      cardShadow: '5px 5px 0 rgba(0, 0, 0, 0.9)',
      controlShadow: '3px 3px 0 rgba(0, 0, 0, 0.9)',
    },
  }),
  preset('bubblegum', 'Bubblegum', {
    primaryColor: 'pink',
    primaryPalette: pink,
    defaultRadius: 'xl',
    fontFamily: 'Trebuchet MS, Arial, sans-serif',
    fontFamilyHeadings: 'Trebuchet MS, Arial, sans-serif',
    radius: { xs: '0.375rem', sm: '0.625rem', md: '0.875rem', lg: '1.25rem', xl: '2rem' },
    shadows: {
      xs: '0 1px 2px rgba(214, 51, 108, 0.08)',
      sm: '0 3px 8px rgba(214, 51, 108, 0.12)',
      md: '0 8px 20px rgba(214, 51, 108, 0.16)',
      lg: '0 14px 32px rgba(214, 51, 108, 0.18)',
      xl: '0 24px 48px rgba(214, 51, 108, 0.22)',
    },
    effects: {
      cardShadow: '0 8px 20px rgba(214, 51, 108, 0.16)',
      controlShadow: '4px 5px 0 rgba(214, 51, 108, 0.32)',
    },
    semantic: {
      light: {
        ...defaultConfig.semantic.light,
        body: '#f8e8f1',
        border: '#d63384',
        card: '#fff0cf',
        input: '#fff0cf',
        muted: '#b2e1eb',
        popover: '#fff8e7',
        surface: '#fff0f6',
        text: '#5b4b4b',
      },
      dark: {
        ...defaultConfig.semantic.dark,
        body: '#281d26',
        border: '#f06595',
        card: '#33252d',
        input: '#33252d',
        muted: '#21444b',
        popover: '#352530',
        surface: '#352530',
        text: '#fff0f6',
      },
    },
  }),
  preset('attio', 'Attio', {
    primaryColor: 'blue',
    primaryPalette: blue,
    defaultRadius: 'md',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyHeadings: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    radius: { xs: '0.1875rem', sm: '0.375rem', md: '0.625rem', lg: '0.875rem', xl: '1.25rem' },
    shadows: {
      xs: '0 1px 2px rgba(20, 23, 31, 0.04)',
      sm: '0 2px 8px rgba(20, 23, 31, 0.06)',
      md: '0 12px 32px rgba(20, 23, 31, 0.10)',
      lg: '0 20px 48px rgba(20, 23, 31, 0.12)',
      xl: '0 28px 64px rgba(20, 23, 31, 0.16)',
    },
    effects: {
      cardShadow: 'none',
      controlShadow: 'none',
    },
    sidebar: {
      activeIndicator: 'subtle',
      collapsible: true,
      density: 'compact',
      hierarchy: 'tree',
      nestedIndent: 'tight',
      sections: 'collapsible',
      width: 'compact',
    },
    table: {
      borders: 'grid',
      density: 'compact',
      header: 'plain',
      hover: true,
      stickyHeader: true,
      striped: false,
    },
    semantic: {
      light: {
        ...defaultConfig.semantic.light,
        body: '#ffffff',
        border: '#e6e7ea',
        card: '#ffffff',
        dimmed: '#92959d',
        input: '#ffffff',
        muted: '#f3f4f6',
        placeholder: '#a7aab1',
        popover: '#ffffff',
        surface: '#f7f7f8',
        text: '#202124',
      },
      dark: {
        ...defaultConfig.semantic.dark,
        body: '#17181b',
        border: '#34363c',
        card: '#202126',
        dimmed: '#9699a2',
        input: '#202126',
        muted: '#292b30',
        placeholder: '#6f727a',
        popover: '#24252a',
        surface: '#1d1e22',
        text: '#f1f2f4',
      },
    },
  }),
  preset('caffeine', 'Caffeine', {
    primaryColor: 'orange',
    primaryPalette: orange,
    defaultRadius: 'md',
    fontFamily: 'Georgia, serif',
    fontFamilyHeadings: 'Georgia, serif',
    radius: { xs: '0.125rem', sm: '0.25rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem' },
    shadows: {
      xs: '0 1px 2px rgba(71, 48, 35, 0.08)',
      sm: '0 2px 6px rgba(71, 48, 35, 0.10)',
      md: '0 6px 16px rgba(71, 48, 35, 0.12)',
      lg: '0 12px 28px rgba(71, 48, 35, 0.14)',
      xl: '0 20px 40px rgba(71, 48, 35, 0.18)',
    },
    effects: {
      cardShadow: '0 6px 16px rgba(71, 48, 35, 0.12)',
      controlShadow: '2px 3px 0 rgba(71, 48, 35, 0.18)',
    },
    semantic: {
      light: { ...defaultConfig.semantic.light, body: '#fffaf3', border: '#d8c3ad', surface: '#f4eadf', text: '#473023' },
      dark: { ...defaultConfig.semantic.dark, body: '#211914', border: '#6f5545', surface: '#2d211a', text: '#f5e7d8' },
    },
  }),
];

interface ThemeHistory {
  future: TexoThemeConfig[];
  past: TexoThemeConfig[];
  present: TexoThemeConfig;
  preset: string;
}

interface TexoThemeContextValue {
  applyPreset: (presetName: string) => void;
  canRedo: boolean;
  canUndo: boolean;
  config: TexoThemeConfig;
  preset: string;
  redo: () => void;
  undo: () => void;
  updateConfig: (update: (config: TexoThemeConfig) => TexoThemeConfig) => void;
}

const TexoThemeContext = createContext<TexoThemeContextValue | null>(null);

export interface TexoThemeProviderProps {
  children: ReactNode;
  /** Persisted state to start from. Absent = first preset. */
  initial?: { config: TexoThemeConfig; preset: string };
  /** Fires on every committed change (not the seed) so a host can persist it. */
  onChange?: (config: TexoThemeConfig, preset: string) => void;
}

export function TexoThemeProvider({ children, initial, onChange }: TexoThemeProviderProps) {
  const [history, setHistory] = useState<ThemeHistory>({
    future: [],
    past: [],
    present: initial?.config ?? TEXO_THEME_PRESETS[0].config,
    preset: initial?.preset ?? TEXO_THEME_PRESETS[0].value,
  });
  const seeded = useRef(true);
  useEffect(() => {
    if (seeded.current) {
      seeded.current = false;
      return;
    }
    onChange?.(history.present, history.preset);
  }, [history.present, history.preset]);

  const updateConfig = (update: (config: TexoThemeConfig) => TexoThemeConfig) => {
    setHistory((current) => ({
      future: [], past: [...current.past, current.present], present: update(current.present), preset: 'custom',
    }));
  };

  const applyPreset = (presetName: string) => {
    const selected = TEXO_THEME_PRESETS.find((item) => item.value === presetName);
    if (!selected) return;
    setHistory((current) => ({
      future: [], past: [...current.past, current.present], present: selected.config, preset: selected.value,
    }));
  };
  const undo = () => setHistory((current) => {
    const previous = current.past.at(-1);
    if (!previous) return current;
    return { future: [current.present, ...current.future], past: current.past.slice(0, -1), present: previous, preset: 'custom' };
  });

  const redo = () => setHistory((current) => {
    const next = current.future[0];
    if (!next) return current;
    return { future: current.future.slice(1), past: [...current.past, current.present], present: next, preset: 'custom' };
  });

  const themeOverride = useMemo<MantineThemeOverride>(() => ({
    autoContrast: history.present.autoContrast,
    colors: { [history.present.primaryColor]: history.present.primaryPalette },
    components: {
      Card: BaseCard.extend({ classNames: { root: componentClasses.card } }),
      Checkbox: BaseCheckbox.extend({ classNames: { input: componentClasses.checkboxInput } }),
      ColorInput: BaseColorInput.extend({ classNames: { input: componentClasses.input } }),
      InputBase: BaseInputBase.extend({ classNames: { input: componentClasses.input } }),
      Menu: BaseMenu.extend({ classNames: { dropdown: componentClasses.popover } }),
      Select: BaseSelect.extend({ classNames: { input: componentClasses.input } }),
      Textarea: BaseTextarea.extend({ classNames: { input: componentClasses.input } }),
      TextInput: BaseTextInput.extend({ classNames: { input: componentClasses.input } }),
    },
    cursorType: history.present.cursorType,
    defaultRadius: history.present.defaultRadius,
    focusRing: history.present.focusRing,
    fontFamily: history.present.fontFamily,
    fontFamilyMonospace: history.present.fontFamilyMonospace,
    fontSizes: history.present.fontSizes,
    fontSmoothing: history.present.fontSmoothing,
    headings: { fontFamily: history.present.fontFamilyHeadings },
    lineHeights: history.present.lineHeights,
    luminanceThreshold: history.present.luminanceThreshold,
    primaryColor: history.present.primaryColor,
    primaryShade: history.present.primaryShade,
    radius: history.present.radius,
    respectReducedMotion: history.present.respectReducedMotion,
    scale: history.present.scale,
    shadows: history.present.shadows,
    spacing: history.present.spacing,
  }), [history.present]);

  const cssVariablesResolver = useMemo<CSSVariablesResolver>(() => () => ({
    variables: {
      '--texo-sidebar-active-background': history.present.sidebar.activeIndicator === 'text'
        ? 'transparent'
        : history.present.sidebar.activeIndicator === 'fill'
          ? 'var(--mantine-primary-color-filled)'
          : 'var(--mantine-primary-color-light)',
      '--texo-sidebar-active-color': history.present.sidebar.activeIndicator === 'fill'
        ? 'var(--mantine-primary-color-contrast)'
        : 'var(--mantine-primary-color-light-color)',
      '--texo-sidebar-indent': history.present.sidebar.hierarchy === 'flat'
        ? '0px'
        : history.present.sidebar.nestedIndent === 'tight'
          ? '14px'
          : '24px',
      '--texo-sidebar-section-display': history.present.sidebar.sections === 'plain' ? 'none' : 'block',
      '--texo-sidebar-row-height': history.present.sidebar.density === 'compact' ? '28px' : '34px',
      '--texo-sidebar-width': history.present.sidebar.width === 'compact'
        ? '220px'
        : history.present.sidebar.width === 'wide'
          ? '300px'
          : '260px',
      '--texo-chart-1': history.present.chartColors[0],
      '--texo-chart-2': history.present.chartColors[1],
      '--texo-chart-3': history.present.chartColors[2],
      '--texo-chart-4': history.present.chartColors[3],
      '--texo-chart-5': history.present.chartColors[4],
      '--texo-table-border-style': history.present.table.borders,
      '--texo-table-header-background': history.present.table.header === 'primary'
        ? 'var(--mantine-primary-color-light)'
        : history.present.table.header === 'muted'
          ? 'var(--texo-color-muted)'
          : 'transparent',
      '--texo-table-row-height': history.present.table.density === 'compact' ? '36px' : '46px',
    },
    light: {
      '--mantine-color-body': history.present.semantic.light.body,
      '--mantine-color-default': history.present.semantic.light.body,
      '--mantine-color-default-border': history.present.semantic.light.border,
      '--mantine-color-dimmed': history.present.semantic.light.dimmed,
      '--mantine-color-placeholder': history.present.semantic.light.placeholder,
      '--mantine-color-text': history.present.semantic.light.text,
      '--texo-color-card': history.present.semantic.light.card,
      '--texo-color-input': history.present.semantic.light.input,
      '--texo-color-muted': history.present.semantic.light.muted,
      '--texo-color-popover': history.present.semantic.light.popover,
      '--texo-color-surface': history.present.semantic.light.surface,
      '--texo-card-shadow': history.present.effects.cardShadow,
      '--texo-control-shadow': history.present.effects.controlShadow,
    },
    dark: {
      '--mantine-color-body': history.present.semantic.dark.body,
      '--mantine-color-default-border': history.present.semantic.dark.border,
      '--mantine-color-dimmed': history.present.semantic.dark.dimmed,
      '--mantine-color-placeholder': history.present.semantic.dark.placeholder,
      '--mantine-color-text': history.present.semantic.dark.text,
      '--texo-color-card': history.present.semantic.dark.card,
      '--texo-color-input': history.present.semantic.dark.input,
      '--texo-color-muted': history.present.semantic.dark.muted,
      '--texo-color-popover': history.present.semantic.dark.popover,
      '--texo-color-surface': history.present.semantic.dark.surface,
      '--texo-control-shadow': history.present.effects.controlShadow,
      '--texo-card-shadow': history.present.effects.cardShadow,
    },
  }), [history.present]);

  const value = useMemo<TexoThemeContextValue>(() => ({
    applyPreset,
    canRedo: history.future.length > 0,
    canUndo: history.past.length > 0,
    config: history.present,
    preset: history.preset,
    redo,
    undo,
    updateConfig,
  }), [history]);

  return (
    <TexoThemeContext.Provider value={value}>
      <BaseProvider cssVariablesResolver={cssVariablesResolver} forceColorScheme={history.present.colorScheme} themeOverride={themeOverride}>
        {children}
      </BaseProvider>
    </TexoThemeContext.Provider>
  );
}

export function useTexoTheme() {
  const context = useContext(TexoThemeContext);
  if (!context) throw new Error('useTexoTheme must be used within TexoThemeProvider');
  return context;
}

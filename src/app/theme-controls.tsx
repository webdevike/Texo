import type { ReactNode } from 'react';

import {
  BaseAccordion,
  BaseCodeHighlight,
  BaseColorInput,
  BaseSelect,
  BaseStack,
  BaseSwitch,
  BaseText,
  BaseTextInput,
  TEXO_SIZE_KEYS,
  useTexoTheme,
  type TexoColorScheme,
  type TexoSize,
  type TexoThemeConfig,
} from '@texo/ui';

import classes from './theme-controls.module.css';

const colorOptions = [
  'blue',
  'cyan',
  'grape',
  'green',
  'indigo',
  'lime',
  'orange',
  'pink',
  'red',
  'teal',
  'violet',
  'yellow',
];

const fontOptions = [
  {
    label: 'System sans',
    value:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Monospace', value: 'ui-monospace, monospace' },
];

function ScaleEditor({
  label,
  onChange,
  values,
}: {
  label: string;
  onChange: (size: TexoSize, value: string) => void;
  values: Record<TexoSize, string>;
}) {
  return (
    <BaseStack gap="xs">
      <BaseText fw={500} size="sm">
        {label}
      </BaseText>
      {TEXO_SIZE_KEYS.map((size) => (
        <BaseTextInput
          key={size}
          label={size}
          value={values[size]}
          onChange={(event) => onChange(size, event.target.value)}
        />
      ))}
    </BaseStack>
  );
}

function updateScale(
  config: TexoThemeConfig,
  key: 'fontSizes' | 'lineHeights' | 'radius' | 'shadows' | 'spacing',
  size: TexoSize,
  value: string,
): TexoThemeConfig {
  return {
    ...config,
    [key]: { ...config[key], [size]: value },
  };
}

function ControlCategory({
  children,
  label,
  value,
}: {
  children: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <BaseAccordion
      variant="unstyled"
      styles={{
        chevron: {
          marginInlineEnd: 'calc(var(--mantine-spacing-xs) / 2)',
          minWidth: 12,
          width: 12,
        },
        control: {
          background: 'var(--texo-color-muted)',
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: 'var(--mantine-radius-default)',
          color: 'var(--mantine-color-text)',
          fontSize: 'var(--mantine-font-size-xs)',
          fontWeight: 600,
          minHeight: 26,
          padding: 'calc(var(--mantine-spacing-xs) / 5) var(--mantine-spacing-xs)',
          width: 'fit-content',
        },
        item: { border: 0 },
        label: { lineHeight: 1, padding: 0 },
        panel: { paddingBottom: 'var(--mantine-spacing-xs)' },
      }}
    >
      <BaseAccordion.Item value={value}>
        <BaseAccordion.Control>{label}</BaseAccordion.Control>
        <BaseAccordion.Panel>{children}</BaseAccordion.Panel>
      </BaseAccordion.Item>
    </BaseAccordion>
  );
}

const semanticCategories = [
  { label: 'CARD', value: 'card', keys: ['card'] },
  { label: 'POPOVER', value: 'popover', keys: ['popover'] },
  { label: 'MUTED', value: 'muted', keys: ['muted', 'dimmed'] },
  {
    label: 'BORDER & INPUT',
    value: 'border-input',
    keys: ['border', 'input', 'placeholder'],
  },
  { label: 'SIDEBAR', value: 'sidebar', keys: ['body', 'surface'] },
  { label: 'TEXT', value: 'text', keys: ['text'] },
] as const;

function SemanticCategories() {
  const { config, updateConfig } = useTexoTheme();

  const updateColor = (
    scheme: TexoColorScheme,
    key: keyof typeof config.semantic.light,
    value: string,
  ) => {
    updateConfig((current) => ({
      ...current,
      semantic: {
        ...current.semantic,
        [scheme]: { ...current.semantic[scheme], [key]: value },
      },
    }));
  };

  return (
    <BaseAccordion
      multiple
      variant="unstyled"
      styles={{
        chevron: {
          marginInlineEnd: 'calc(var(--mantine-spacing-xs) / 2)',
          minWidth: 12,
          width: 12,
        },
        control: {
          background: 'var(--texo-color-muted)',
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: 'var(--mantine-radius-default)',
          color: 'var(--mantine-color-text)',
          fontSize: 'var(--mantine-font-size-xs)',
          fontWeight: 600,
          minHeight: 26,
          padding: 'calc(var(--mantine-spacing-xs) / 5) var(--mantine-spacing-xs)',
          width: 'fit-content',
        },
        item: { border: 0, marginBottom: 'var(--mantine-spacing-xs)' },
        label: { lineHeight: 1, padding: 0 },
        panel: { paddingBottom: 'var(--mantine-spacing-xs)' },
      }}
    >
      {semanticCategories.map((category) => (
        <BaseAccordion.Item key={category.value} value={category.value}>
          <BaseAccordion.Control>{category.label}</BaseAccordion.Control>
          <BaseAccordion.Panel>
            <BaseStack gap="xs">
              {(['light', 'dark'] as const).flatMap((scheme) =>
                category.keys.map((key) => (
                  <BaseColorInput
                    key={`${scheme}-${key}`}
                    label={`${scheme === 'light' ? 'Light' : 'Dark'} ${key}`}
                    value={config.semantic[scheme][key]}
                    onChange={(value) => updateColor(scheme, key, value)}
                  />
                )),
              )}
            </BaseStack>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion>
  );
}

function ColorsControls() {
  const { config, updateConfig } = useTexoTheme();

  return (
    <BaseStack gap="xs">
      <ControlCategory label="PRIMARY" value="primary">
        <BaseStack gap="xs">
          <BaseSelect
            data={colorOptions}
            label="Primary color"
            value={config.primaryColor}
            onChange={(value) =>
              value &&
              updateConfig((current) => ({ ...current, primaryColor: value }))
            }
          />
          {config.primaryPalette.map((color, index) => (
            <BaseColorInput
              key={index}
              label={`Shade ${index}`}
              value={color}
              onChange={(value) =>
                updateConfig((current) => {
                  const primaryPalette = [...current.primaryPalette];
                  primaryPalette[index] = value;
                  return {
                    ...current,
                    primaryPalette:
                      primaryPalette as typeof current.primaryPalette,
                  };
                })
              }
            />
          ))}
          <BaseSelect
            data={Array.from({ length: 10 }, (_, value) => String(value))}
            label="Primary shade, light"
            value={String(config.primaryShade.light)}
            onChange={(value) =>
              value &&
              updateConfig((current) => ({
                ...current,
                primaryShade: {
                  ...current.primaryShade,
                  light: Number(value) as TexoThemeConfig['primaryShade']['light'],
                },
              }))
            }
          />
          <BaseSelect
            data={Array.from({ length: 10 }, (_, value) => String(value))}
            label="Primary shade, dark"
            value={String(config.primaryShade.dark)}
            onChange={(value) =>
              value &&
              updateConfig((current) => ({
                ...current,
                primaryShade: {
                  ...current.primaryShade,
                  dark: Number(value) as TexoThemeConfig['primaryShade']['dark'],
                },
              }))
            }
          />
        </BaseStack>
      </ControlCategory>

      <ControlCategory label="CHART" value="chart">
        <BaseStack gap="xs">
          {config.chartColors.map((color, index) => (
            <BaseColorInput
              key={index}
              label={`Chart ${index + 1}`}
              value={color}
              onChange={(value) => updateConfig((current) => {
                const chartColors = [...current.chartColors] as TexoThemeConfig['chartColors'];
                chartColors[index] = value;
                return { ...current, chartColors };
              })}
            />
          ))}
        </BaseStack>
      </ControlCategory>

      <ControlCategory label="CONTRAST" value="contrast">
        <BaseStack gap="xs">
          <BaseSwitch
            checked={config.autoContrast}
            label="Automatic contrast"
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                autoContrast: event.target.checked,
              }))
            }
          />
          <BaseTextInput
            label="Luminance threshold"
            type="number"
            value={config.luminanceThreshold}
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                luminanceThreshold: Number(event.target.value),
              }))
            }
          />
        </BaseStack>
      </ControlCategory>

      <SemanticCategories />
    </BaseStack>
  );
}
function TypographyControls() {
  const { config, updateConfig } = useTexoTheme();

  return (
    <BaseStack gap="xs">
      <ControlCategory label="FONT FAMILY" value="font-family">
        <BaseStack gap="xs">
          <BaseSelect
            data={fontOptions}
            label="Body font"
            searchable
            value={config.fontFamily}
            onChange={(value) =>
              value &&
              updateConfig((current) => ({ ...current, fontFamily: value }))
            }
          />
          <BaseSelect
            data={fontOptions}
            label="Heading font"
            searchable
            value={config.fontFamilyHeadings}
            onChange={(value) =>
              value &&
              updateConfig((current) => ({
                ...current,
                fontFamilyHeadings: value,
              }))
            }
          />
          <BaseTextInput
            label="Monospace font"
            value={config.fontFamilyMonospace}
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                fontFamilyMonospace: event.target.value,
              }))
            }
          />
        </BaseStack>
      </ControlCategory>

      <ControlCategory label="FONT SIZES" value="font-sizes">
        <ScaleEditor
          label="Font sizes"
          values={config.fontSizes}
          onChange={(size, value) =>
            updateConfig((current) =>
              updateScale(current, 'fontSizes', size, value),
            )
          }
        />
      </ControlCategory>

      <ControlCategory label="LINE HEIGHT" value="line-height">
        <ScaleEditor
          label="Line heights"
          values={config.lineHeights}
          onChange={(size, value) =>
            updateConfig((current) =>
              updateScale(current, 'lineHeights', size, value),
            )
          }
        />
      </ControlCategory>

      <ControlCategory label="RENDERING" value="rendering">
        <BaseSwitch
          checked={config.fontSmoothing}
          label="Font smoothing"
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              fontSmoothing: event.target.checked,
            }))
          }
        />
      </ControlCategory>
    </BaseStack>
  );
}

function OtherControls() {
  const { config, updateConfig } = useTexoTheme();

  return (
    <BaseStack gap="xs">
      <ControlCategory label="BORDER RADIUS" value="radius">
        <BaseStack gap="xs">
          <BaseSelect
            data={[...TEXO_SIZE_KEYS]}
            label="Default radius"
            value={config.defaultRadius}
            onChange={(value) =>
              value &&
              updateConfig((current) => ({
                ...current,
                defaultRadius: value as TexoSize,
              }))
            }
          />
          <ScaleEditor
            label="Radius scale"
            values={config.radius}
            onChange={(size, value) =>
              updateConfig((current) =>
                updateScale(current, 'radius', size, value),
              )
            }
          />
        </BaseStack>
      </ControlCategory>

      <ControlCategory label="SPACING" value="spacing">
        <ScaleEditor
          label="Spacing scale"
          values={config.spacing}
          onChange={(size, value) =>
            updateConfig((current) =>
              updateScale(current, 'spacing', size, value),
            )
          }
        />
      </ControlCategory>

      <ControlCategory label="SHADOWS" value="shadows">
        <BaseStack gap="xs">
          <ScaleEditor
            label="Shadow scale"
            values={config.shadows}
            onChange={(size, value) =>
              updateConfig((current) =>
                updateScale(current, 'shadows', size, value),
              )
            }
          />
          <BaseTextInput
            label="Card box shadow"
            value={config.effects.cardShadow}
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                effects: {
                  ...current.effects,
                  cardShadow: event.target.value,
                },
              }))
            }
          />
          <BaseTextInput
            label="Control box shadow"
            value={config.effects.controlShadow}
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                effects: {
                  ...current.effects,
                  controlShadow: event.target.value,
                },
              }))
            }
          />
        </BaseStack>
      </ControlCategory>

      <ControlCategory label="TABLE" value="table">
        <BaseStack gap="xs">
          <BaseSelect
            data={['compact', 'comfortable']}
            label="Density"
            value={config.table.density}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              table: { ...current.table, density: value as TexoThemeConfig['table']['density'] },
            }))}
          />
          <BaseSelect
            data={['horizontal', 'grid', 'none']}
            label="Borders"
            value={config.table.borders}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              table: { ...current.table, borders: value as TexoThemeConfig['table']['borders'] },
            }))}
          />
          <BaseSelect
            data={['plain', 'muted', 'primary']}
            label="Header"
            value={config.table.header}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              table: { ...current.table, header: value as TexoThemeConfig['table']['header'] },
            }))}
          />
          <BaseSwitch checked={config.table.hover} label="Row hover" onChange={(event) => {
            const checked = event.target.checked;
            updateConfig((current) => ({ ...current, table: { ...current.table, hover: checked } }));
          }} />
          <BaseSwitch checked={config.table.striped} label="Striped rows" onChange={(event) => {
            const checked = event.target.checked;
            updateConfig((current) => ({ ...current, table: { ...current.table, striped: checked } }));
          }} />
          <BaseSwitch checked={config.table.stickyHeader} label="Sticky header" onChange={(event) => {
            const checked = event.target.checked;
            updateConfig((current) => ({ ...current, table: { ...current.table, stickyHeader: checked } }));
          }} />
        </BaseStack>
      </ControlCategory>

      <ControlCategory label="SIDEBAR" value="sidebar">
        <BaseStack gap="xs">
          <BaseSelect
            data={['compact', 'default', 'wide']}
            label="Width"
            value={config.sidebar.width}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              sidebar: { ...current.sidebar, width: value as TexoThemeConfig['sidebar']['width'] },
            }))}
          />
          <BaseSelect
            data={['compact', 'comfortable']}
            label="Density"
            value={config.sidebar.density}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              sidebar: { ...current.sidebar, density: value as TexoThemeConfig['sidebar']['density'] },
            }))}
          />
          <BaseSelect
            data={['flat', 'tree']}
            label="Hierarchy"
            value={config.sidebar.hierarchy}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              sidebar: { ...current.sidebar, hierarchy: value as TexoThemeConfig['sidebar']['hierarchy'] },
            }))}
          />
          <BaseSelect
            data={['plain', 'labeled', 'collapsible']}
            label="Sections"
            value={config.sidebar.sections}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              sidebar: { ...current.sidebar, sections: value as TexoThemeConfig['sidebar']['sections'] },
            }))}
          />
          <BaseSelect
            data={['tight', 'default']}
            label="Nested indentation"
            value={config.sidebar.nestedIndent}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              sidebar: { ...current.sidebar, nestedIndent: value as TexoThemeConfig['sidebar']['nestedIndent'] },
            }))}
          />
          <BaseSelect
            data={['fill', 'subtle', 'text']}
            label="Active indicator"
            value={config.sidebar.activeIndicator}
            onChange={(value) => value && updateConfig((current) => ({
              ...current,
              sidebar: { ...current.sidebar, activeIndicator: value as TexoThemeConfig['sidebar']['activeIndicator'] },
            }))}
          />
          <BaseSwitch
            checked={config.sidebar.collapsible}
            label="Collapsible"
            onChange={(event) => updateConfig((current) => ({
              ...current,
              sidebar: { ...current.sidebar, collapsible: event.target.checked },
            }))}
          />
        </BaseStack>
      </ControlCategory>

      <ControlCategory label="BEHAVIOR" value="behavior">
        <BaseStack gap="xs">
          <BaseTextInput
            label="Scale"
            type="number"
            value={config.scale}
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                scale: Number(event.target.value),
              }))
            }
          />
          <BaseSelect
            data={['auto', 'always', 'never']}
            label="Focus ring"
            value={config.focusRing}
            onChange={(value) =>
              value &&
              updateConfig((current) => ({
                ...current,
                focusRing: value as TexoThemeConfig['focusRing'],
              }))
            }
          />
          <BaseSelect
            data={['default', 'pointer']}
            label="Interactive cursor"
            value={config.cursorType}
            onChange={(value) =>
              value &&
              updateConfig((current) => ({
                ...current,
                cursorType: value as TexoThemeConfig['cursorType'],
              }))
            }
          />
          <BaseSwitch
            checked={config.respectReducedMotion}
            label="Respect reduced motion"
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                respectReducedMotion: event.target.checked,
              }))
            }
          />
        </BaseStack>
      </ControlCategory>
    </BaseStack>
  );
}
function GenerateControls() {
  const { config } = useTexoTheme();
  const theme = {
    autoContrast: config.autoContrast,
    cursorType: config.cursorType,
    defaultRadius: config.defaultRadius,
    focusRing: config.focusRing,
    colors: { [config.primaryColor]: config.primaryPalette },
    fontFamily: config.fontFamily,
    fontFamilyMonospace: config.fontFamilyMonospace,
    fontSizes: config.fontSizes,
    fontSmoothing: config.fontSmoothing,
    headings: { fontFamily: config.fontFamilyHeadings },
    lineHeights: config.lineHeights,
    luminanceThreshold: config.luminanceThreshold,
    primaryColor: config.primaryColor,
    primaryShade: config.primaryShade,
    radius: config.radius,
    respectReducedMotion: config.respectReducedMotion,
    scale: config.scale,
    shadows: config.shadows,
    spacing: config.spacing,
  };
  const code = `export const theme = createTheme(${JSON.stringify(theme, null, 2)});

export const cssVariablesResolver = () => (${JSON.stringify(
    {
      variables: {},
      light: {
        '--mantine-color-body': config.semantic.light.body,
        '--mantine-color-default': config.semantic.light.body,
        '--mantine-color-default-border': config.semantic.light.border,
        '--mantine-color-dimmed': config.semantic.light.dimmed,
        '--mantine-color-placeholder': config.semantic.light.placeholder,
        '--mantine-color-text': config.semantic.light.text,
        '--texo-color-card': config.semantic.light.card,
        '--texo-color-input': config.semantic.light.input,
        '--texo-color-muted': config.semantic.light.muted,
        '--texo-color-popover': config.semantic.light.popover,
        '--texo-card-shadow': config.effects.cardShadow,
        '--texo-control-shadow': config.effects.controlShadow,
        '--texo-color-surface': config.semantic.light.surface,
      },
      dark: {
        '--mantine-color-body': config.semantic.dark.body,
        '--mantine-color-default': config.semantic.dark.body,
        '--mantine-color-default-border': config.semantic.dark.border,
        '--mantine-color-dimmed': config.semantic.dark.dimmed,
        '--mantine-color-placeholder': config.semantic.dark.placeholder,
        '--mantine-color-text': config.semantic.dark.text,
        '--texo-color-card': config.semantic.dark.card,
        '--texo-color-input': config.semantic.dark.input,
        '--texo-color-muted': config.semantic.dark.muted,
        '--texo-color-popover': config.semantic.dark.popover,
        '--texo-card-shadow': config.effects.cardShadow,
        '--texo-control-shadow': config.effects.controlShadow,
        '--texo-color-surface': config.semantic.dark.surface,
      },
    },
    null,
    2,
  )});`;

  return <BaseCodeHighlight code={code} language="tsx" />;
}

export function ThemeControls({ tab }: { tab: string | null }) {
  return (
    <BaseStack className={classes.properties}>
      <BaseTextInput placeholder="Search properties..." />
      {tab === 'colors' && <ColorsControls />}
      {tab === 'typography' && <TypographyControls />}
      {tab === 'other' && <OtherControls />}
      {tab === 'generate' && <GenerateControls />}
    </BaseStack>
  );
}

import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCode,
  IconCheck,
  IconChevronDown,
  IconDotsVertical,
  IconLayoutGrid,
  IconComponents,
  IconMoon,
  IconPalette,
  IconSun,
} from '@tabler/icons-react';
import * as BaseComponents from '@texo/ui';
import {
  createElement,
  useEffect,
  useState,
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import {
  Navigate,
  NavLink as RouterNavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AttioDashboardPage } from './attio-dashboard-page';
import { CardsPage } from './cards-page';
import { DashboardPage } from './dashboard-page';
import { CustomComponentsPage } from './custom-components-page';
import { CanvasLibrary, CanvasPage, CanvasProvider } from './canvas-entry';
import { ThemeControls } from './theme-controls';
import { componentLibrary, projectComponents } from '../extensions/registry';

const {
  BaseAccordion,
  BaseActionIcon,
  BaseAppShell,
  BaseBox,
  BaseButton,
  BaseCard,
  BaseCheckbox,
  BaseCombobox,
  BaseCenter,
  BaseColorInput,
  BaseCodeHighlight,
  BaseDrawer,
  BaseInputBase,
  BaseGroup,
  BaseMenu,
  BaseNavLink,
  BaseSelect,
  BaseScrollArea,
  BaseScroller,
  BaseStack,
  BaseSwitch,
  BaseTabs,
  BaseText,
  BaseTextInput,
  BaseTextarea,
  BaseTitle,
  BaseTooltip,
  BaseTree,
} = BaseComponents;
const {
  TEXO_THEME_PRESETS,
  TexoAppShell,
  TexoPanel,
  TexoThemePicker,
  useTexoTheme,
} = BaseComponents;

function formatComponentName(name: string) {
  return name.replace(/^Base/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
}

function componentPath(name: string) {
  const slug = formatComponentName(name).toLowerCase().replaceAll(' ', '-');
  return `/${slug}s`;
}

const componentNavigationItems = Object.entries(BaseComponents)
  .filter(([name]) => name.startsWith('Base') && name !== 'BaseProvider')
  .map(([name, component]) => ({
    component,
    label: formatComponentName(name),
    name,
    path: componentPath(name),
  }));

const navigationItems = [
  { component: null, label: 'Theme', name: 'Theme', path: '/theme' },
  { component: null, label: 'Canvas', name: 'Canvas', path: '/canvas' },
  { component: null, label: 'Dashboard', name: 'Dashboard', path: '/dashboard' },
  { component: null, label: 'Custom', name: 'Custom', path: '/custom' },
  ...componentNavigationItems,
];

const treeData = [
  {
    value: 'src',
    label: 'src',
    children: [{ value: 'src/app', label: 'app' }],
  },
];

function previewCode(name: string) {
  const examples: Record<string, string> = {
    BaseAccordion:
      '<BaseAccordion><BaseAccordion.Item value="item"><BaseAccordion.Control>Section</BaseAccordion.Control></BaseAccordion.Item></BaseAccordion>',
    BaseActionIcon: '<BaseActionIcon aria-label="Action">A</BaseActionIcon>',
    BaseAppShell:
      '<BaseAppShell>\\n  <BaseAppShell.Section>App Shell section</BaseAppShell.Section>\\n</BaseAppShell>',
    BaseBox: '<BaseBox>Box</BaseBox>',
    BaseButton: '<BaseButton size="md">Button</BaseButton>',
    BaseCheckbox: '<BaseCheckbox label="Checkbox" />',
    BaseCard: '<BaseCard>Card</BaseCard>',
    BaseCenter: '<BaseCenter>Centered content</BaseCenter>',
    BaseCodeHighlight:
      '<BaseCodeHighlight code="const answer = 42;" language="tsx" />',
    BaseColorInput: '<BaseColorInput label="Color" value="#228be6" />',
    BaseCombobox: '<BaseCombobox store={combobox}>...</BaseCombobox>',
    BaseDrawer: '<BaseDrawer opened={false} onClose={() => {}} />',
    BaseGroup:
      '<BaseGroup>\\n  <BaseText>First</BaseText>\\n  <BaseText>Second</BaseText>\\n</BaseGroup>',
    BaseInputBase: '<BaseInputBase placeholder="Input base" />',
    BaseMenu:
      '<BaseMenu>\\n  <BaseMenu.Target><BaseButton>Menu</BaseButton></BaseMenu.Target>\\n  <BaseMenu.Dropdown />\\n</BaseMenu>',
    BaseNavLink: '<BaseNavLink label="Navigation link" />',
    BaseScrollArea:
      '<BaseScrollArea h={80}><BaseText>Scrollable content</BaseText></BaseScrollArea>',
    BaseSelect: '<BaseSelect label="Option" data={["First", "Second"]} />',
    BaseStack:
      '<BaseStack>\\n  <BaseText>First</BaseText>\\n  <BaseText>Second</BaseText>\\n</BaseStack>',
    BaseSwitch: '<BaseSwitch label="Enabled" />',
    BaseTabs:
      '<BaseTabs defaultValue="first"><BaseTabs.List><BaseTabs.Tab value="first">First</BaseTabs.Tab></BaseTabs.List></BaseTabs>',
    BaseText: '<BaseText>Text</BaseText>',
    BaseTextarea: '<BaseTextarea label="Notes" />',
    BaseTextInput:
      '<BaseTextInput label="Name" placeholder="Enter your name" />',
    BaseTitle: '<BaseTitle order={1}>Title</BaseTitle>',
    BaseTooltip:
      '<BaseTooltip label="Tooltip"><BaseButton>Hover me</BaseButton></BaseTooltip>',
    BaseTree: '<BaseTree data={treeData} />',
  };

  return examples[name] ?? `<${name} />`;
}

function ComboboxPreview() {
  const combobox = BaseComponents.useBaseCombobox();

  return (
    <BaseCombobox store={combobox}>
      <BaseCombobox.Target>
        <BaseInputBase placeholder="Combobox" />
      </BaseCombobox.Target>
      <BaseCombobox.Dropdown>
        <BaseCombobox.Options>
          <BaseCombobox.Option value="option">Option</BaseCombobox.Option>
        </BaseCombobox.Options>
      </BaseCombobox.Dropdown>
    </BaseCombobox>
  );
}

function ComponentPreview({
  component,
  name,
}: {
  component: unknown;
  name: string;
}) {
  switch (name) {
    case 'BaseAccordion':
      return (
        <BaseAccordion>
          <BaseAccordion.Item value="item">
            <BaseAccordion.Control>Section</BaseAccordion.Control>
          </BaseAccordion.Item>
        </BaseAccordion>
      );
    case 'BaseActionIcon':
      return <BaseActionIcon aria-label="Action">A</BaseActionIcon>;
    case 'BaseAppShell':
      return (
        <BaseAppShell>
          <BaseAppShell.Section>App Shell section</BaseAppShell.Section>
        </BaseAppShell>
      );
    case 'BaseBox':
      return <BaseBox>Box</BaseBox>;
    case 'BaseButton':
      return <BaseButton size="md">Button</BaseButton>;
    case 'BaseCheckbox':
      return <BaseCheckbox label="Checkbox" />;
    case 'BaseCard':
      return <BaseCard>Card</BaseCard>;
    case 'BaseCenter':
      return <BaseCenter>Centered content</BaseCenter>;
    case 'BaseCodeHighlight':
      return <BaseCodeHighlight code="const answer = 42;" language="tsx" />;
    case 'BaseColorInput':
      return <BaseColorInput label="Color" value="#228be6" />;
    case 'BaseCombobox':
      return <ComboboxPreview />;
    case 'BaseDrawer':
      return <BaseDrawer opened={false} onClose={() => undefined} />;
    case 'BaseGroup':
      return (
        <BaseGroup>
          <BaseText>First</BaseText>
          <BaseText>Second</BaseText>
        </BaseGroup>
      );
    case 'BaseInputBase':
      return <BaseInputBase placeholder="Input base" />;
    case 'BaseMenu':
      return (
        <BaseMenu>
          <BaseMenu.Target>
            <BaseButton>Menu</BaseButton>
          </BaseMenu.Target>
          <BaseMenu.Dropdown />
        </BaseMenu>
      );
    case 'BaseNavLink':
      return <BaseNavLink label="Navigation link" />;
    case 'BaseScrollArea':
      return (
        <BaseScrollArea h={80}>
          <BaseText>Scrollable content</BaseText>
        </BaseScrollArea>
      );
    case 'BaseScroller':
      return (
        <BaseScroller>
          <BaseGroup wrap="nowrap">
            <BaseText>Scrollable</BaseText>
            <BaseText>content</BaseText>
          </BaseGroup>
        </BaseScroller>
      );
    case 'BaseSelect':
      return <BaseSelect label="Option" data={['First', 'Second']} />;
    case 'BaseStack':
      return (
        <BaseStack>
          <BaseText>First</BaseText>
          <BaseText>Second</BaseText>
        </BaseStack>
      );
    case 'BaseSwitch':
      return <BaseSwitch label="Enabled" />;
    case 'BaseTabs':
      return (
        <BaseTabs defaultValue="first">
          <BaseTabs.List>
            <BaseTabs.Tab value="first">First</BaseTabs.Tab>
          </BaseTabs.List>
        </BaseTabs>
      );
    case 'BaseText':
      return <BaseText>Text</BaseText>;
    case 'BaseTextarea':
      return <BaseTextarea label="Notes" />;
    case 'BaseTextInput':
      return <BaseTextInput label="Name" placeholder="Enter your name" />;
    case 'BaseTitle':
      return <BaseTitle order={1}>Title</BaseTitle>;
    case 'BaseTooltip':
      return (
        <BaseTooltip label="Tooltip">
          <BaseButton>Hover me</BaseButton>
        </BaseTooltip>
      );
    case 'BaseTree':
      return <BaseTree data={treeData} />;
    default: {
      // Input-like aliases render a void <input>; children would crash React.
      const inputLike = /Input|Select|Textarea|Checkbox|Switch|Slider|Radio|Picker|Rating|Combobox/.test(name);
      if (inputLike) {
        return createElement(component as ComponentType<{ label?: string; placeholder?: string }>, {
          label: formatComponentName(name),
          placeholder: formatComponentName(name),
        });
      }
      return createElement(
        component as ComponentType<PropsWithChildren>,
        null,
        formatComponentName(name),
      );
    }
  }
}

function ComponentPage({
  component,
  name,
}: {
  component: unknown;
  name: string;
}) {
  return <ComponentPreview component={component} name={name} />;
}

function ThemePage() {
  return (
    <BaseStack gap="xl">
      {componentNavigationItems.map((item) => (
        <BaseStack gap="xs" key={item.name}>
          <BaseTitle order={2}>{item.label}</BaseTitle>
          <ComponentPreview component={item.component} name={item.name} />
        </BaseStack>
      ))}
    </BaseStack>
  );
}

export function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [panelEnabled, setPanelEnabled] = useState(false);
  const [propertyTab, setPropertyTab] = useState<string | null>('colors');
  const [activeRail, setActiveRail] = useState<string | null>(
    pathname === '/canvas' ? 'library' : 'theme',
  );
  useEffect(() => {
    if (pathname === '/canvas') setActiveRail('library');
  }, [pathname]);
  const {
    applyPreset,
    canRedo,
    canUndo,
    config,
    preset,
    redo,
    undo,
    updateConfig,
  } = useTexoTheme();

  const selectedItem =
    navigationItems.find((item) => item.path === pathname) ??
    componentNavigationItems.find((item) => item.path === '/buttons');
  const visiblePreviews = navigationItems.filter((item) =>
    ['/theme', '/canvas', '/dashboard', '/custom', '/buttons', '/cards', '/text-inputs'].includes(item.path),
  );
  const hiddenPreviews = navigationItems.filter(
    (item) => !visiblePreviews.includes(item),
  );

  const compactPillTabs = {
    tab: {
      borderRadius: 'var(--mantine-radius-xl)',
      fontSize: 'var(--mantine-font-size-xs)',
      padding: '4px 10px',
      whiteSpace: 'nowrap',
    },
  };

  const pillScrollerStyles = {
    content: {
      gap: 4,
    },
  };

  const themeSettings = <ThemeControls tab={propertyTab} />;


  const themePickerOptions = [
    ...(preset === 'custom'
      ? [{ config, label: 'Custom', value: 'custom' }]
      : []),
    ...TEXO_THEME_PRESETS,
  ];

  const themePicker = (
    <TexoThemePicker
      onChange={(value) => value !== 'custom' && applyPreset(value)}
      options={themePickerOptions}
      value={preset}
    />
  );

  const actions = (
    <BaseGroup gap="xs">
      <BaseActionIcon
        aria-label="Toggle color scheme"
        variant="subtle"
        onClick={() =>
          updateConfig((current) => ({
            ...current,
            colorScheme: current.colorScheme === 'light' ? 'dark' : 'light',
          }))
        }
      >
        {config.colorScheme === 'light' ? (
          <IconSun size={16} />
        ) : (
          <IconMoon size={16} />
        )}
      </BaseActionIcon>
      <BaseActionIcon
        aria-label="Undo theme"
        disabled={!canUndo}
        variant="subtle"
        onClick={undo}
      >
        <IconArrowBackUp size={16} />
      </BaseActionIcon>
      <BaseActionIcon
        aria-label="Redo theme"
        disabled={!canRedo}
        variant="subtle"
        onClick={redo}
      >
        <IconArrowForwardUp size={16} />
      </BaseActionIcon>
      <BaseActionIcon
        aria-label="Toggle panel"
        disabled={pathname === '/canvas'}
        variant={panelEnabled ? 'light' : 'subtle'}
        onClick={() => setPanelEnabled((current) => !current)}
      >
        <IconCode size={16} />
      </BaseActionIcon>
    </BaseGroup>
  );

  const inspectorTabs = (
    <BaseTabs
      value={propertyTab}
      onChange={setPropertyTab}
      styles={compactPillTabs}
      variant="pills"
    >
      <BaseTabs.List>
        <BaseScroller controlSize="xs" styles={pillScrollerStyles}>
          <BaseTabs.Tab value="colors">Colors</BaseTabs.Tab>
          <BaseTabs.Tab value="typography">Typography</BaseTabs.Tab>
          <BaseTabs.Tab value="other">Other</BaseTabs.Tab>
          <BaseTabs.Tab value="generate">Generate</BaseTabs.Tab>
        </BaseScroller>
      </BaseTabs.List>
    </BaseTabs>
  );

  const previewTabs = (
    <>
      <BaseTabs
        value={pathname}
        onChange={(value) => value && navigate(value)}
        styles={compactPillTabs}
        variant="pills"
      >
        <BaseTabs.List>
          <BaseScroller controlSize="xs" styles={pillScrollerStyles}>
            {visiblePreviews.map((item) =>
              item.path === '/dashboard' ? (
                <BaseMenu key={item.path} position="bottom-start">
                  <BaseMenu.Target>
                    <BaseButton
                      rightSection={<IconChevronDown size={12} />}
                      size="compact-xs"
                      variant={pathname.startsWith('/dashboard') ? 'light' : 'subtle'}
                    >
                      Dashboard
                    </BaseButton>
                  </BaseMenu.Target>
                  <BaseMenu.Dropdown>
                    <BaseMenu.Item
                      leftSection={pathname === '/dashboard' ? <IconCheck size={14} /> : undefined}
                      onClick={() => navigate('/dashboard')}
                    >
                      Default
                    </BaseMenu.Item>
                    <BaseMenu.Item
                      leftSection={pathname === '/dashboard/attio' ? <IconCheck size={14} /> : undefined}
                      onClick={() => {
                        applyPreset('attio');
                        navigate('/dashboard/attio');
                      }}
                    >
                      Attio
                    </BaseMenu.Item>
                  </BaseMenu.Dropdown>
                </BaseMenu>
              ) : item.path === '/custom' ? (
                <BaseMenu key={item.path} position="bottom-start">
                  <BaseMenu.Target>
                    <BaseButton
                      rightSection={<IconChevronDown size={12} />}
                      size="compact-xs"
                      variant={pathname.startsWith('/custom') ? 'light' : 'subtle'}
                    >
                      Custom
                    </BaseButton>
                  </BaseMenu.Target>
                  <BaseMenu.Dropdown>
                    <BaseMenu.Item
                      leftSection={pathname === '/custom' ? <IconCheck size={14} /> : undefined}
                      onClick={() => navigate('/custom')}
                    >
                      All
                    </BaseMenu.Item>
                    {Object.values(projectComponents).map((component) => (
                      <BaseMenu.Item
                        key={component.id}
                        leftSection={pathname === `/custom/${component.id}` ? <IconCheck size={14} /> : undefined}
                        onClick={() => navigate(`/custom/${component.id}`)}
                      >
                        {component.name}
                      </BaseMenu.Item>
                    ))}
                  </BaseMenu.Dropdown>
                </BaseMenu>
              ) : (
                <BaseTabs.Tab key={item.path} value={item.path}>
                  {item.label}
                </BaseTabs.Tab>
              ),
            )}
          </BaseScroller>
        </BaseTabs.List>
      </BaseTabs>

      <BaseMenu position="bottom-end">
        <BaseMenu.Target>
          <BaseActionIcon aria-label="More previews" variant="subtle">
            <IconDotsVertical size={16} />
          </BaseActionIcon>
        </BaseMenu.Target>
        <BaseMenu.Dropdown>
          {hiddenPreviews.map((item) => (
            <BaseMenu.Item key={item.path} onClick={() => navigate(item.path)}>
              {item.label}
            </BaseMenu.Item>
          ))}
        </BaseMenu.Dropdown>
      </BaseMenu>
    </>
  );

  const pagesList = (
    <BaseStack gap={2}>
      {navigationItems.map((item) => (
        <BaseNavLink
          active={pathname === item.path}
          key={item.path}
          label={item.label}
          onClick={() => navigate(item.path)}
        />
      ))}
    </BaseStack>
  );

  const rail = [
    {
      body: <CanvasLibrary />,
      header: <BaseText fw={600} px="sm" size="sm">Components</BaseText>,
      icon: <IconComponents size={18} />,
      id: 'library',
      label: 'Components',
      subheader: <BaseText c="dimmed" size="xs">Drag or add to canvas</BaseText>,
    },
    {
      body: themeSettings,
      header: themePicker,
      icon: <IconPalette size={18} />,
      id: 'theme',
      label: 'Theme',
      subheader: inspectorTabs,
    },
    {
      body: pagesList,
      header: (
        <BaseText fw={600} px="sm" size="sm">
          Pages
        </BaseText>
      ),
      icon: <IconLayoutGrid size={18} />,
      id: 'pages',
      label: 'Pages',
    },
  ];

  return (
    <CanvasProvider registry={componentLibrary}>
    <TexoAppShell
      actions={actions}
      activeRail={activeRail}
      onRailChange={(id) => {
        setActiveRail(id);
        if (id === 'library' && pathname !== '/canvas') navigate('/canvas');
      }}
      previewTabs={previewTabs}
      rail={rail}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/theme" replace />} />
        <Route path="/theme" element={<ThemePage />} />
        <Route path="/canvas" element={<CanvasPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/attio" element={<AttioDashboardPage />} />
        <Route path="/custom" element={<CustomComponentsPage />} />
        <Route path="/custom/:componentId" element={<CustomComponentsPage />} />
        {componentNavigationItems
          .filter((item) => item.path !== '/cards')
          .map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={
                <ComponentPage component={item.component} name={item.name} />
              }
            />
          ))}
        <Route path="*" element={<Navigate to="/theme" replace />} />
      </Routes>

      <TexoPanel
        gutter={0}
        onClose={() => setPanelEnabled(false)}
        opened={panelEnabled && pathname !== '/canvas'}
        title={`${selectedItem?.label ?? 'Component'} code`}
      >
        <BaseCodeHighlight
          code={previewCode(selectedItem?.name ?? 'BaseButton')}
          language="tsx"
        />
      </TexoPanel>
    </TexoAppShell>
    </CanvasProvider>
  );
}

export default App;

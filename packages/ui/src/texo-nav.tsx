import type { ReactNode } from 'react';

import { BaseNavLink, BaseStack, BaseText } from './components';
import { useTexoTheme } from './texo-theme-provider';

/**
 * Sidebar primitives that honor `config.sidebar` from the theme configurator:
 * row height (density), active indicator, section rendering (plain / labeled /
 * collapsible) and nested indent (hierarchy). Every Texo side panel builds on these
 * so the configurator drives the app's own chrome, not just the previews.
 */

export interface TexoNavItemProps {
  active?: boolean;
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}

export function TexoNavItem({ active, icon, label, onClick, href }: TexoNavItemProps) {
  return (
    <BaseNavLink
      active={active}
      component={href ? 'a' : 'button'}
      href={href}
      label={label}
      leftSection={icon}
      onClick={onClick}
      styles={{
        root: {
          height: 'var(--texo-sidebar-row-height)',
          minHeight: 'var(--texo-sidebar-row-height)',
          paddingBlock: 0,
          borderRadius: 'var(--mantine-radius-sm)',
          ...(active
            ? {
                background: 'var(--texo-sidebar-active-background)',
                color: 'var(--texo-sidebar-active-color)',
              }
            : {}),
        },
      }}
      variant="subtle"
    />
  );
}

export interface TexoNavSectionProps {
  children: ReactNode;
  label: string;
  /** Collapsed on first render when the section is collapsible. */
  defaultCollapsed?: boolean;
}

export function TexoNavSection({ children, label, defaultCollapsed = false }: TexoNavSectionProps) {
  const { config } = useTexoTheme();
  const { hierarchy, sections } = config.sidebar;

  if (sections === 'collapsible') {
    return (
      <BaseNavLink
        childrenOffset={hierarchy === 'tree' ? 'var(--texo-sidebar-indent)' : 0}
        defaultOpened={!defaultCollapsed}
        label={label}
        styles={{
          root: {
            height: 'var(--texo-sidebar-row-height)',
            minHeight: 'var(--texo-sidebar-row-height)',
            paddingBlock: 0,
          },
          label: {
            fontSize: 'calc(var(--mantine-font-size-xs) * 0.875)',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--mantine-color-dimmed)',
          },
        }}
        variant="subtle"
      >
        <BaseStack gap={2}>{children}</BaseStack>
      </BaseNavLink>
    );
  }

  return (
    <BaseStack gap={2}>
      <BaseText
        c="dimmed"
        fw={600}
        px="sm"
        style={{
          display: 'var(--texo-sidebar-section-display)',
          fontSize: 'calc(var(--mantine-font-size-xs) * 0.875)',
          marginTop: 'var(--mantine-spacing-sm)',
        }}
        tt="uppercase"
      >
        {label}
      </BaseText>
      <BaseStack gap={2} pl={hierarchy === 'tree' ? 'var(--texo-sidebar-indent)' : 0}>
        {children}
      </BaseStack>
    </BaseStack>
  );
}

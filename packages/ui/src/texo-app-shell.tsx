import type { CSSProperties, ReactNode } from 'react';

import { BaseBox } from './components';
import classes from './texo-app-shell.module.css';

const SIDEBAR_WIDTH = 240;

export interface TexoAppShellProps {
  /** Right-aligned 56px row at the top of the workspace card. */
  actions: ReactNode;
  children: ReactNode;
  /** Optional strip under the workspace card, right-aligned (agent dock). */
  footer?: ReactNode;
  /** 48px row under the actions: preview tabs or a page toolbar. */
  previewTabs: ReactNode;
  /** Single navigation column on the shell surface. */
  sidebar: ReactNode;
}

/** Linear-style shell: one sidebar on a quiet surface, the workspace as an inset card. */
export function TexoAppShell({
  actions,
  children,
  footer,
  previewTabs,
  sidebar,
}: TexoAppShellProps) {
  const variables = {
    '--texo-sidebar-width': `${SIDEBAR_WIDTH}px`,
  } as CSSProperties;

  return (
    <BaseBox className={classes.root} style={variables}>
      <BaseBox component="nav" aria-label="Sidebar" className={classes.sidebar}>
        {sidebar}
      </BaseBox>

      <BaseBox className={classes.workspace}>
        <BaseBox className={classes.actions}>{actions}</BaseBox>
        <BaseBox className={classes.previewTabs}>{previewTabs}</BaseBox>
        <BaseBox component="main" className={classes.canvas}>
          {children}
        </BaseBox>
      </BaseBox>
      {footer ? <BaseBox className={classes.footer}>{footer}</BaseBox> : null}
    </BaseBox>
  );
}

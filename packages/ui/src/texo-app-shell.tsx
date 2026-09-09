import {
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import { BaseActionIcon, BaseBox, BaseTooltip } from './components';
import classes from './texo-app-shell.module.css';

const RAIL_WIDTH = 48;

export interface TexoRailItem {
  /** Rail body: scrollable content of the panel this icon opens. */
  body: ReactNode;
  /** Optional 56px header row, aligned with the workspace actions row. */
  header?: ReactNode;
  icon: ReactNode;
  id: string;
  label: string;
  /** Optional 48px row under the header, aligned with the preview tabs row. */
  subheader?: ReactNode;
}

export interface TexoAppShellProps {
  actions: ReactNode;
  children: ReactNode;
  /** Rail item open on first render; `null` starts with the panel collapsed. Ignored when `activeRail` is given. */
  defaultRail?: string | null;
  /** Controlled open rail. Pair with `onRailChange` so keybindings can drive the panel. */
  activeRail?: string | null;
  onRailChange?: (id: string | null) => void;
  previewTabs: ReactNode;
  rail: TexoRailItem[];
  /** Optional strip under the workspace card, right-aligned (agent dock). */
  footer?: ReactNode;
}

export function TexoAppShell({
  actions,
  activeRail: controlledRail,
  children,
  defaultRail = null,
  footer,
  previewTabs,
  rail,
}: TexoAppShellProps) {
  const [uncontrolledRail, setUncontrolledRail] = useState<string | null>(
    defaultRail,
  );
  const [panelWidth, setPanelWidth] = useState(320);
  const activeRail =
    controlledRail === undefined ? uncontrolledRail : controlledRail;
  const setActiveRail = (id: string | null) => {
    if (controlledRail === undefined) setUncontrolledRail(id);
    onRailChange?.(id);
  };

  const active = rail.find((item) => item.id === activeRail) ?? null;

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = panelWidth;

    const resize = (pointerEvent: PointerEvent) => {
      setPanelWidth(
        Math.min(
          750,
          Math.max(300, startWidth + pointerEvent.clientX - startX),
        ),
      );
    };

    const stopResize = () => {
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', stopResize);
    };

    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', stopResize);
  };

  const variables = {
    '--texo-rail-width': `${RAIL_WIDTH}px`,
    '--texo-panel-width': active ? `${panelWidth}px` : '0px',
  } as CSSProperties;

  return (
    <BaseBox
      className={classes.root}
      data-panel-open={active ? 'true' : undefined}
      style={variables}
    >
      <BaseBox component="nav" aria-label="Sidebar" className={classes.rail}>
        {rail.map((item) => {
          const selected = item.id === activeRail;
          return (
            <BaseTooltip
              key={item.id}
              label={item.label}
              position="right"
              withArrow
            >
              <BaseActionIcon
                aria-label={item.label}
                aria-pressed={selected}
                className={classes.railButton}
                data-active={selected || undefined}
                onClick={() => setActiveRail(selected ? null : item.id)}
                size="lg"
                variant={selected ? 'light' : 'subtle'}
              >
                {item.icon}
              </BaseActionIcon>
            </BaseTooltip>
          );
        })}
      </BaseBox>

      {active ? (
        <>
          <BaseBox
            component="aside"
            aria-label={active.label}
            className={classes.panel}
          >
            <BaseBox className={classes.panelHeader}>{active.header}</BaseBox>
            <BaseBox className={classes.panelSubheader}>
              {active.subheader}
            </BaseBox>
            <BaseBox className={classes.panelBody}>{active.body}</BaseBox>
          </BaseBox>

          <BaseBox
            aria-label="Resize panel"
            className={classes.resizer}
            onPointerDown={startResize}
            role="separator"
          />
        </>
      ) : null}

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

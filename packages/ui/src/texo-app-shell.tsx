import {
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import { BaseBox } from './components';
import classes from './texo-app-shell.module.css';

export interface TexoAppShellProps {
  actions: ReactNode;
  children: ReactNode;
  controls: ReactNode;
  inspectorTabs: ReactNode;
  previewTabs: ReactNode;
  themePicker: ReactNode;
}

export function TexoAppShell({
  actions,
  children,
  controls,
  inspectorTabs,
  previewTabs,
  themePicker,
}: TexoAppShellProps) {
  const [inspectorWidth, setInspectorWidth] = useState(320);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = inspectorWidth;

    const resize = (pointerEvent: PointerEvent) => {
      setInspectorWidth(
        Math.min(750, Math.max(300, startWidth + pointerEvent.clientX - startX)),
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
    '--texo-inspector-width': `${inspectorWidth}px`,
  } as CSSProperties;

  return (
    <BaseBox className={classes.root} style={variables}>
      <BaseBox component="aside" className={classes.inspector}>
        <BaseBox className={classes.themePicker}>{themePicker}</BaseBox>
        <BaseBox className={classes.inspectorTabs}>{inspectorTabs}</BaseBox>
        <BaseBox className={classes.controls}>{controls}</BaseBox>
      </BaseBox>

      <BaseBox
        aria-label="Resize properties panel"
        className={classes.resizer}
        onPointerDown={startResize}
        role="separator"
      />

      <BaseBox className={classes.workspace}>
        <BaseBox className={classes.actions}>{actions}</BaseBox>
        <BaseBox className={classes.previewTabs}>{previewTabs}</BaseBox>
        <BaseBox component="main" className={classes.canvas}>
          {children}
        </BaseBox>
      </BaseBox>
    </BaseBox>
  );
}

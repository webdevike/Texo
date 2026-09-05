import { IconGripHorizontal, IconX } from '@tabler/icons-react';
import {
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import { BaseActionIcon, BaseBox, BaseGroup, BaseText } from './components';

export interface TexoPanelProps {
  children: ReactNode;
  contained?: boolean;
  gutter?: number;
  onClose: () => void;
  opened: boolean;
  title: string;
}

export function TexoPanel({
  children,
  contained = false,
  gutter = 16,
  onClose,
  opened,
  title,
}: TexoPanelProps) {
  const [height, setHeight] = useState(320);

  useEffect(() => {
    if (!opened) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, opened]);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const startY = event.clientY;
    const startHeight = height;

    const resize = (pointerEvent: PointerEvent) => {
      setHeight(
        Math.min(
          window.innerHeight - 96,
          Math.max(180, startHeight + startY - pointerEvent.clientY),
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

  return (
    <BaseBox
      aria-hidden={!opened}
      bg="var(--mantine-color-body)"
      bottom={0}
      component="section"
      h={height}
      left={contained ? '50%' : `calc(var(--texo-navbar-width, 0px) + ${8 + gutter}px)`}
      pos={contained ? 'absolute' : 'fixed'}
      right={contained ? undefined : 8 + gutter}
      role="dialog"
      w={contained ? 'min(420px, calc(100% - 32px))' : undefined}
      style={{
        border: contained ? '1px solid var(--mantine-color-default-border)' : undefined,
        borderTop: '1px solid var(--mantine-color-default-border)',
        borderRadius: contained ? 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0' : undefined,
        overflow: 'visible',
        pointerEvents: opened ? 'auto' : 'none',
        transform: opened
          ? contained ? 'translate(-50%, 0)' : 'translateY(0)'
          : contained
            ? `translate(-50%, calc(100% + ${gutter}px))`
            : `translateY(calc(100% + ${gutter}px))`,
        transition: 'transform 180ms ease',
        zIndex: 200,
      }}
    >
      <BaseBox
        aria-label="Resize panel"
        bg="var(--mantine-color-body)"
        h={16}
        left="50%"
        onPointerDown={startResize}
        pos="absolute"
        role="separator"
        top={0}
        w={28}
        style={{
          alignItems: 'center',
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: 'var(--mantine-radius-xl)',
          color: 'var(--mantine-color-dimmed)',
          cursor: 'row-resize',
          display: 'flex',
          justifyContent: 'center',
          touchAction: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      >
        <IconGripHorizontal size={14} />
      </BaseBox>

      <BaseGroup h={48} justify="space-between" px="md">
        <BaseText fw={500}>{title}</BaseText>
        <BaseActionIcon
          aria-label="Close panel"
          variant="subtle"
          onClick={onClose}
        >
          <IconX size={16} />
        </BaseActionIcon>
      </BaseGroup>

      <BaseBox h="calc(100% - 48px)" style={{ overflow: 'auto' }}>
        {children}
      </BaseBox>
    </BaseBox>
  );
}

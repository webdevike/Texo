import { lazy, Suspense, type ReactNode } from 'react';
import { BaseText, type TexoComponentRegistry } from '@texo/ui';

const loadCanvas = import.meta.env.DEV
  ? () => import('./canvas-page')
  : () => import('./canvas-runtime');

const Provider = lazy(async () => ({
  default: (await loadCanvas()).CanvasProvider,
}));
export const CanvasLibrary = lazy(async () => ({
  default: (await loadCanvas()).CanvasLibrary,
}));
export const CanvasPage = lazy(async () => ({
  default: (await loadCanvas()).CanvasPage,
}));

export function CanvasProvider(props: {
  registry: TexoComponentRegistry;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<BaseText p="md">Loading canvas...</BaseText>}>
      <Provider {...props} />
    </Suspense>
  );
}

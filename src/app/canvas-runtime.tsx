import type { ReactNode } from 'react';
import { BaseBox, BaseText, TexoComponent } from '@texo/ui';
import type { TexoComponentRegistry } from '@texo/ui';
import { componentLibrary } from '../extensions/registry';
import instances from 'virtual:texo-canvas-runtime';
import type { AgentCanvasContext } from '../context/agent-context';
import { useAgentContextSource } from '../context/agent-context-provider';

const runtimeContext: AgentCanvasContext = {
  mode: 'preview',
  selection: { status: 'unavailable', reason: 'The runtime canvas has no editor selection state.' },
  requests: { status: 'unavailable', reason: 'Canvas annotations are only available in the editor.' },
};

export function CanvasProvider({
  children,
}: {
  registry: TexoComponentRegistry;
  children: ReactNode;
}) {
  useAgentContextSource('canvas', runtimeContext);
  return children;
}

export function CanvasLibrary() {
  return (
    <BaseText c="dimmed" size="sm">
      Open the development app to edit this canvas.
    </BaseText>
  );
}

export function CanvasPage() {
  const left = Math.min(0, ...instances.map((instance) => instance.position.x));
  const top = Math.min(0, ...instances.map((instance) => instance.position.y));
  return (
    <BaseBox
      aria-label="Canvas composition"
      style={{ display: 'grid', overflow: 'auto' }}
    >
      {instances.map((instance) => (
        <div
          key={instance.id}
          style={{
            gridArea: '1 / 1',
            alignSelf: 'start',
            justifySelf: 'start',
            marginLeft: instance.position.x - left,
            marginTop: instance.position.y - top,
            width: instance.width,
          }}
        >
          <TexoComponent
            id={instance.componentId}
            props={instance.props}
            registry={componentLibrary}
          />
        </div>
      ))}
    </BaseBox>
  );
}

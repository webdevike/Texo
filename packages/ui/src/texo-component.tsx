import {
  Component,
  createElement,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';

import { BaseCard, BaseStack, BaseText } from './components';
import type { TexoIconValue } from './texo-icons';

export type TexoPropertyDefinition =
  | { default: string; label: string; type: 'string' | 'color' }
  | { default: number; label: string; max?: number; min?: number; type: 'number' }
  | { default: boolean; label: string; type: 'boolean' }
  | { default: string; label: string; options: readonly string[]; type: 'enum' }
  | { default: TexoIconValue; label: string; type: 'icon' };

export type TexoPropertySchema<Props extends Record<string, unknown>> = {
  [Key in keyof Props]: TexoPropertyDefinition;
};

export interface TexoComponentDefinition<Props extends Record<string, unknown> = Record<string, unknown>> {
  component: ComponentType<Props>;
  defaultProps: Props;
  id: string;
  name: string;
  properties: TexoPropertySchema<Props>;
}
export type TexoComponentRegistry = Record<string, TexoComponentDefinition<any>>;

export function defineTexoComponent<Props extends Record<string, unknown>>(
  definition: TexoComponentDefinition<Props>,
) {
  return definition;
}

class TexoComponentErrorBoundary extends Component<
  { children: ReactNode; componentName: string },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    if (this.state.error) {
      return (
        <BaseCard padding="md" withBorder>
          <BaseStack gap={4}>
            <BaseText fw={600}>Could not render {this.props.componentName}</BaseText>
            <BaseText c="dimmed" size="sm">{this.state.error.message}</BaseText>
          </BaseStack>
        </BaseCard>
      );
    }

    return this.props.children;
  }
}

export function TexoComponent({
  id,
  props,
  registry,
}: {
  id: string;
  props?: Record<string, unknown>;
  registry: TexoComponentRegistry;
}) {
  const definition = registry[id];

  if (!definition) {
    return (
      <BaseCard padding="md" withBorder>
        <BaseText c="dimmed">Unknown component: {id}</BaseText>
      </BaseCard>
    );
  }

  const componentProps = { ...definition.defaultProps, ...props };

  return (
    <TexoComponentErrorBoundary componentName={definition.name} key={id}>
      {createElement(definition.component, componentProps)}
    </TexoComponentErrorBoundary>
  );
}

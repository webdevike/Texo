import { type ComponentType } from 'react';
import type { TexoIconValue } from './texo-icons';
export type TexoPropertyDefinition = {
    default: string;
    label: string;
    type: 'string' | 'color';
} | {
    default: number;
    label: string;
    max?: number;
    min?: number;
    type: 'number';
} | {
    default: boolean;
    label: string;
    type: 'boolean';
} | {
    default: string;
    label: string;
    options: readonly string[];
    type: 'enum';
} | {
    default: TexoIconValue;
    label: string;
    type: 'icon';
};
export type TexoPropertySchema<Props extends Record<string, unknown>> = {
    [Key in keyof Props]: TexoPropertyDefinition;
};
export interface TexoComponentDefinition<Props extends Record<string, unknown> = Record<string, unknown>> {
    component: ComponentType<Props>;
    defaultProps: Props;
    id: string;
    name: string;
    properties: TexoPropertySchema<Props>;
    /** Named internal elements exposed to authoring tools, scoped to this instance. */
    targets?: Record<string, {
        label: string;
        selector: string;
    }>;
}
export type TexoComponentRegistry = Record<string, TexoComponentDefinition<any>>;
export declare function defineTexoComponent<Props extends Record<string, unknown>>(definition: TexoComponentDefinition<Props>): TexoComponentDefinition<Props>;
/** True for values produced by `defineTexoComponent`; used to collect definitions from discovered modules. */
export declare function isTexoComponentDefinition(value: unknown): value is TexoComponentDefinition;
export declare function TexoComponent({ id, props, registry, }: {
    id: string;
    props?: Record<string, unknown>;
    registry: TexoComponentRegistry;
}): import("react").JSX.Element;
//# sourceMappingURL=texo-component.d.ts.map
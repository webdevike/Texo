import { type IconProps } from '@tabler/icons-react';
export declare const TEXO_ICONS: {
    readonly activity: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
    readonly building: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
    readonly chart: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
    readonly heart: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
    readonly rocket: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
    readonly shield: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
    readonly sparkles: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
    readonly users: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
};
export type TexoIconName = keyof typeof TEXO_ICONS;
export interface TexoIconValue {
    name: TexoIconName;
    stroke: number;
    variant: 'outline' | 'filled';
}
export declare function TexoIcon({ value, ...props }: IconProps & {
    value: TexoIconValue;
}): import("react").JSX.Element;
export declare function TexoIconPicker({ label, onChange, value, }: {
    label: string;
    onChange: (value: TexoIconValue) => void;
    value: TexoIconValue;
}): import("react").JSX.Element;
//# sourceMappingURL=texo-icons.d.ts.map
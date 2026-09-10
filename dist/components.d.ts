import { type AccordionProps, type ActionIconProps, type AppShellProps, type BadgeProps, type CodeProps, type CollapseProps, type BoxProps, type ButtonProps, type CardProps, type CheckboxProps, Combobox, type ComboboxProps, type ComboboxPopoverProps, type CenterProps, type CodeHighlightProps, type ColorInputProps, type DrawerProps, Fieldset, type FieldsetProps, type GroupProps, type MenuProps, type MultiSelectProps, type ModalProps, type KbdProps, type InputBaseProps, type NavLinkProps, type NumberInputProps, type SelectProps, type ScrollerProps, type StackProps, type ScrollAreaProps, type SwitchProps, type TabsProps, Table, type TableProps, type TextInputProps, type TextProps, type TextareaProps, type TitleProps, type TooltipProps, type TreeNodeData, type TreeProps } from './mantine';
export declare const BaseAccordion: (<Multiple extends boolean = false>(props: AccordionProps<Multiple>) => React.JSX.Element) & import("@mantine/core").ThemeExtend<{
    props: AccordionProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").AccordionStylesNames;
    vars: import("@mantine/core").AccordionCssVariables;
    variant: import("@mantine/core").AccordionVariant;
    signature: <Multiple extends boolean = false>(props: AccordionProps<Multiple>) => React.JSX.Element;
    staticComponents: {
        Item: typeof import("@mantine/core").AccordionItem;
        Panel: typeof import("@mantine/core").AccordionPanel;
        Control: typeof import("@mantine/core").AccordionControl;
        Chevron: typeof import("@mantine/core").AccordionChevron;
    };
}> & import("@mantine/core").ComponentClasses<{
    props: AccordionProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").AccordionStylesNames;
    vars: import("@mantine/core").AccordionCssVariables;
    variant: import("@mantine/core").AccordionVariant;
    signature: <Multiple extends boolean = false>(props: AccordionProps<Multiple>) => React.JSX.Element;
    staticComponents: {
        Item: typeof import("@mantine/core").AccordionItem;
        Panel: typeof import("@mantine/core").AccordionPanel;
        Control: typeof import("@mantine/core").AccordionControl;
        Chevron: typeof import("@mantine/core").AccordionChevron;
    };
}> & {
    Item: typeof import("@mantine/core").AccordionItem;
    Panel: typeof import("@mantine/core").AccordionPanel;
    Control: typeof import("@mantine/core").AccordionControl;
    Chevron: typeof import("@mantine/core").AccordionChevron;
} & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: AccordionProps;
        ref: HTMLDivElement;
        stylesNames: import("@mantine/core").AccordionStylesNames;
        vars: import("@mantine/core").AccordionCssVariables;
        variant: import("@mantine/core").AccordionVariant;
        signature: <Multiple extends boolean = false>(props: AccordionProps<Multiple>) => React.JSX.Element;
        staticComponents: {
            Item: typeof import("@mantine/core").AccordionItem;
            Panel: typeof import("@mantine/core").AccordionPanel;
            Control: typeof import("@mantine/core").AccordionControl;
            Chevron: typeof import("@mantine/core").AccordionChevron;
        };
    }>;
} & import("@mantine/core").FactoryComponentWithProps<{
    props: AccordionProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").AccordionStylesNames;
    vars: import("@mantine/core").AccordionCssVariables;
    variant: import("@mantine/core").AccordionVariant;
    signature: <Multiple extends boolean = false>(props: AccordionProps<Multiple>) => React.JSX.Element;
    staticComponents: {
        Item: typeof import("@mantine/core").AccordionItem;
        Panel: typeof import("@mantine/core").AccordionPanel;
        Control: typeof import("@mantine/core").AccordionControl;
        Chevron: typeof import("@mantine/core").AccordionChevron;
    };
}> & {
    displayName?: string;
};
export declare const BaseActionIcon: (<C = "button">(props: import("@mantine/core").PolymorphicComponentProps<C, ActionIconProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(ActionIconProps & {
    component?: any;
} & Omit<any, "component" | keyof ActionIconProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (ActionIconProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: ActionIconProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: import("@mantine/core").ActionIconStylesNames;
    variant: import("@mantine/core").ActionIconVariant;
    vars: import("@mantine/core").ActionIconCssVariables;
    staticComponents: {
        Group: typeof import("@mantine/core").ActionIconGroup;
        GroupSection: typeof import("@mantine/core").ActionIconGroupSection;
    };
}> & import("@mantine/core").ComponentClasses<{
    props: ActionIconProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: import("@mantine/core").ActionIconStylesNames;
    variant: import("@mantine/core").ActionIconVariant;
    vars: import("@mantine/core").ActionIconCssVariables;
    staticComponents: {
        Group: typeof import("@mantine/core").ActionIconGroup;
        GroupSection: typeof import("@mantine/core").ActionIconGroupSection;
    };
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: ActionIconProps;
        defaultComponent: "button";
        defaultRef: HTMLButtonElement;
        stylesNames: import("@mantine/core").ActionIconStylesNames;
        variant: import("@mantine/core").ActionIconVariant;
        vars: import("@mantine/core").ActionIconCssVariables;
        staticComponents: {
            Group: typeof import("@mantine/core").ActionIconGroup;
            GroupSection: typeof import("@mantine/core").ActionIconGroupSection;
        };
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: ActionIconProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: import("@mantine/core").ActionIconStylesNames;
    variant: import("@mantine/core").ActionIconVariant;
    vars: import("@mantine/core").ActionIconCssVariables;
    staticComponents: {
        Group: typeof import("@mantine/core").ActionIconGroup;
        GroupSection: typeof import("@mantine/core").ActionIconGroupSection;
    };
}> & {
    Group: typeof import("@mantine/core").ActionIconGroup;
    GroupSection: typeof import("@mantine/core").ActionIconGroupSection;
};
export declare const BaseAppShell: import("@mantine/core").MantineComponent<{
    props: AppShellProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").AppShellStylesNames;
    vars: import("@mantine/core").AppShellCssVariables;
    staticComponents: {
        Navbar: typeof import("@mantine/core").AppShellNavbar;
        Header: typeof import("@mantine/core").AppShellHeader;
        Main: typeof import("@mantine/core").AppShellMain;
        Aside: typeof import("@mantine/core").AppShellAside;
        Footer: typeof import("@mantine/core").AppShellFooter;
        Section: typeof import("@mantine/core").AppShellSection;
    };
}>;
export declare const BaseBadge: (<C = "div">(props: import("@mantine/core").PolymorphicComponentProps<C, BadgeProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(BadgeProps & {
    component?: any;
} & Omit<any, "component" | keyof BadgeProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (BadgeProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: BadgeProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").BadgeStylesNames;
    vars: import("@mantine/core").BadgeCssVariables;
    variant: import("@mantine/core").BadgeVariant;
}> & import("@mantine/core").ComponentClasses<{
    props: BadgeProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").BadgeStylesNames;
    vars: import("@mantine/core").BadgeCssVariables;
    variant: import("@mantine/core").BadgeVariant;
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: BadgeProps;
        defaultRef: HTMLDivElement;
        defaultComponent: "div";
        stylesNames: import("@mantine/core").BadgeStylesNames;
        vars: import("@mantine/core").BadgeCssVariables;
        variant: import("@mantine/core").BadgeVariant;
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: BadgeProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").BadgeStylesNames;
    vars: import("@mantine/core").BadgeCssVariables;
    variant: import("@mantine/core").BadgeVariant;
}> & Record<string, never>;
export declare const BaseCode: import("@mantine/core").MantineComponent<{
    props: CodeProps;
    ref: HTMLElement;
    stylesNames: import("@mantine/core").CodeStylesNames;
    vars: import("@mantine/core").CodeCssVariables;
}>;
export declare const BaseCollapse: import("@mantine/core").MantineComponent<{
    props: CollapseProps;
    ref: HTMLDivElement;
}>;
export declare const BaseBox: (<C = "div">(props: import("@mantine/core").PolymorphicComponentProps<C, import("@mantine/core").BoxComponentProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(import("@mantine/core").BoxComponentProps & {
    component?: any;
} & Omit<any, "component" | keyof import("@mantine/core").BoxComponentProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (import("@mantine/core").BoxComponentProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & Record<string, never>;
export declare const BaseCodeHighlight: import("@mantine/core").MantineComponent<{
    props: CodeHighlightProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/code-highlight").CodeHighlightStylesNames;
    vars: import("@mantine/code-highlight").CodeHighlightCssVariables;
    staticComponents: {
        Control: typeof import("@mantine/code-highlight").CodeHighlightControl;
    };
}>;
export declare const BaseCombobox: typeof Combobox;
export declare const BaseComboboxPopover: (<Multiple extends boolean = false, Value extends import("@mantine/core").Primitive = string>(props: ComboboxPopoverProps<Multiple, Value>) => React.JSX.Element) & import("@mantine/core").ThemeExtend<{
    props: ComboboxPopoverProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").ComboboxPopoverStylesNames;
    signature: <Multiple extends boolean = false, Value extends import("@mantine/core").Primitive = string>(props: ComboboxPopoverProps<Multiple, Value>) => React.JSX.Element;
    staticComponents: {
        Target: typeof import("@mantine/core").ComboboxPopoverTarget;
    };
}> & import("@mantine/core").ComponentClasses<{
    props: ComboboxPopoverProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").ComboboxPopoverStylesNames;
    signature: <Multiple extends boolean = false, Value extends import("@mantine/core").Primitive = string>(props: ComboboxPopoverProps<Multiple, Value>) => React.JSX.Element;
    staticComponents: {
        Target: typeof import("@mantine/core").ComboboxPopoverTarget;
    };
}> & {
    Target: typeof import("@mantine/core").ComboboxPopoverTarget;
} & import("@mantine/core").FactoryComponentWithProps<{
    props: ComboboxPopoverProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").ComboboxPopoverStylesNames;
    signature: <Multiple extends boolean = false, Value extends import("@mantine/core").Primitive = string>(props: ComboboxPopoverProps<Multiple, Value>) => React.JSX.Element;
    staticComponents: {
        Target: typeof import("@mantine/core").ComboboxPopoverTarget;
    };
}> & {
    displayName?: string;
};
export declare const BaseColorInput: import("@mantine/core").MantineComponent<{
    props: ColorInputProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").ColorInputStylesNames;
    vars: import("@mantine/core").ColorInputCssVariables;
    variant: import("@mantine/core").InputVariant;
}>;
export declare const BaseButton: (<C = "button">(props: import("@mantine/core").PolymorphicComponentProps<C, ButtonProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(ButtonProps & {
    component?: any;
} & Omit<any, "component" | keyof ButtonProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (ButtonProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: ButtonProps;
    defaultRef: HTMLButtonElement;
    defaultComponent: "button";
    stylesNames: import("@mantine/core").ButtonStylesNames;
    vars: import("@mantine/core").ButtonCssVariables;
    variant: import("@mantine/core").ButtonVariant;
    staticComponents: {
        Group: typeof import("@mantine/core").ButtonGroup;
        GroupSection: typeof import("@mantine/core").ButtonGroupSection;
    };
}> & import("@mantine/core").ComponentClasses<{
    props: ButtonProps;
    defaultRef: HTMLButtonElement;
    defaultComponent: "button";
    stylesNames: import("@mantine/core").ButtonStylesNames;
    vars: import("@mantine/core").ButtonCssVariables;
    variant: import("@mantine/core").ButtonVariant;
    staticComponents: {
        Group: typeof import("@mantine/core").ButtonGroup;
        GroupSection: typeof import("@mantine/core").ButtonGroupSection;
    };
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: ButtonProps;
        defaultRef: HTMLButtonElement;
        defaultComponent: "button";
        stylesNames: import("@mantine/core").ButtonStylesNames;
        vars: import("@mantine/core").ButtonCssVariables;
        variant: import("@mantine/core").ButtonVariant;
        staticComponents: {
            Group: typeof import("@mantine/core").ButtonGroup;
            GroupSection: typeof import("@mantine/core").ButtonGroupSection;
        };
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: ButtonProps;
    defaultRef: HTMLButtonElement;
    defaultComponent: "button";
    stylesNames: import("@mantine/core").ButtonStylesNames;
    vars: import("@mantine/core").ButtonCssVariables;
    variant: import("@mantine/core").ButtonVariant;
    staticComponents: {
        Group: typeof import("@mantine/core").ButtonGroup;
        GroupSection: typeof import("@mantine/core").ButtonGroupSection;
    };
}> & {
    Group: typeof import("@mantine/core").ButtonGroup;
    GroupSection: typeof import("@mantine/core").ButtonGroupSection;
};
export declare const BaseCheckbox: import("@mantine/core").MantineComponent<{
    props: CheckboxProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").CheckboxStylesNames;
    vars: import("@mantine/core").CheckboxCssVariables;
    variant: import("@mantine/core").CheckboxVariant;
    staticComponents: {
        Group: typeof import("@mantine/core").CheckboxGroup;
        Indicator: typeof import("@mantine/core").CheckboxIndicator;
        Card: typeof import("@mantine/core").CheckboxCard;
    };
}>;
export declare const BaseCard: (<C = "div">(props: import("@mantine/core").PolymorphicComponentProps<C, CardProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(CardProps & {
    component?: any;
} & Omit<any, "component" | keyof CardProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (CardProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: CardProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").CardStylesNames;
    vars: import("@mantine/core").CardCssVariables;
    staticComponents: {
        Section: typeof import("@mantine/core").CardSection;
    };
}> & import("@mantine/core").ComponentClasses<{
    props: CardProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").CardStylesNames;
    vars: import("@mantine/core").CardCssVariables;
    staticComponents: {
        Section: typeof import("@mantine/core").CardSection;
    };
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: CardProps;
        defaultRef: HTMLDivElement;
        defaultComponent: "div";
        stylesNames: import("@mantine/core").CardStylesNames;
        vars: import("@mantine/core").CardCssVariables;
        staticComponents: {
            Section: typeof import("@mantine/core").CardSection;
        };
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: CardProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").CardStylesNames;
    vars: import("@mantine/core").CardCssVariables;
    staticComponents: {
        Section: typeof import("@mantine/core").CardSection;
    };
}> & {
    Section: typeof import("@mantine/core").CardSection;
};
export declare const BaseDrawer: import("@mantine/core").MantineComponent<{
    props: DrawerProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").DrawerStylesNames;
    vars: import("@mantine/core").DrawerCssVariables;
    staticComponents: {
        Root: typeof import("@mantine/core").DrawerRoot;
        Overlay: typeof import("@mantine/core").DrawerOverlay;
        Content: typeof import("@mantine/core").DrawerContent;
        Body: typeof import("@mantine/core").DrawerBody;
        Header: typeof import("@mantine/core").DrawerHeader;
        Title: typeof import("@mantine/core").DrawerTitle;
        CloseButton: typeof import("@mantine/core").DrawerCloseButton;
        Stack: typeof import("@mantine/core").DrawerStack;
    };
}>;
export declare const BaseFieldset: typeof Fieldset;
export declare const BaseCenter: (<C = "div">(props: import("@mantine/core").PolymorphicComponentProps<C, CenterProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(CenterProps & {
    component?: any;
} & Omit<any, "component" | keyof CenterProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (CenterProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: CenterProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").CenterStylesNames;
}> & import("@mantine/core").ComponentClasses<{
    props: CenterProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").CenterStylesNames;
}> & import("@mantine/core").PolymorphicComponentWithProps<{
    props: CenterProps;
    defaultRef: HTMLDivElement;
    defaultComponent: "div";
    stylesNames: import("@mantine/core").CenterStylesNames;
}> & Record<string, never>;
export declare const BaseGroup: import("@mantine/core").MantineComponent<{
    props: GroupProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").GroupStylesNames;
    vars: import("@mantine/core").GroupCssVariables;
    ctx: import("@mantine/core").GroupStylesCtx;
}>;
export declare const BaseInputBase: (<C = "input">(props: import("@mantine/core").PolymorphicComponentProps<C, InputBaseProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(InputBaseProps & {
    component?: any;
} & Omit<any, "component" | keyof InputBaseProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (InputBaseProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: InputBaseProps;
    defaultRef: HTMLInputElement;
    defaultComponent: "input";
    stylesNames: import("@mantine/core").__InputStylesNames;
    variant: import("@mantine/core").InputVariant;
}> & import("@mantine/core").ComponentClasses<{
    props: InputBaseProps;
    defaultRef: HTMLInputElement;
    defaultComponent: "input";
    stylesNames: import("@mantine/core").__InputStylesNames;
    variant: import("@mantine/core").InputVariant;
}> & import("@mantine/core").PolymorphicComponentWithProps<{
    props: InputBaseProps;
    defaultRef: HTMLInputElement;
    defaultComponent: "input";
    stylesNames: import("@mantine/core").__InputStylesNames;
    variant: import("@mantine/core").InputVariant;
}> & Record<string, never>;
export declare const BaseMenu: import("@mantine/core").MantineComponent<{
    props: MenuProps;
    stylesNames: import("@mantine/core").MenuStylesNames;
    staticComponents: {
        Item: typeof import("@mantine/core").MenuItem;
        Label: typeof import("@mantine/core").MenuLabel;
        Dropdown: typeof import("@mantine/core").MenuDropdown;
        Target: typeof import("@mantine/core").MenuTarget;
        Divider: typeof import("@mantine/core").MenuDivider;
        Search: typeof import("@mantine/core").MenuSearch;
        Sub: typeof import("@mantine/core").MenuSub;
        CheckboxItem: typeof import("@mantine/core").MenuCheckboxItem;
        CheckboxGroup: typeof import("@mantine/core").MenuCheckboxGroup;
        RadioItem: typeof import("@mantine/core").MenuRadioItem;
        RadioGroup: typeof import("@mantine/core").MenuRadioGroup;
        ContextMenu: typeof import("@mantine/core").MenuContextMenu;
    };
}>;
export declare const BaseMultiSelect: (<Value extends import("@mantine/core").Primitive = string>(props: MultiSelectProps<Value>) => React.JSX.Element) & import("@mantine/core").ThemeExtend<{
    props: MultiSelectProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").MultiSelectStylesNames;
    signature: <Value extends import("@mantine/core").Primitive = string>(props: MultiSelectProps<Value>) => React.JSX.Element;
}> & import("@mantine/core").ComponentClasses<{
    props: MultiSelectProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").MultiSelectStylesNames;
    signature: <Value extends import("@mantine/core").Primitive = string>(props: MultiSelectProps<Value>) => React.JSX.Element;
}> & Record<string, never> & import("@mantine/core").FactoryComponentWithProps<{
    props: MultiSelectProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").MultiSelectStylesNames;
    signature: <Value extends import("@mantine/core").Primitive = string>(props: MultiSelectProps<Value>) => React.JSX.Element;
}> & {
    displayName?: string;
};
export declare const BaseModal: import("@mantine/core").MantineComponent<{
    props: ModalProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").ModalStylesNames;
    vars: import("@mantine/core").ModalCssVariables;
    staticComponents: {
        Root: typeof import("@mantine/core").ModalRoot;
        Overlay: typeof import("@mantine/core").ModalOverlay;
        Content: typeof import("@mantine/core").ModalContent;
        Body: typeof import("@mantine/core").ModalBody;
        Header: typeof import("@mantine/core").ModalHeader;
        Title: typeof import("@mantine/core").ModalTitle;
        CloseButton: typeof import("@mantine/core").ModalCloseButton;
        Stack: typeof import("@mantine/core").ModalStack;
    };
}>;
export declare const BaseKbd: import("@mantine/core").MantineComponent<{
    props: KbdProps;
    ref: HTMLElement;
    stylesNames: import("@mantine/core").KbdStylesNames;
    vars: import("@mantine/core").KbdCssVariables;
}>;
export declare const BaseNavLink: (<C = "a">(props: import("@mantine/core").PolymorphicComponentProps<C, NavLinkProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(NavLinkProps & {
    component?: any;
} & Omit<any, "component" | keyof NavLinkProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (NavLinkProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: NavLinkProps;
    defaultRef: HTMLAnchorElement;
    defaultComponent: "a";
    stylesNames: import("@mantine/core").NavLinkStylesNames;
    vars: import("@mantine/core").NavLinkCssVariables;
    variant: import("@mantine/core").NavLinkVariant;
}> & import("@mantine/core").ComponentClasses<{
    props: NavLinkProps;
    defaultRef: HTMLAnchorElement;
    defaultComponent: "a";
    stylesNames: import("@mantine/core").NavLinkStylesNames;
    vars: import("@mantine/core").NavLinkCssVariables;
    variant: import("@mantine/core").NavLinkVariant;
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: NavLinkProps;
        defaultRef: HTMLAnchorElement;
        defaultComponent: "a";
        stylesNames: import("@mantine/core").NavLinkStylesNames;
        vars: import("@mantine/core").NavLinkCssVariables;
        variant: import("@mantine/core").NavLinkVariant;
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: NavLinkProps;
    defaultRef: HTMLAnchorElement;
    defaultComponent: "a";
    stylesNames: import("@mantine/core").NavLinkStylesNames;
    vars: import("@mantine/core").NavLinkCssVariables;
    variant: import("@mantine/core").NavLinkVariant;
}> & Record<string, never>;
export declare const BaseNumberInput: (<T extends import("@mantine/core").NumberInputNumericType = number>(props: NumberInputProps<T>) => React.JSX.Element) & import("@mantine/core").ThemeExtend<{
    props: NumberInputProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").NumberInputStylesNames;
    vars: import("@mantine/core").NumberInputCssVariables;
    variant: import("@mantine/core").InputVariant;
    signature: <T extends import("@mantine/core").NumberInputNumericType = number>(props: NumberInputProps<T>) => React.JSX.Element;
}> & import("@mantine/core").ComponentClasses<{
    props: NumberInputProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").NumberInputStylesNames;
    vars: import("@mantine/core").NumberInputCssVariables;
    variant: import("@mantine/core").InputVariant;
    signature: <T extends import("@mantine/core").NumberInputNumericType = number>(props: NumberInputProps<T>) => React.JSX.Element;
}> & Record<string, never> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: NumberInputProps;
        ref: HTMLInputElement;
        stylesNames: import("@mantine/core").NumberInputStylesNames;
        vars: import("@mantine/core").NumberInputCssVariables;
        variant: import("@mantine/core").InputVariant;
        signature: <T extends import("@mantine/core").NumberInputNumericType = number>(props: NumberInputProps<T>) => React.JSX.Element;
    }>;
} & import("@mantine/core").FactoryComponentWithProps<{
    props: NumberInputProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").NumberInputStylesNames;
    vars: import("@mantine/core").NumberInputCssVariables;
    variant: import("@mantine/core").InputVariant;
    signature: <T extends import("@mantine/core").NumberInputNumericType = number>(props: NumberInputProps<T>) => React.JSX.Element;
}> & {
    displayName?: string;
};
export declare const BaseSelect: (<Value extends import("@mantine/core").Primitive = string>(props: SelectProps<Value>) => React.JSX.Element) & import("@mantine/core").ThemeExtend<{
    props: SelectProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").SelectStylesNames;
    variant: import("@mantine/core").InputVariant;
    signature: <Value extends import("@mantine/core").Primitive = string>(props: SelectProps<Value>) => React.JSX.Element;
}> & import("@mantine/core").ComponentClasses<{
    props: SelectProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").SelectStylesNames;
    variant: import("@mantine/core").InputVariant;
    signature: <Value extends import("@mantine/core").Primitive = string>(props: SelectProps<Value>) => React.JSX.Element;
}> & Record<string, never> & import("@mantine/core").FactoryComponentWithProps<{
    props: SelectProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").SelectStylesNames;
    variant: import("@mantine/core").InputVariant;
    signature: <Value extends import("@mantine/core").Primitive = string>(props: SelectProps<Value>) => React.JSX.Element;
}> & {
    displayName?: string;
};
export declare const BaseScroller: import("@mantine/core").MantineComponent<{
    props: ScrollerProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").ScrollerStylesNames;
    vars: import("@mantine/core").ScrollerCssVariables;
}>;
export declare const BaseStack: import("@mantine/core").MantineComponent<{
    props: StackProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").StackStylesNames;
    vars: import("@mantine/core").StackCssVariables;
}>;
export declare const BaseScrollArea: import("@mantine/core").MantineComponent<{
    props: ScrollAreaProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").ScrollAreaStylesNames;
    vars: import("@mantine/core").ScrollAreaCssVariables;
    staticComponents: {
        Autosize: typeof import("@mantine/core").ScrollAreaAutosize;
    };
}>;
export declare const BaseSwitch: import("@mantine/core").MantineComponent<{
    props: SwitchProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").SwitchStylesNames;
    vars: import("@mantine/core").SwitchCssVariables;
    staticComponents: {
        Group: typeof import("@mantine/core").SwitchGroup;
    };
}>;
export declare const BaseTable: typeof Table;
export declare const BaseTabs: import("@mantine/core").MantineComponent<{
    props: TabsProps;
    ref: HTMLDivElement;
    variant: import("@mantine/core").TabsVariant;
    stylesNames: import("@mantine/core").TabsStylesNames;
    vars: import("@mantine/core").TabsCssVariables;
    staticComponents: {
        Tab: typeof import("@mantine/core").TabsTab;
        Panel: typeof import("@mantine/core").TabsPanel;
        List: typeof import("@mantine/core").TabsList;
    };
}>;
export declare const BaseText: (<C = "p">(props: import("@mantine/core").PolymorphicComponentProps<C, TextProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(TextProps & {
    component?: any;
} & Omit<any, "component" | keyof TextProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (TextProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: TextProps;
    defaultComponent: "p";
    defaultRef: HTMLParagraphElement;
    stylesNames: import("@mantine/core").TextStylesNames;
    vars: import("@mantine/core").TextCssVariables;
    variant: import("@mantine/core").TextVariant;
}> & import("@mantine/core").ComponentClasses<{
    props: TextProps;
    defaultComponent: "p";
    defaultRef: HTMLParagraphElement;
    stylesNames: import("@mantine/core").TextStylesNames;
    vars: import("@mantine/core").TextCssVariables;
    variant: import("@mantine/core").TextVariant;
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: TextProps;
        defaultComponent: "p";
        defaultRef: HTMLParagraphElement;
        stylesNames: import("@mantine/core").TextStylesNames;
        vars: import("@mantine/core").TextCssVariables;
        variant: import("@mantine/core").TextVariant;
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: TextProps;
    defaultComponent: "p";
    defaultRef: HTMLParagraphElement;
    stylesNames: import("@mantine/core").TextStylesNames;
    vars: import("@mantine/core").TextCssVariables;
    variant: import("@mantine/core").TextVariant;
}> & Record<string, never>;
export declare const BaseTextInput: import("@mantine/core").MantineComponent<{
    props: TextInputProps;
    variant: import("@mantine/core").InputVariant;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").__InputStylesNames;
}>;
export declare const BaseTextarea: import("@mantine/core").MantineComponent<{
    props: TextareaProps;
    ref: HTMLTextAreaElement;
    stylesNames: import("@mantine/core").__InputStylesNames;
}>;
export declare const BaseTitle: import("@mantine/core").MantineComponent<{
    props: TitleProps;
    ref: HTMLHeadingElement;
    stylesNames: import("@mantine/core").TitleStylesNames;
    vars: import("@mantine/core").TitleCssVariables;
}>;
export declare const BaseTooltip: import("@mantine/core").MantineComponent<{
    props: TooltipProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").TooltipStylesNames;
    vars: import("@mantine/core").TooltipCssVariables;
    staticComponents: {
        Floating: typeof import("@mantine/core").TooltipFloating;
        Group: typeof import("@mantine/core").TooltipGroup;
    };
}>;
export declare const BaseTree: import("@mantine/core").MantineComponent<{
    props: TreeProps;
    ref: HTMLUListElement;
    stylesNames: import("@mantine/core").TreeStylesNames;
    vars: import("@mantine/core").TreeCssVariables;
}>;
export type BaseActionIconProps = ActionIconProps;
export type BaseAccordionProps = AccordionProps;
export type BaseAppShellProps = AppShellProps;
export type BaseBadgeProps = BadgeProps;
export type BaseCodeProps = CodeProps;
export type BaseCollapseProps = CollapseProps;
export type BaseNumberInputProps = NumberInputProps;
export type BaseCodeHighlightProps = CodeHighlightProps;
export type BaseColorInputProps = ColorInputProps;
export type BaseBoxProps = BoxProps;
export type BaseButtonProps = ButtonProps;
export type BaseDrawerProps = DrawerProps;
export type BaseFieldsetProps = FieldsetProps;
export type BaseComboboxProps = ComboboxProps;
export type BaseComboboxPopoverProps = ComboboxPopoverProps;
export type BaseCheckboxProps = CheckboxProps;
export type BaseCardProps = CardProps;
export type BaseCenterProps = CenterProps;
export type BaseGroupProps = GroupProps;
export type BaseMenuProps = MenuProps;
export type BaseMultiSelectProps = MultiSelectProps;
export type BaseModalProps = ModalProps;
export type BaseKbdProps = KbdProps;
export type BaseNavLinkProps = NavLinkProps;
export type BaseSelectProps = SelectProps;
export type BaseScrollerProps = ScrollerProps;
export type BaseInputBaseProps = InputBaseProps;
export type BaseStackProps = StackProps;
export type BaseSwitchProps = SwitchProps;
export type BaseTableProps = TableProps;
export type BaseTabsProps = TabsProps;
export type BaseTextProps = TextProps;
export type BaseTextInputProps = TextInputProps;
export type BaseScrollAreaProps = ScrollAreaProps;
export type BaseTitleProps = TitleProps;
export type BaseTooltipProps = TooltipProps;
export type BaseTextareaProps = TextareaProps;
export type BaseTreeNodeData = TreeNodeData;
export type BaseTreeProps = TreeProps;
import { type CloseButtonProps, type DividerProps, type LoaderProps, type NotificationProps, type PillProps, Popover, type PopoverProps } from './mantine';
export declare const BaseCloseButton: (<C = "button">(props: import("@mantine/core").PolymorphicComponentProps<C, CloseButtonProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(CloseButtonProps & {
    component?: any;
} & Omit<any, "component" | keyof CloseButtonProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (CloseButtonProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: CloseButtonProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: import("@mantine/core").CloseButtonStylesNames;
    variant: import("@mantine/core").CloseButtonVariant;
    vars: import("@mantine/core").CloseButtonCssVariables;
}> & import("@mantine/core").ComponentClasses<{
    props: CloseButtonProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: import("@mantine/core").CloseButtonStylesNames;
    variant: import("@mantine/core").CloseButtonVariant;
    vars: import("@mantine/core").CloseButtonCssVariables;
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: CloseButtonProps;
        defaultComponent: "button";
        defaultRef: HTMLButtonElement;
        stylesNames: import("@mantine/core").CloseButtonStylesNames;
        variant: import("@mantine/core").CloseButtonVariant;
        vars: import("@mantine/core").CloseButtonCssVariables;
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: CloseButtonProps;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
    stylesNames: import("@mantine/core").CloseButtonStylesNames;
    variant: import("@mantine/core").CloseButtonVariant;
    vars: import("@mantine/core").CloseButtonCssVariables;
}> & Record<string, never>;
export declare const BaseDivider: import("@mantine/core").MantineComponent<{
    props: DividerProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").DividerStylesNames;
    vars: import("@mantine/core").DividerCssVariables;
    variant: import("@mantine/core").DividerVariant;
}>;
export declare const BaseLoader: import("@mantine/core").MantineComponent<{
    props: LoaderProps;
    ref: SVGSVGElement;
    stylesNames: import("@mantine/core").LoaderStylesNames;
    vars: import("@mantine/core").LoaderCssVariables;
    staticComponents: {
        defaultLoaders: typeof import("@mantine/core").defaultLoaders;
    };
}>;
export declare const BaseNotification: import("@mantine/core").MantineComponent<{
    props: NotificationProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").NotificationStylesNames;
    vars: import("@mantine/core").NotificationCssVariables;
}>;
export declare const BasePill: import("@mantine/core").MantineComponent<{
    props: PillProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").PillStylesNames;
    vars: import("@mantine/core").PillCssVariables;
    variant: import("@mantine/core").PillVariant;
    ctx: {
        size: import("@mantine/core").MantineSize | (string & {}) | undefined;
    };
    staticComponents: {
        Group: typeof import("@mantine/core").PillGroup;
    };
}>;
export declare const BasePopover: typeof Popover;
export type BaseCloseButtonProps = CloseButtonProps;
export type BaseDividerProps = DividerProps;
export type BaseLoaderProps = LoaderProps;
export type BaseNotificationProps = NotificationProps;
export type BasePillProps = PillProps;
export type BasePopoverProps = PopoverProps;
import { type AlertProps, type AnchorProps, type BurgerProps, type ContainerProps, type GridProps, HoverCard, type HoverCardProps, type ImageProps, type NativeSelectProps, type PaginationProps, type PaperProps, type PasswordInputProps, PinInput, type PinInputProps, type SimpleGridProps, type ThemeIconProps, type TimelineProps, type UnstyledButtonProps } from './mantine';
export declare const BaseAlert: import("@mantine/core").MantineComponent<{
    props: AlertProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").AlertStylesNames;
    vars: import("@mantine/core").AlertCssVariables;
    variant: import("@mantine/core").AlertVariant;
}>;
export declare const BaseAnchor: (<C = "a">(props: import("@mantine/core").PolymorphicComponentProps<C, AnchorProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(AnchorProps & {
    component?: any;
} & Omit<any, "component" | keyof AnchorProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (AnchorProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: AnchorProps;
    defaultComponent: "a";
    defaultRef: HTMLAnchorElement;
    stylesNames: import("@mantine/core").AnchorStylesNames;
    vars: import("@mantine/core").AnchorCssVariables;
    variant: import("@mantine/core").AnchorVariant;
}> & import("@mantine/core").ComponentClasses<{
    props: AnchorProps;
    defaultComponent: "a";
    defaultRef: HTMLAnchorElement;
    stylesNames: import("@mantine/core").AnchorStylesNames;
    vars: import("@mantine/core").AnchorCssVariables;
    variant: import("@mantine/core").AnchorVariant;
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: AnchorProps;
        defaultComponent: "a";
        defaultRef: HTMLAnchorElement;
        stylesNames: import("@mantine/core").AnchorStylesNames;
        vars: import("@mantine/core").AnchorCssVariables;
        variant: import("@mantine/core").AnchorVariant;
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: AnchorProps;
    defaultComponent: "a";
    defaultRef: HTMLAnchorElement;
    stylesNames: import("@mantine/core").AnchorStylesNames;
    vars: import("@mantine/core").AnchorCssVariables;
    variant: import("@mantine/core").AnchorVariant;
}> & Record<string, never>;
export declare const BaseBurger: import("@mantine/core").MantineComponent<{
    props: BurgerProps;
    ref: HTMLButtonElement;
    stylesNames: import("@mantine/core").BurgerStylesNames;
    vars: import("@mantine/core").BurgerCssVariables;
}>;
export declare const BaseContainer: import("@mantine/core").MantineComponent<{
    props: ContainerProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").ContainerStylesNames;
    vars: import("@mantine/core").ContainerCssVariables;
}>;
export declare const BaseGrid: import("@mantine/core").MantineComponent<{
    props: GridProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").GridStylesNames;
    vars: import("@mantine/core").GridCssVariables;
    staticComponents: {
        Col: typeof import("@mantine/core").GridCol;
    };
}>;
export declare const BaseHoverCard: typeof HoverCard;
export declare const BaseImage: (<C = "img">(props: import("@mantine/core").PolymorphicComponentProps<C, ImageProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(ImageProps & {
    component?: any;
} & Omit<any, "component" | keyof ImageProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (ImageProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: ImageProps;
    defaultRef: HTMLImageElement;
    defaultComponent: "img";
    stylesNames: import("@mantine/core").ImageStylesNames;
    vars: import("@mantine/core").ImageCssVariables;
}> & import("@mantine/core").ComponentClasses<{
    props: ImageProps;
    defaultRef: HTMLImageElement;
    defaultComponent: "img";
    stylesNames: import("@mantine/core").ImageStylesNames;
    vars: import("@mantine/core").ImageCssVariables;
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: ImageProps;
        defaultRef: HTMLImageElement;
        defaultComponent: "img";
        stylesNames: import("@mantine/core").ImageStylesNames;
        vars: import("@mantine/core").ImageCssVariables;
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: ImageProps;
    defaultRef: HTMLImageElement;
    defaultComponent: "img";
    stylesNames: import("@mantine/core").ImageStylesNames;
    vars: import("@mantine/core").ImageCssVariables;
}> & Record<string, never>;
export declare const BaseNativeSelect: import("@mantine/core").MantineComponent<{
    props: NativeSelectProps;
    ref: HTMLSelectElement;
    stylesNames: import("@mantine/core").__InputStylesNames;
}>;
export declare const BasePagination: import("@mantine/core").MantineComponent<{
    props: PaginationProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").PaginationStylesNames;
    vars: import("@mantine/core").PaginationCssVariables;
    staticComponents: {
        Root: typeof import("@mantine/core").PaginationRoot;
        Control: typeof import("@mantine/core").PaginationControl;
        Dots: typeof import("@mantine/core").PaginationDots;
        First: typeof import("@mantine/core").PaginationFirst;
        Last: typeof import("@mantine/core").PaginationLast;
        Next: typeof import("@mantine/core").PaginationNext;
        Previous: typeof import("@mantine/core").PaginationPrevious;
        Items: typeof import("@mantine/core").PaginationItems;
        Label: typeof import("@mantine/core").PaginationLabel;
    };
}>;
export declare const BasePaper: (<C = "div">(props: import("@mantine/core").PolymorphicComponentProps<C, PaperProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(PaperProps & {
    component?: any;
} & Omit<any, "component" | keyof PaperProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (PaperProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: PaperProps;
    defaultComponent: "div";
    defaultRef: HTMLDivElement;
    stylesNames: import("@mantine/core").PaperStylesNames;
    vars: import("@mantine/core").PaperCssVariables;
}> & import("@mantine/core").ComponentClasses<{
    props: PaperProps;
    defaultComponent: "div";
    defaultRef: HTMLDivElement;
    stylesNames: import("@mantine/core").PaperStylesNames;
    vars: import("@mantine/core").PaperCssVariables;
}> & {
    varsResolver: import("@mantine/core").VarsResolver<{
        props: PaperProps;
        defaultComponent: "div";
        defaultRef: HTMLDivElement;
        stylesNames: import("@mantine/core").PaperStylesNames;
        vars: import("@mantine/core").PaperCssVariables;
    }>;
} & import("@mantine/core").PolymorphicComponentWithProps<{
    props: PaperProps;
    defaultComponent: "div";
    defaultRef: HTMLDivElement;
    stylesNames: import("@mantine/core").PaperStylesNames;
    vars: import("@mantine/core").PaperCssVariables;
}> & Record<string, never>;
export declare const BasePasswordInput: import("@mantine/core").MantineComponent<{
    props: PasswordInputProps;
    ref: HTMLInputElement;
    stylesNames: import("@mantine/core").PasswordInputStylesNames;
    vars: import("@mantine/core").PasswordInputCssVariables;
    variant: import("@mantine/core").InputVariant;
}>;
export declare const BasePinInput: typeof PinInput;
export declare const BaseSimpleGrid: import("@mantine/core").MantineComponent<{
    props: SimpleGridProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").SimpleGridStylesNames;
}>;
export declare const BaseThemeIcon: import("@mantine/core").MantineComponent<{
    props: ThemeIconProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").ThemeIconStylesNames;
    vars: import("@mantine/core").ThemeIconCssVariables;
    variant: import("@mantine/core").ThemeIconVariant;
}>;
export declare const BaseTimeline: import("@mantine/core").MantineComponent<{
    props: TimelineProps;
    ref: HTMLDivElement;
    stylesNames: import("@mantine/core").TimelineStylesNames;
    vars: import("@mantine/core").TimelineCssVariables;
    staticComponents: {
        Item: typeof import("@mantine/core").TimelineItem;
    };
}>;
export declare const BaseUnstyledButton: (<C = "button">(props: import("@mantine/core").PolymorphicComponentProps<C, UnstyledButtonProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(UnstyledButtonProps & {
    component?: any;
} & Omit<any, "component" | keyof UnstyledButtonProps> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (UnstyledButtonProps & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & import("@mantine/core").ThemeExtend<{
    props: UnstyledButtonProps;
    stylesNames: import("@mantine/core").UnstyledButtonStylesNames;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
}> & import("@mantine/core").ComponentClasses<{
    props: UnstyledButtonProps;
    stylesNames: import("@mantine/core").UnstyledButtonStylesNames;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
}> & import("@mantine/core").PolymorphicComponentWithProps<{
    props: UnstyledButtonProps;
    stylesNames: import("@mantine/core").UnstyledButtonStylesNames;
    defaultComponent: "button";
    defaultRef: HTMLButtonElement;
}> & Record<string, never>;
export type BaseAlertProps = AlertProps;
export type BaseAnchorProps = AnchorProps;
export type BaseBurgerProps = BurgerProps;
export type BaseContainerProps = ContainerProps;
export type BaseGridProps = GridProps;
export type BaseHoverCardProps = HoverCardProps;
export type BaseImageProps = ImageProps;
export type BaseNativeSelectProps = NativeSelectProps;
export type BasePaginationProps = PaginationProps;
export type BasePaperProps = PaperProps;
export type BasePasswordInputProps = PasswordInputProps;
export type BasePinInputProps = PinInputProps;
export type BaseSimpleGridProps = SimpleGridProps;
export type BaseThemeIconProps = ThemeIconProps;
export type BaseTimelineProps = TimelineProps;
export type BaseUnstyledButtonProps = UnstyledButtonProps;
//# sourceMappingURL=components.d.ts.map
import {
    Accordion,
    type AccordionProps,
    ActionIcon,
    type ActionIconProps,
    AppShell,
    type AppShellProps,
    Box,
    type BoxProps,
    Button,
    type ButtonProps,
    Card,
    type CardProps,
    Checkbox,
    type CheckboxProps,
    Combobox,
    type ComboboxProps,
    ComboboxPopover,
    type ComboboxPopoverProps,
    Center,
    type CenterProps,
    CodeHighlight,
    type CodeHighlightProps,
    ColorInput,
    type ColorInputProps,
    Drawer,
    type DrawerProps,
    Group,
    type GroupProps,
    Menu,
    type MenuProps,
    InputBase,
    type InputBaseProps,
    NavLink,
    type NavLinkProps,
    Select,
    type SelectProps,
    Scroller,
    type ScrollerProps,
    Stack,
    type StackProps,
    ScrollArea,
    type ScrollAreaProps,
    Switch,
    type SwitchProps,
    Tabs,
    type TabsProps,
    Table,
    type TableProps,
    Text,
    TextInput,
    type TextInputProps,
    type TextProps,
    Textarea,
    type TextareaProps,
    Title,
    type TitleProps,
    Tree,
    type TreeNodeData,
    type TreeProps,
} from './mantine';

// Keep these as direct aliases rather than wrapper components. This preserves
// Mantine refs, polymorphic props, static subcomponents, and zero-cost rendering.
export const BaseAccordion = Accordion;
export const BaseActionIcon = ActionIcon;
export const BaseAppShell = AppShell;
export const BaseBox = Box;
export const BaseCodeHighlight = CodeHighlight;
export const BaseCombobox = Combobox;
export const BaseComboboxPopover = ComboboxPopover;
export const BaseColorInput = ColorInput;
export const BaseButton = Button;
export const BaseCheckbox = Checkbox;
export const BaseCard = Card;
export const BaseDrawer = Drawer;
export const BaseCenter = Center;
export const BaseGroup = Group;
export const BaseInputBase = InputBase;
export const BaseMenu = Menu;
export const BaseNavLink = NavLink;
export const BaseSelect = Select;
export const BaseScroller = Scroller;
export const BaseStack = Stack;
export const BaseScrollArea = ScrollArea;
export const BaseSwitch = Switch;
export const BaseTable = Table;
export const BaseTabs = Tabs;
export const BaseText = Text;
export const BaseTextInput = TextInput;
export const BaseTextarea = Textarea;
export const BaseTitle = Title;
export const BaseTree = Tree;

export type BaseActionIconProps = ActionIconProps;
export type BaseAccordionProps = AccordionProps;
export type BaseAppShellProps = AppShellProps;
export type BaseCodeHighlightProps = CodeHighlightProps;
export type BaseColorInputProps = ColorInputProps;
export type BaseBoxProps = BoxProps;
export type BaseButtonProps = ButtonProps;
export type BaseDrawerProps = DrawerProps;
export type BaseComboboxProps = ComboboxProps;
export type BaseComboboxPopoverProps = ComboboxPopoverProps;
export type BaseCheckboxProps = CheckboxProps;
export type BaseCardProps = CardProps;
export type BaseCenterProps = CenterProps;
export type BaseGroupProps = GroupProps;
export type BaseMenuProps = MenuProps;
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
export type BaseTextareaProps = TextareaProps;
export type BaseTreeNodeData = TreeNodeData;
export type BaseTreeProps = TreeProps;

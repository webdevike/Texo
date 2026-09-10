import {
    Accordion,
    type AccordionProps,
    ActionIcon,
    type ActionIconProps,
    AppShell,
    type AppShellProps,
    Badge,
    type BadgeProps,
    Code,
    type CodeProps,
    Collapse,
    type CollapseProps,
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
    Fieldset,
    type FieldsetProps,
    Group,
    type GroupProps,
    Menu,
    type MenuProps,
    MultiSelect,
    type MultiSelectProps,
    Modal,
    type ModalProps,
    Kbd,
    type KbdProps,
    InputBase,
    type InputBaseProps,
    NavLink,
    type NavLinkProps,
    NumberInput,
    type NumberInputProps,
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
    Tooltip,
    type TooltipProps,
    Tree,
    type TreeNodeData,
    type TreeProps,
} from './mantine';

// Keep these as direct aliases rather than wrapper components. This preserves
// Mantine refs, polymorphic props, static subcomponents, and zero-cost rendering.
export const BaseAccordion = Accordion;
export const BaseActionIcon = ActionIcon;
export const BaseAppShell = AppShell;
export const BaseBadge = Badge;
export const BaseCode = Code;
export const BaseCollapse = Collapse;
export const BaseBox = Box;
export const BaseCodeHighlight = CodeHighlight;
export const BaseCombobox = Combobox;
export const BaseComboboxPopover = ComboboxPopover;
export const BaseColorInput = ColorInput;
export const BaseButton = Button;
export const BaseCheckbox = Checkbox;
export const BaseCard = Card;
export const BaseDrawer = Drawer;
export const BaseFieldset = Fieldset;
export const BaseCenter = Center;
export const BaseGroup = Group;
export const BaseInputBase = InputBase;
export const BaseMenu = Menu;
export const BaseMultiSelect = MultiSelect;
export const BaseModal = Modal;
export const BaseKbd = Kbd;
export const BaseNavLink = NavLink;
export const BaseNumberInput = NumberInput;
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
export const BaseTooltip = Tooltip;
export const BaseTree = Tree;

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

// b-query slice: list surface primitives.
import {
    CloseButton,
    type CloseButtonProps,
    Divider,
    type DividerProps,
    Loader,
    type LoaderProps,
    Notification,
    type NotificationProps,
    Pill,
    type PillProps,
    Popover,
    type PopoverProps,
} from './mantine';

export const BaseCloseButton = CloseButton;
export const BaseDivider = Divider;
export const BaseLoader = Loader;
export const BaseNotification = Notification;
export const BasePill = Pill;
export const BasePopover = Popover;

export type BaseCloseButtonProps = CloseButtonProps;
export type BaseDividerProps = DividerProps;
export type BaseLoaderProps = LoaderProps;
export type BaseNotificationProps = NotificationProps;
export type BasePillProps = PillProps;
export type BasePopoverProps = PopoverProps;

// Page-shell slice: document, layout, and form primitives full apps need.
import {
    Alert,
    type AlertProps,
    Anchor,
    type AnchorProps,
    Burger,
    type BurgerProps,
    Container,
    type ContainerProps,
    Grid,
    type GridProps,
    HoverCard,
    type HoverCardProps,
    Image,
    type ImageProps,
    NativeSelect,
    type NativeSelectProps,
    Pagination,
    type PaginationProps,
    Paper,
    type PaperProps,
    PasswordInput,
    type PasswordInputProps,
    PinInput,
    type PinInputProps,
    SimpleGrid,
    type SimpleGridProps,
    ThemeIcon,
    type ThemeIconProps,
    Timeline,
    type TimelineProps,
    UnstyledButton,
    type UnstyledButtonProps,
} from './mantine';

export const BaseAlert = Alert;
export const BaseAnchor = Anchor;
export const BaseBurger = Burger;
export const BaseContainer = Container;
export const BaseGrid = Grid;
export const BaseHoverCard = HoverCard;
export const BaseImage = Image;
export const BaseNativeSelect = NativeSelect;
export const BasePagination = Pagination;
export const BasePaper = Paper;
export const BasePasswordInput = PasswordInput;
export const BasePinInput = PinInput;
export const BaseSimpleGrid = SimpleGrid;
export const BaseThemeIcon = ThemeIcon;
export const BaseTimeline = Timeline;
export const BaseUnstyledButton = UnstyledButton;

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

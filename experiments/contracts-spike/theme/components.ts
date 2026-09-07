// Texo's Mantine boundary, ported verbatim in spirit: the theme files import Base* aliases.
import { CodeHighlight } from "@mantine/code-highlight";
import {
  Accordion, Box, Card, Checkbox, ColorInput, Combobox, Group, InputBase, MantineProvider, Menu,
  mergeThemeOverrides, Select, Stack, Switch, Text, Textarea, TextInput, useCombobox,
  type MantineProviderProps, type MantineThemeOverride,
} from "@mantine/core";
import type { ReactNode } from "react";
import { createElement } from "react";

export const BaseAccordion = Accordion;
export const BaseBox = Box;
export const BaseCard = Card;
export const BaseCheckbox = Checkbox;
export const BaseCodeHighlight = CodeHighlight;
export const BaseColorInput = ColorInput;
export const BaseCombobox = Combobox;
export const BaseComboboxPopover = Combobox;
export const BaseGroup = Group;
export const BaseInputBase = InputBase;
export const BaseMenu = Menu;
export const BaseSelect = Select;
export const BaseStack = Stack;
export const BaseSwitch = Switch;
export const BaseText = Text;
export const BaseTextInput = TextInput;
export const BaseTextarea = Textarea;
export const useBaseCombobox = useCombobox;

export function BaseProvider({ children, themeOverride = {}, ...props }: { children: ReactNode; themeOverride?: MantineThemeOverride } & Omit<MantineProviderProps, "theme" | "children">) {
  return createElement(MantineProvider, { theme: mergeThemeOverrides({}, themeOverride), ...props }, children);
}

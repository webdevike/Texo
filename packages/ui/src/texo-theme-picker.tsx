import { IconCheck } from '@tabler/icons-react';
import {
  BaseBox,
  BaseCombobox,
  BaseComboboxPopover,
  BaseGroup,
  BaseInputBase,
  BaseText,
} from './components';
import classes from './texo-theme-picker.module.css';
import type { TexoThemeConfig } from './texo-theme-provider';

export interface TexoThemePickerOption {
  config: TexoThemeConfig;
  label: string;
  value: string;
}

export interface TexoThemePickerProps {
  onChange: (value: string) => void;
  options: TexoThemePickerOption[];
  value: string;
}

function ThemeSwatches({ config }: { config: TexoThemeConfig }) {
  const colors = [
    config.primaryPalette[6],
    config.semantic[config.colorScheme].surface,
    config.semantic[config.colorScheme].border,
    config.semantic[config.colorScheme].text,
  ];

  return (
    <BaseGroup gap={3} wrap="nowrap">
      {colors.map((color, index) => (
        <BaseBox
          key={`${color}-${index}`}
          bg={color}
          h={12}
          w={12}
          style={{
            border: '1px solid var(--mantine-color-default-border)',
            borderRadius: 'var(--mantine-radius-sm)',
          }}
        />
      ))}
    </BaseGroup>
  );
}

export function TexoThemePicker({
  onChange,
  options,
  value,
}: TexoThemePickerProps) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <BaseComboboxPopover
      allowDeselect={false}
      checkIconPosition="right"
      classNames={{ option: classes.option }}
      comboboxProps={{
        dropdownPadding: 0,
        offset: { crossAxis: 12, mainAxis: 8 },
        position: 'bottom-start',
        transitionProps: { duration: 150, transition: 'pop-top-left' },
        width:
          'calc(min(var(--texo-inspector-width), 100vw) - 2 * var(--mantine-spacing-sm))',
      }}
      data={options.map((option) => ({
        label: option.label,
        value: option.value,
      }))}
      maxDropdownHeight={360}
      nothingFoundMessage="No themes found"
      onChange={(nextValue) => nextValue && onChange(nextValue)}
      renderOption={({ option, checked }) => {
        const theme = options.find((item) => item.value === option.value);

        return (
          <BaseGroup gap="sm" justify="space-between" wrap="nowrap" w="100%">
            <BaseGroup gap="sm" wrap="nowrap">
              {theme && <ThemeSwatches config={theme.config} />}
              <BaseText>{option.label}</BaseText>
            </BaseGroup>
            {checked && (
              <IconCheck
                aria-hidden
                color="var(--mantine-color-dimmed)"
                opacity={0.65}
                size={15}
                stroke={1.75}
              />
            )}
          </BaseGroup>
        );
      }}
      searchable
      selectFirstOptionOnDropdownOpen
      withCheckIcon={false}
      value={value}
    >
      <BaseComboboxPopover.Target>
        <BaseInputBase
          component="button"
          pointer
          rightSection={<BaseCombobox.Chevron />}
          rightSectionPointerEvents="none"
          w="100%"
          styles={{
            input: {
              border: 0,
              borderRadius: 0,
              boxShadow: 'none',
              height: '100%',
              paddingInlineStart: 'var(--mantine-spacing-sm)',
            },
            root: { height: '100%' },
            wrapper: { height: '100%' },
          }}
        >
          <BaseGroup gap="xs" wrap="nowrap">
            <ThemeSwatches config={selected.config} />
            <BaseText fw={500} size="sm" truncate>
              {selected.label}
            </BaseText>
          </BaseGroup>
        </BaseInputBase>
      </BaseComboboxPopover.Target>
    </BaseComboboxPopover>
  );
}

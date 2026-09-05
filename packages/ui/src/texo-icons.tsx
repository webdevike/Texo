import {
  IconActivity,
  IconBuilding,
  IconChartBar,
  IconHeart,
  IconHeartFilled,
  IconRocket,
  IconShieldCheck,
  IconShieldCheckFilled,
  IconSparkles,
  IconSparklesFilled,
  IconUsers,
  type IconProps,
} from '@tabler/icons-react';

import {
  BaseCombobox,
  BaseComboboxPopover,
  BaseGroup,
  BaseInputBase,
  BaseSelect,
  BaseStack,
  BaseText,
  BaseTextInput,
} from './components';

export const TEXO_ICONS = {
  activity: IconActivity,
  building: IconBuilding,
  chart: IconChartBar,
  heart: IconHeart,
  rocket: IconRocket,
  shield: IconShieldCheck,
  sparkles: IconSparkles,
  users: IconUsers,
} as const;

const TEXO_FILLED_ICONS = {
  heart: IconHeartFilled,
  shield: IconShieldCheckFilled,
  sparkles: IconSparklesFilled,
} as const;

export type TexoIconName = keyof typeof TEXO_ICONS;
export interface TexoIconValue {
  name: TexoIconName;
  stroke: number;
  variant: 'outline' | 'filled';
}

export function TexoIcon({ value, ...props }: IconProps & { value: TexoIconValue }) {
  const OutlineIcon = TEXO_ICONS[value.name] ?? IconActivity;
  const FilledIcon = TEXO_FILLED_ICONS[value.name as keyof typeof TEXO_FILLED_ICONS];
  const Icon = value.variant === 'filled' && FilledIcon ? FilledIcon : OutlineIcon;
  return <Icon {...props} stroke={value.variant === 'outline' ? value.stroke : undefined} />;
}

export function TexoIconPicker({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: TexoIconValue) => void;
  value: TexoIconValue;
}) {
  const selectedName = value.name in TEXO_ICONS ? value.name : 'activity';
  const supportsFilled = selectedName in TEXO_FILLED_ICONS;
  const selectedValue: TexoIconValue = {
    name: selectedName,
    stroke: Number.isFinite(value.stroke) ? value.stroke : 1.75,
    variant: value.variant === 'filled' && supportsFilled ? 'filled' : 'outline',
  };

  return (
    <BaseStack gap="xs">
      <BaseComboboxPopover
        allowDeselect={false}
        data={Object.keys(TEXO_ICONS).map((name) => ({ label: name, value: name }))}
        onChange={(nextValue) => nextValue && onChange({ ...selectedValue, name: nextValue as TexoIconName, variant: nextValue in TEXO_FILLED_ICONS ? selectedValue.variant : 'outline' })}
        renderOption={({ option }) => (
          <BaseGroup gap="xs">
            <TexoIcon value={{ name: option.value as TexoIconName, stroke: 1.75, variant: 'outline' }} size={16} />
            <BaseText size="sm" tt="capitalize">{option.label}</BaseText>
          </BaseGroup>
        )}
        searchable
        value={selectedName}
      >
        <BaseComboboxPopover.Target>
          <BaseInputBase
            label={label}
            leftSection={<TexoIcon value={selectedValue} size={16} />}
            pointer
            readOnly
            rightSection={<BaseCombobox.Chevron />}
            value={selectedName}
          />
        </BaseComboboxPopover.Target>
      </BaseComboboxPopover>
      <BaseSelect
        data={[
          { label: 'Outline', value: 'outline' },
          { disabled: !supportsFilled, label: 'Filled', value: 'filled' },
        ]}
        label="Variant"
        onChange={(variant) => variant && onChange({ ...selectedValue, variant: variant as TexoIconValue['variant'] })}
        value={selectedValue.variant}
      />
      {selectedValue.variant === 'outline' && (
        <BaseTextInput
          label="Stroke width"
          max={3}
          min={0.5}
          onChange={(event) => onChange({ ...selectedValue, stroke: Number(event.target.value) })}
          step={0.25}
          type="number"
          value={selectedValue.stroke}
        />
      )}
    </BaseStack>
  );
}

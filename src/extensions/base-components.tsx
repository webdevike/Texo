import {
  BaseButton,
  BaseStack,
  BaseText,
  BaseTextInput,
  defineTexoComponent,
} from '@texo/ui';

type ButtonProps = {
  children: string;
  disabled: boolean;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

type TextInputProps = {
  disabled: boolean;
  label: string;
  placeholder: string;
};

type StackProps = {
  firstText: string;
  gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  secondText: string;
};

function StackContent({ firstText, gap, secondText }: StackProps) {
  return (
    <BaseStack gap={gap}>
      <BaseText>{firstText}</BaseText>
      <BaseText>{secondText}</BaseText>
    </BaseStack>
  );
}

export const baseButton = defineTexoComponent<ButtonProps>({
  component: BaseButton,
  defaultProps: { children: 'Button', disabled: false, size: 'md' },
  id: 'base-button',
  name: 'Button',
  properties: {
    children: { default: 'Button', label: 'Label', type: 'string' },
    disabled: { default: false, label: 'Disabled', type: 'boolean' },
    size: {
      default: 'md',
      label: 'Size',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      type: 'enum',
    },
  },
});

export const baseTextInput = defineTexoComponent<TextInputProps>({
  component: BaseTextInput,
  defaultProps: {
    disabled: false,
    label: 'Name',
    placeholder: 'Enter your name',
  },
  id: 'base-text-input',
  name: 'Text input',
  properties: {
    disabled: { default: false, label: 'Disabled', type: 'boolean' },
    label: { default: 'Name', label: 'Label', type: 'string' },
    placeholder: {
      default: 'Enter your name',
      label: 'Placeholder',
      type: 'string',
    },
  },
});

export const baseStack = defineTexoComponent<StackProps>({
  component: StackContent,
  defaultProps: { firstText: 'First', gap: 'md', secondText: 'Second' },
  id: 'base-stack',
  name: 'Stack',
  properties: {
    firstText: { default: 'First', label: 'First text', type: 'string' },
    gap: {
      default: 'md',
      label: 'Gap',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      type: 'enum',
    },
    secondText: { default: 'Second', label: 'Second text', type: 'string' },
  },
});

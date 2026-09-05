import { IconArrowRight } from '@tabler/icons-react';
import {
  BaseBox,
  BaseButton,
  BaseCard,
  BaseGroup,
  BaseStack,
  BaseText,
  BaseTitle,
  TexoIcon,
  type TexoIconValue,
} from '@texo/ui';

export type CustomerHealthCardProps = {
  accent: string;
  actionLabel: string;
  company: string;
  icon: TexoIconValue;
  score: number;
  showTrend: boolean;
  status: string;
};

export function CustomerHealthCard({
  accent,
  actionLabel,
  company,
  icon,
  score,
  showTrend,
  status,
}: CustomerHealthCardProps) {
  const boundedScore = Math.max(0, Math.min(100, score));
  const resolvedAccent =
    accent === 'theme' ? 'var(--mantine-primary-color-filled)' : accent;

  return (
    <BaseCard padding="lg" withBorder>
      <BaseStack gap="md">
        <BaseGroup justify="space-between">
          <BaseGroup gap="xs">
            <TexoIcon color={resolvedAccent} value={icon} size={18} />
            <BaseText fw={600}>{company}</BaseText>
          </BaseGroup>
          <BaseText c="dimmed" size="sm">{status}</BaseText>
        </BaseGroup>
        <div>
          <BaseTitle order={2}>{boundedScore}%</BaseTitle>
          <BaseText c="dimmed" size="sm">Customer health score</BaseText>
        </div>
        {showTrend && (
          <BaseBox bg="var(--texo-color-muted)" h={8} style={{ borderRadius: 'var(--mantine-radius-xl)', overflow: 'hidden' }}>
            <BaseBox bg={resolvedAccent} h="100%" w={`${boundedScore}%`} />
          </BaseBox>
        )}
        <BaseButton rightSection={<IconArrowRight size={15} />} variant="light">
          {actionLabel}
        </BaseButton>
      </BaseStack>
    </BaseCard>
  );
}

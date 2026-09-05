import { IconMinus, IconPlus } from '@tabler/icons-react';
import {
  BaseActionIcon,
  BaseBox,
  BaseButton,
  BaseCard,
  BaseGroup,
  BaseSelect,
  BaseCheckbox,
  BaseStack,
  BaseSwitch,
  BaseText,
  BaseTextInput,
  BaseTextarea,
  BaseTitle,
} from '@texo/ui';

import classes from './cards-page.module.css';
import { ThemedLineChart } from './themed-line-chart';

function MetricCard({
  change,
  label,
  points,
  value,
}: {
  change: string;
  label: string;
  points: readonly number[];
  value: string;
}) {
  return (
    <BaseCard className={`${classes.card} ${classes.revenue}`} padding="lg">
      <BaseStack gap="xs">
        <BaseText c="dimmed" size="sm">{label}</BaseText>
        <BaseText className={classes.metricValue}>{value}</BaseText>
        <BaseText c="dimmed" size="sm">{change}</BaseText>
        <BaseBox className={classes.chart}>
          <ThemedLineChart
            ariaLabel={`${label} trend`}
            height={96}
            series={[{ points, stroke: 'var(--texo-chart-1)' }]}
          />
        </BaseBox>
      </BaseStack>
    </BaseCard>
  );
}

function CalendarCard() {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <BaseCard className={`${classes.card} ${classes.calendar}`} padding="md">
      <BaseStack gap="md">
        <BaseGroup justify="space-between">
          <BaseText fw={600}>June</BaseText>
          <BaseText c="dimmed" size="sm">2025</BaseText>
        </BaseGroup>
        <BaseBox className={classes.calendarGrid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <BaseText c="dimmed" key={`${day}-${index}`} size="xs">{day}</BaseText>
          ))}
          {days.map((day) => (
            <BaseText
              bg={day === 12 || day === 19 ? 'var(--mantine-primary-color-light)' : undefined}
              c={day === 12 || day === 19 ? 'var(--mantine-primary-color-light-color)' : undefined}
              key={day}
              py={4}
              size="xs"
              style={{ borderRadius: 'var(--mantine-radius-sm)' }}
            >
              {day <= 30 ? day : day - 30}
            </BaseText>
          ))}
        </BaseBox>
      </BaseStack>
    </BaseCard>
  );
}

function GoalCard() {
  const bars = [58, 42, 36, 49, 41, 52, 38, 50, 43, 55];

  return (
    <BaseCard className={`${classes.card} ${classes.goal}`} padding="lg">
      <BaseStack gap="md">
        <div>
          <BaseText fw={600}>Move Goal</BaseText>
          <BaseText c="dimmed" size="sm">Set your daily activity goal.</BaseText>
        </div>
        <BaseGroup justify="center">
          <BaseActionIcon aria-label="Decrease goal" variant="default"><IconMinus size={14} /></BaseActionIcon>
          <BaseText className={classes.metricValue}>350</BaseText>
          <BaseActionIcon aria-label="Increase goal" variant="default"><IconPlus size={14} /></BaseActionIcon>
        </BaseGroup>
        <BaseBox className={classes.goalBars}>
          {bars.map((height, index) => (
            <BaseBox className={classes.goalBar} h={height} key={index} />
          ))}
        </BaseBox>
        <BaseButton variant="light">Set goal</BaseButton>
      </BaseStack>
    </BaseCard>
  );
}

function UpgradeCard() {
  return (
    <BaseCard className={`${classes.card} ${classes.upgrade}`} padding="lg">
      <BaseStack>
        <div>
          <BaseTitle order={3}>Upgrade your subscription</BaseTitle>
          <BaseText c="dimmed" size="sm">Choose the plan that fits your team.</BaseText>
        </div>
        <BaseGroup grow>
          <BaseTextInput label="Name" placeholder="Alex Rivera" />
          <BaseTextInput label="Email" placeholder="alex@example.com" />
        </BaseGroup>
        <BaseTextInput label="Card number" placeholder="1234 1234 1234 1234" />
        <BaseSelect data={['Starter plan', 'Pro plan', 'Enterprise']} label="Plan" defaultValue="Starter plan" />
        <BaseTextarea label="Notes" placeholder="Anything we should know?" />
        <BaseCheckbox label="I agree to the terms and conditions" />
        <BaseCheckbox defaultChecked label="Allow us to send you emails" />
        <BaseButton>Upgrade</BaseButton>
      </BaseStack>
    </BaseCard>
  );
}

function AccountCard() {
  return (
    <BaseCard className={`${classes.card} ${classes.account}`} padding="lg">
      <BaseStack>
        <div>
          <BaseTitle order={3}>Create an account</BaseTitle>
          <BaseText c="dimmed" size="sm">Enter your details to get started.</BaseText>
        </div>
        <BaseGroup grow>
          <BaseButton variant="default">GitHub</BaseButton>
          <BaseButton variant="default">Google</BaseButton>
        </BaseGroup>
        <BaseTextInput label="Email" placeholder="you@example.com" />
        <BaseTextInput label="Password" placeholder="Your password" type="password" />
        <BaseSwitch label="Email me product updates" />
        <BaseButton>Create account</BaseButton>
      </BaseStack>
    </BaseCard>
  );
}

function ActivityCard() {
  return (
    <BaseCard className={`${classes.card} ${classes.activity}`} padding="lg">
      <BaseStack>
        <div>
          <BaseTitle order={3}>Exercise minutes</BaseTitle>
          <BaseText c="dimmed" size="sm">Your activity is ahead of your normal range.</BaseText>
        </div>
        <BaseBox className={classes.chart}>
          <ThemedLineChart
            ariaLabel="Exercise minutes by day"
            height={96}
            series={[
              { points: [68, 72, 80, 52, 65, 54, 69, 61, 74], stroke: 'var(--texo-chart-2)' },
              { points: [76, 86, 16, 72, 61, 70, 62, 68, 54], stroke: 'var(--texo-chart-1)' },
            ]}
          />
        </BaseBox>
        <BaseGroup justify="space-between">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <BaseText c="dimmed" key={day} size="xs">{day}</BaseText>
          ))}
        </BaseGroup>
      </BaseStack>
    </BaseCard>
  );
}

function ProfileCard() {
  return (
    <BaseCard className={`${classes.card} ${classes.profile}`} padding="lg">
      <BaseStack>
        <BaseGroup justify="space-between">
          <div>
            <BaseText fw={600}>Sofia Davis</BaseText>
            <BaseText c="dimmed" size="sm">m@example.com</BaseText>
          </div>
          <BaseActionIcon aria-label="Add contact" variant="subtle"><IconPlus size={16} /></BaseActionIcon>
        </BaseGroup>
        <BaseBox bg="var(--mantine-color-default-hover)" p="md" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
          <BaseText size="sm">Hi, how can I help you today?</BaseText>
        </BaseBox>
        <BaseTextInput placeholder="Write a message..." />
      </BaseStack>
    </BaseCard>
  );
}

function PaymentsCard() {
  return (
    <BaseCard className={`${classes.card} ${classes.payments}`} padding="lg">
      <BaseStack>
        <div>
          <BaseTitle order={3}>Payments</BaseTitle>
          <BaseText c="dimmed" size="sm">Manage recent transactions.</BaseText>
        </div>
        {[
          ['Acme Inc.', '$1,250.00', 'Paid'],
          ['Northstar Labs', '$840.00', 'Pending'],
          ['Signal Works', '$2,400.00', 'Paid'],
        ].map(([company, amount, status]) => (
          <BaseGroup justify="space-between" key={company} py="xs">
            <div>
              <BaseText fw={500}>{company}</BaseText>
              <BaseText c="dimmed" size="xs">{status}</BaseText>
            </div>
            <BaseText fw={600}>{amount}</BaseText>
          </BaseGroup>
        ))}
      </BaseStack>
    </BaseCard>
  );
}

export function CardsPage() {
  return (
    <BaseBox className={classes.grid}>
      <MetricCard change="+20.1% from last month" label="Total revenue" points={[72, 58, 70, 74, 65, 62, 18, 12]} value="$15,231.89" />
      <MetricCard change="+180.1% from last month" label="Subscriptions" points={[78, 70, 48, 18, 72, 30, 68, 64]} value="+2,350" />
      <CalendarCard />
      <GoalCard />
      <UpgradeCard />
      <AccountCard />
      <ProfileCard />
      <ActivityCard />
      <PaymentsCard />
    </BaseBox>
  );
}

import { IconCircleCheck, IconPhoneOff, IconSearch } from '@tabler/icons-react';
import {
  BaseBadge,
  BaseBox,
  BaseButton,
  BaseCard,
  BaseDivider,
  BaseGroup,
  BaseHoverCard,
  BaseStack,
  BaseTable,
  BaseText,
  BaseTextInput,
  BaseTooltip,
} from '@texo/ui';
import { useMemo, useState } from 'react';

// Redesign of the GoodOps "Call activity" card (apps/api/src/routes/_admin/delinquency.tsx).
// The component registry's prop schema is flat scalars only, so the component owns fixed
// demo rows shaped like the real `DashboardData['recentCalls']` rows. When the design is
// settled, port this file to apps/api/src/components/CallActivity.tsx and feed it real data.

export type CallActivityProps = {
  title: string;
  subtitle: string;
  density: 'comfortable' | 'compact';
  showSummary: boolean;
  showQuickFilters: boolean;
  showSearch: boolean;
  showBranch: boolean;
  showAttempts: boolean;
  maxAttempts: number;
  empty: boolean;
};

type CallStatus =
  | 'texted'
  | 'queued'
  | 'dispatched'
  | 'cancelling'
  | 'cancelled'
  | 'answered'
  | 'no_answer'
  | 'voicemail'
  | 'opted_out'
  | 'paid'
  | 'failed';

type DemoCall = {
  id: string;
  name: string;
  phoneMasked: string;
  officeName: string;
  balanceCents: number;
  ageDays: number;
  status: CallStatus;
  outcome: string | null;
  paid: boolean;
  paidAmountCents: number | null;
  paidLabel: string | null;
  attempts: number;
  exhausted: boolean;
  at: string;
};

const STATUS_COLORS: Record<CallStatus, string> = {
  texted: 'primary',
  queued: 'gray',
  dispatched: 'blue',
  cancelling: 'orange',
  cancelled: 'gray',
  answered: 'primary',
  no_answer: 'yellow',
  voicemail: 'grape',
  opted_out: 'orange',
  paid: 'green',
  failed: 'red',
};

const STATUS_HELP: Partial<Record<CallStatus, string>> = {
  dispatched: 'Handed to the dialer and ringing or queued. The call has not been answered or completed yet.',
  queued: 'Selected in this scan but not yet handed to the dialer.',
  cancelling: 'A provider limit was detected and the remaining batch is being stopped.',
  cancelled: 'Not called. The provider batch stopped after its first quota or billing failure.',
  no_answer: 'Rang with no pickup; no voicemail was left.',
  voicemail: 'Reached voicemail; the agent left a message.',
  texted: 'Reminder sent by text only. No call was placed.',
};

const DEMO: DemoCall[] = [
  { id: '1', name: 'Brad Hunt', phoneMasked: '(512) ***-4471', officeName: 'Austin', balanceCents: 18900, ageDays: 41, status: 'paid', outcome: 'Paid via pay link', paid: true, paidAmountCents: 18900, paidLabel: 'Confident', attempts: 1, exhausted: false, at: 'Sep 9, 9:03 AM CDT' },
  { id: '2', name: 'Lisa Joy', phoneMasked: '(214) ***-2208', officeName: 'Dallas', balanceCents: 24550, ageDays: 63, status: 'voicemail', outcome: 'Left voicemail with pay link', paid: false, paidAmountCents: null, paidLabel: null, attempts: 2, exhausted: false, at: 'Sep 9, 8:47 AM CDT' },
  { id: '3', name: 'Stacey Reagon', phoneMasked: '(713) ***-9910', officeName: 'Houston', balanceCents: 9800, ageDays: 34, status: 'answered', outcome: 'Promised to pay Friday', paid: false, paidAmountCents: null, paidLabel: null, attempts: 1, exhausted: false, at: 'Sep 8, 3:15 PM CDT' },
  { id: '4', name: 'Johnny McDonald', phoneMasked: '(512) ***-0034', officeName: 'Austin', balanceCents: 41200, ageDays: 88, status: 'no_answer', outcome: null, paid: false, paidAmountCents: null, paidLabel: null, attempts: 3, exhausted: true, at: 'Sep 8, 11:20 AM CDT' },
  { id: '5', name: 'Bennie Mcclellan', phoneMasked: '(214) ***-7781', officeName: 'Dallas', balanceCents: 15075, ageDays: 52, status: 'opted_out', outcome: 'Asked not to be called', paid: false, paidAmountCents: null, paidLabel: null, attempts: 1, exhausted: false, at: 'Sep 7, 4:02 PM CDT' },
  { id: '6', name: 'Maria Ortega', phoneMasked: '(713) ***-1150', officeName: 'Houston', balanceCents: 7200, ageDays: 31, status: 'texted', outcome: null, paid: true, paidAmountCents: 7200, paidLabel: 'Likely', attempts: 1, exhausted: false, at: 'Sep 7, 10:31 AM CDT' },
  { id: '7', name: 'Derek Walsh', phoneMasked: '(512) ***-6629', officeName: 'Austin', balanceCents: 30400, ageDays: 75, status: 'dispatched', outcome: null, paid: false, paidAmountCents: null, paidLabel: null, attempts: 2, exhausted: false, at: 'Sep 7, 9:58 AM CDT' },
  { id: '8', name: 'Anita Shah', phoneMasked: '(214) ***-3312', officeName: 'Dallas', balanceCents: 12650, ageDays: 45, status: 'failed', outcome: 'Carrier rejected the call', paid: false, paidAmountCents: null, paidLabel: null, attempts: 1, exhausted: false, at: 'Sep 6, 2:44 PM CDT' },
];

type Quick = 'all' | 'paid' | 'unpaid' | 'exhausted';

const QUICK: Array<{ id: Quick; label: string; test: (call: DemoCall) => boolean }> = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'paid', label: 'Paid', test: (call) => call.paid },
  { id: 'unpaid', label: 'Unpaid', test: (call) => !call.paid },
  { id: 'exhausted', label: 'Max calls', test: (call) => call.exhausted },
];

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Summary({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <BaseStack gap={0} align="flex-end">
      <BaseText size="lg" fw={700} lh={1.2} c={color}>
        {value}
      </BaseText>
      <BaseText size="xs" c="dimmed">
        {label}
      </BaseText>
    </BaseStack>
  );
}

function PaidBadge({ call }: { call: DemoCall }) {
  if (!call.paid || call.paidAmountCents === null) return <BaseText c="dimmed">–</BaseText>;
  return (
    <BaseHoverCard width={280} shadow="md" withinPortal openDelay={150}>
      <BaseHoverCard.Target>
        <span style={{ display: 'inline-flex' }}>
          <BaseBadge color="green" variant="light" leftSection={<IconCircleCheck size={12} />}>
            Paid
          </BaseBadge>
        </span>
      </BaseHoverCard.Target>
      <BaseHoverCard.Dropdown>
        <BaseStack gap={6}>
          <BaseGroup justify="space-between" align="baseline">
            <BaseText fw={700}>{usd(call.paidAmountCents)}</BaseText>
            <BaseBadge color="green" variant="light">
              {call.paidLabel}
            </BaseBadge>
          </BaseGroup>
          <BaseText size="sm">Paid after outreach and linked to this call.</BaseText>
        </BaseStack>
      </BaseHoverCard.Dropdown>
    </BaseHoverCard>
  );
}

function AttemptDots({ attempts, max, exhausted }: { attempts: number; max: number; exhausted: boolean }) {
  const total = Math.max(max, attempts, 1);
  return (
    <BaseGroup gap={3} justify="flex-end" wrap="nowrap" aria-label={`${attempts} of ${total} calls`}>
      {Array.from({ length: total }, (_, index) => (
        <BaseBox
          key={index}
          w={6}
          h={6}
          style={{
            borderRadius: '50%',
            background:
              index < attempts
                ? exhausted
                  ? 'var(--mantine-color-red-6)'
                  : 'var(--mantine-primary-color-filled)'
                : 'var(--mantine-color-default-border)',
          }}
        />
      ))}
      <BaseText size="sm" ml={4} w={18} ta="right">
        {attempts}
      </BaseText>
    </BaseGroup>
  );
}

export function CallActivity({
  title,
  subtitle,
  density,
  showSummary,
  showQuickFilters,
  showSearch,
  showBranch,
  showAttempts,
  maxAttempts,
  empty,
}: CallActivityProps) {
  const [quick, setQuick] = useState<Quick>('all');
  const [search, setSearch] = useState('');
  const source = empty ? [] : DEMO;

  const rows = useMemo(() => {
    const quickTest = QUICK.find((q) => q.id === quick)?.test ?? (() => true);
    const needle = search.trim().toLowerCase();
    return source.filter(
      (call) =>
        quickTest(call) &&
        (!needle ||
          call.name.toLowerCase().includes(needle) ||
          call.phoneMasked.includes(needle) ||
          (call.outcome ?? '').toLowerCase().includes(needle)),
    );
  }, [source, quick, search]);

  const answered = source.filter((c) => c.status === 'answered' || c.status === 'paid').length;
  const collected = source.reduce((sum, c) => sum + (c.paidAmountCents ?? 0), 0);
  const spacing = density === 'compact' ? 6 : 'sm';

  return (
    // miw: the gallery stage caps children at 420px; a table needs the room. Drop on port.
    <BaseCard withBorder radius="md" p={0} miw="min(100%, 1040px)" data-target="calls" data-target-label="Call activity">
      <BaseGroup justify="space-between" align="flex-start" p="lg" pb="md" data-target="header" data-target-label="Header">
        <div>
          <BaseText fw={700}>{title}</BaseText>
          <BaseText size="xs" c="dimmed">
            {subtitle}
          </BaseText>
        </div>
        {showSummary && (
          <BaseGroup gap="xl" data-target="summary" data-target-label="Summary">
            <Summary label="Calls" value={String(source.length)} />
            <Summary label="Answered" value={String(answered)} />
            <Summary label="Collected" value={usd(collected)} color="green.7" />
          </BaseGroup>
        )}
      </BaseGroup>

      {(showQuickFilters || showSearch) && (
        <BaseGroup justify="space-between" px="lg" pb="md" gap="sm" data-target="filters" data-target-label="Filters">
          {showQuickFilters ? (
            <BaseGroup gap={6} data-target="quick" data-target-label="Quick filters">
              {QUICK.map((q) => {
                const count = new Set(source.filter(q.test).map((call) => call.name)).size;
                const active = quick === q.id;
                return (
                  <BaseButton
                    key={q.id}
                    size="compact-sm"
                    radius="xl"
                    variant={active ? 'filled' : 'default'}
                    onClick={() => setQuick(q.id)}
                    data-record={q.id}
                    data-record-label={q.label}
                  >
                    {q.label}
                    <BaseText component="span" size="xs" ml={6} c={active ? undefined : 'dimmed'}>
                      {count}
                    </BaseText>
                  </BaseButton>
                );
              })}
            </BaseGroup>
          ) : (
            <span />
          )}
          {showSearch && (
            <BaseTextInput
              size="sm"
              w={260}
              placeholder="Search name, phone, outcome"
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              data-target="search"
              data-target-label="Search"
            />
          )}
        </BaseGroup>
      )}

      <BaseDivider />

      {rows.length === 0 ? (
        <BaseStack align="center" py="xl" gap={4} data-target="empty" data-target-label="Empty state">
          <BaseText fw={600}>No calls yet</BaseText>
          <BaseText size="sm" c="dimmed">
            {source.length === 0 ? 'Calls appear here as the program places them.' : 'No calls match these filters.'}
          </BaseText>
        </BaseStack>
      ) : (
        <BaseTable.ScrollContainer minWidth={720}>
          <BaseTable
            highlightOnHover
            verticalSpacing={spacing}
            horizontalSpacing="lg"
            data-target="table"
            data-target-label="Table"
          >
            <BaseTable.Thead>
              <BaseTable.Tr>
                <BaseTable.Th>Customer</BaseTable.Th>
                {showBranch && <BaseTable.Th ta="center">Branch</BaseTable.Th>}
                <BaseTable.Th ta="right">Balance</BaseTable.Th>
                <BaseTable.Th ta="right">Age</BaseTable.Th>
                <BaseTable.Th ta="center">Status</BaseTable.Th>
                <BaseTable.Th ta="center">Paid</BaseTable.Th>
                {showAttempts && <BaseTable.Th ta="right">Calls</BaseTable.Th>}
                <BaseTable.Th ta="center">When</BaseTable.Th>
              </BaseTable.Tr>
            </BaseTable.Thead>
            <BaseTable.Tbody>
              {rows.map((call, index) => {
                const help = STATUS_HELP[call.status] ?? call.outcome ?? undefined;
                return (
                  <BaseTable.Tr
                    key={call.id}
                    style={{ cursor: 'pointer' }}
                    data-target="row"
                    data-target-label="Row"
                    data-record={call.id}
                    data-record-label={call.name}
                    data-record-template={index === 0 ? '' : undefined}
                  >
                    <BaseTable.Td>
                      <BaseGroup gap={6} wrap="nowrap">
                        <BaseText fw={500} size="sm" c="primary">
                          {call.name}
                        </BaseText>
                        {call.exhausted && (
                          <BaseTooltip
                            label={`Reached the program's ${maxAttempts}-call limit without paying or opting out. Follow up by hand.`}
                            multiline
                            w={240}
                          >
                            <BaseBadge color="red" variant="light" size="xs" leftSection={<IconPhoneOff size={10} />}>
                              Max calls
                            </BaseBadge>
                          </BaseTooltip>
                        )}
                      </BaseGroup>
                      <BaseText size="xs" c="dimmed" ff="monospace">
                        {call.phoneMasked}
                      </BaseText>
                    </BaseTable.Td>
                    {showBranch && (
                      <BaseTable.Td ta="center">
                        <BaseText size="sm">{call.officeName}</BaseText>
                      </BaseTable.Td>
                    )}
                    <BaseTable.Td ta="right">
                      <BaseText size="sm" fw={600}>
                        {usd(call.balanceCents)}
                      </BaseText>
                    </BaseTable.Td>
                    <BaseTable.Td ta="right">
                      <BaseText size="sm" c={call.ageDays >= 60 ? 'orange.7' : undefined}>
                        {call.ageDays}d
                      </BaseText>
                    </BaseTable.Td>
                    <BaseTable.Td ta="center">
                      <BaseTooltip label={help} disabled={!help} multiline w={240}>
                        <BaseBadge color={STATUS_COLORS[call.status]} variant="light" tt="capitalize">
                          {call.status.replace('_', ' ')}
                        </BaseBadge>
                      </BaseTooltip>
                    </BaseTable.Td>
                    <BaseTable.Td ta="center">
                      <PaidBadge call={call} />
                    </BaseTable.Td>
                    {showAttempts && (
                      <BaseTable.Td ta="right">
                        <AttemptDots attempts={call.attempts} max={maxAttempts} exhausted={call.exhausted} />
                      </BaseTable.Td>
                    )}
                    <BaseTable.Td ta="center">
                      <BaseText size="sm" c="dimmed">
                        {call.at}
                      </BaseText>
                    </BaseTable.Td>
                  </BaseTable.Tr>
                );
              })}
            </BaseTable.Tbody>
          </BaseTable>
        </BaseTable.ScrollContainer>
      )}

      <BaseDivider />
      <BaseGroup justify="space-between" px="lg" py="sm" data-target="footer" data-target-label="Footer">
        <BaseText size="xs" c="dimmed">
          {rows.length} of {source.length} call records
        </BaseText>
        <BaseText size="xs" c="dimmed">
          Times shown in each branch's local time
        </BaseText>
      </BaseGroup>
    </BaseCard>
  );
}

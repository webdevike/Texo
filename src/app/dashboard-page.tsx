import { useState } from 'react';
import {
  IconAdjustmentsHorizontal,
  IconChartBar,
  IconChevronDown,
  IconCirclePlus,
  IconDatabase,
  IconDots,
  IconFile,
  IconFileText,
  IconFolder,
  IconHelpCircle,
  IconLayoutDashboard,
  IconListDetails,
  IconPlus,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTableColumn,
  IconUsers,
} from '@tabler/icons-react';
import {
  BaseActionIcon,
  BaseBox,
  BaseButton,
  BaseCard,
  BaseCheckbox,
  BaseGroup,
  BaseMenu,
  BaseNavLink,
  BaseStack,
  BaseText,
  BaseTitle,
} from '@texo/ui';

import { BusinessMetricsCharts } from './business-metrics-charts';
import { ThemedLineChart } from './themed-line-chart';
import classes from './dashboard-page.module.css';

const primaryNav = [
  [IconCirclePlus, 'Quick Create'],
  [IconLayoutDashboard, 'Dashboard'],
  [IconListDetails, 'Lifecycle'],
  [IconChartBar, 'Analytics'],
  [IconFolder, 'Projects'],
  [IconUsers, 'Team'],
] as const;

const documentNav = [
  [IconDatabase, 'Data Library'],
  [IconFileText, 'Reports'],
  [IconFile, 'Word Assistant'],
  [IconDots, 'More'],
] as const;

const rows = [
  ['Cover page', 'Cover page', '18', '5', 'Eddie Lake'],
  ['Table of contents', 'Table of contents', '29', '24', 'Eddie Lake'],
  ['Executive summary', 'Narrative', '10', '13', 'Eddie Lake'],
  ['Technical approach', 'Narrative', '27', '23', 'Jamir Washington'],
];

function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: typeof IconSearch;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <BaseNavLink
      active={active}
      className={classes.navItem}
      label={label}
      leftSection={<Icon size={15} stroke={1.7} />}
      onClick={onClick}
    />
  );
}

function MetricCard({ change, detail, label, note, value }: { change: string; detail: string; label: string; note: string; value: string }) {
  return (
    <BaseCard className={classes.metricCard} padding="md">
      <BaseStack gap="sm">
        <BaseGroup align="flex-start" justify="space-between" wrap="nowrap">
          <div>
            <BaseText c="dimmed" size="xs">{label}</BaseText>
            <BaseTitle className={classes.metricValue} order={3}>{value}</BaseTitle>
          </div>
          <BaseText className={classes.change} size="xs">{change}</BaseText>
        </BaseGroup>
        <div>
          <BaseText fw={500} size="xs">{note}</BaseText>
          <BaseText c="dimmed" size="xs">{detail}</BaseText>
        </div>
      </BaseStack>
    </BaseCard>
  );
}

function VisitorsChart({
  period,
  onPeriodChange,
}: {
  period: string;
  onPeriodChange: (period: string) => void;
}) {
  const periods = ['Last 3 months', 'Last 30 days', 'Last 7 days'];

  return (
    <BaseCard className={classes.visitors} padding="md">
      <BaseGroup align="flex-start" justify="space-between">
        <div>
          <BaseText fw={600} size="sm">Total Visitors</BaseText>
          <BaseText c="dimmed" size="xs">{period}</BaseText>
        </div>
        <BaseGroup className={classes.periods} gap={0} wrap="nowrap">
          {periods.map((item) => (
            <BaseButton
              key={item}
              onClick={() => onPeriodChange(item)}
              size="compact-xs"
              variant={period === item ? 'filled' : 'subtle'}
            >
              {item}
            </BaseButton>
          ))}
        </BaseGroup>
      </BaseGroup>
      <BaseBox className={classes.chart}>
        <ThemedLineChart
          ariaLabel="Visitors over the selected period"
          height={190}
          series={[
            {
              area: true,
              fill: 'color-mix(in srgb, var(--texo-chart-2) 28%, transparent)',
              points: [28, 82, 34, 74, 42, 68, 38, 88, 32, 76, 45, 91, 39, 72, 36, 84, 43, 79],
              stroke: 'var(--texo-chart-2)',
            },
            {
              area: true,
              fill: 'color-mix(in srgb, var(--texo-chart-1) 22%, transparent)',
              points: [18, 38, 22, 43, 29, 49, 21, 46, 25, 51, 31, 55, 27, 48, 24, 52, 30, 47],
              stroke: 'var(--texo-chart-1)',
            },
          ]}
        />
      </BaseBox>
    </BaseCard>
  );
}

export function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Quick Create');
  const [period, setPeriod] = useState('Last 30 days');
  const [view, setView] = useState('Outline');
  const [tableRows, setTableRows] = useState(rows);
  return (
    <BaseBox className={classes.dashboard}>
      <BaseBox component="aside" className={classes.sidebar}>
        <BaseGroup gap="xs" mb="md"><IconSparkles size={16} /><BaseText fw={600} size="sm">Acme Inc.</BaseText></BaseGroup>
        <BaseStack gap={2}>
          {primaryNav.map(([icon, label]) => (
            <NavItem active={activeNav === label} icon={icon} key={label} label={label} onClick={() => setActiveNav(label)} />
          ))}
        </BaseStack>
        <BaseText c="dimmed" className={classes.sectionLabel} size="xs">Documents</BaseText>
        <BaseStack gap={2}>
          {documentNav.map(([icon, label]) => (
            <NavItem active={activeNav === label} icon={icon} key={label} label={label} onClick={() => setActiveNav(label)} />
          ))}
        </BaseStack>
        <BaseStack className={classes.utilityNav} gap={2}>
          <NavItem active={activeNav === 'Settings'} icon={IconSettings} label="Settings" onClick={() => setActiveNav('Settings')} />
          <NavItem active={activeNav === 'Get Help'} icon={IconHelpCircle} label="Get Help" onClick={() => setActiveNav('Get Help')} />
          <NavItem active={activeNav === 'Search'} icon={IconSearch} label="Search" onClick={() => setActiveNav('Search')} />
        </BaseStack>
        <BaseMenu position="top-start">
          <BaseMenu.Target>
            <BaseGroup className={classes.profile} gap="xs" wrap="nowrap">
              <BaseBox className={classes.avatar}>CN</BaseBox>
              <div><BaseText fw={500} size="xs">shadcn</BaseText><BaseText c="dimmed" size="xs">m@example.com</BaseText></div>
              <IconDots size={15} />
            </BaseGroup>
          </BaseMenu.Target>
          <BaseMenu.Dropdown>
            <BaseMenu.Item>Account settings</BaseMenu.Item>
            <BaseMenu.Item>Switch workspace</BaseMenu.Item>
            <BaseMenu.Divider />
            <BaseMenu.Item>Sign out</BaseMenu.Item>
          </BaseMenu.Dropdown>
        </BaseMenu>
      </BaseBox>

      <BaseBox className={classes.content}>
        <BaseGroup className={classes.topbar} gap="sm"><IconTableColumn size={16} /><BaseText fw={600} size="sm">Documents</BaseText></BaseGroup>
        <BaseBox className={classes.body}>
          <BaseBox className={classes.metrics}>
            <MetricCard change="+12.5%" detail="Visitors for the last 6 months" label="Total Revenue" note="Trending up this month" value="$1,250.00" />
            <MetricCard change="-20%" detail="Acquisition needs attention" label="New Customers" note="Down 20% this period" value="1,234" />
            <MetricCard change="+12.5%" detail="Engagement exceeded targets" label="Active Accounts" note="Strong user retention" value="45,678" />
            <MetricCard change="+4.5%" detail="Meets growth projections" label="Growth Rate" note="Steady performance" value="4.5%" />
          </BaseBox>
          <VisitorsChart onPeriodChange={setPeriod} period={period} />
          <BusinessMetricsCharts />
          <BaseGroup className={classes.tableToolbar} justify="space-between">
            <BaseGroup className={classes.viewTabs} gap={2}>
              {['Outline', 'Past Performance', 'Key Personnel', 'Focus Documents'].map((item) => (
                <BaseButton key={item} onClick={() => setView(item)} size="compact-xs" variant={view === item ? 'default' : 'subtle'}>{item}</BaseButton>
              ))}
            </BaseGroup>
            <BaseGroup gap="xs">
              <BaseMenu position="bottom-end">
                <BaseMenu.Target>
                  <BaseButton leftSection={<IconAdjustmentsHorizontal size={14} />} rightSection={<IconChevronDown size={13} />} size="compact-sm" variant="default">Customize Columns</BaseButton>
                </BaseMenu.Target>
                <BaseMenu.Dropdown>
                  <BaseMenu.Label>Visible columns</BaseMenu.Label>
                  <BaseMenu.Item closeMenuOnClick={false}>Section type</BaseMenu.Item>
                  <BaseMenu.Item closeMenuOnClick={false}>Target and limit</BaseMenu.Item>
                  <BaseMenu.Item closeMenuOnClick={false}>Reviewer</BaseMenu.Item>
                </BaseMenu.Dropdown>
              </BaseMenu>
              <BaseButton
                leftSection={<IconPlus size={14} />}
                onClick={() => setTableRows((current) => [...current, [`Untitled section ${current.length + 1}`, 'Narrative', '0', '0', 'Unassigned']])}
                size="compact-sm"
                variant="default"
              >
                Add Section
              </BaseButton>
            </BaseGroup>
          </BaseGroup>
          <BaseBox className={classes.table}>
            <BaseBox className={`${classes.tableRow} ${classes.tableHead}`}><span /><span>Header</span><span>Section Type</span><span>Target</span><span>Limit</span><span>Reviewer</span><span /></BaseBox>
            {tableRows.map(([title, type, target, limit, reviewer]) => (
              <BaseBox className={classes.tableRow} key={title}>
                <IconDots size={14} />
                <BaseGroup gap="xs" wrap="nowrap"><BaseCheckbox aria-label={`Select ${title}`} size="xs" /><BaseText size="xs">{title}</BaseText></BaseGroup>
                <BaseText className={classes.pill} size="xs">{type}</BaseText>
                <BaseText className={classes.number} size="xs">{target}</BaseText>
                <BaseText className={classes.number} size="xs">{limit}</BaseText>
                <BaseText size="xs">{reviewer}</BaseText>
                <BaseMenu position="bottom-end">
                  <BaseMenu.Target>
                    <BaseActionIcon aria-label={`More actions for ${title}`} size="sm" variant="subtle"><IconDots size={14} /></BaseActionIcon>
                  </BaseMenu.Target>
                  <BaseMenu.Dropdown>
                    <BaseMenu.Item>Rename</BaseMenu.Item>
                    <BaseMenu.Item>Duplicate</BaseMenu.Item>
                    <BaseMenu.Item color="red">Delete</BaseMenu.Item>
                  </BaseMenu.Dropdown>
                </BaseMenu>
              </BaseBox>
            ))}
          </BaseBox>
        </BaseBox>
      </BaseBox>
    </BaseBox>
  );
}

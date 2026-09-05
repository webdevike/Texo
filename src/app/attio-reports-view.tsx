import type { ReactNode } from 'react';
import {
  IconAdjustments,
  IconBuilding,
  IconChevronDown,
  IconDownload,
  IconFilter,
  IconLink,
  IconPlus,
  IconSearch,
  IconSparkles,
} from '@tabler/icons-react';
import {
  BaseActionIcon,
  BaseBox,
  BaseButton,
  BaseGroup,
  BaseMenu,
  BaseStack,
  BaseText,
  TexoTable,
  type TexoTableColumn,
  type TexoTableRow,
} from '@texo/ui';

import classes from './attio-reports-view.module.css';

const companies = [
  ['Vercel', 'vercel.com', 'Vercel · Expansion', 'Excellent', '$100M–$250M'],
  ['Cursor', 'cursor.com', 'Cursor', 'Excellent', '$500M–$1B'],
  ['GitHub', 'github.com', 'GitHub · x20 Enterprise', 'Low', 'AI is thinking…'],
  ['Stripe', 'stripe.com', 'Stripe', 'Low', 'AI is thinking…'],
  ['Figma', 'figma.com', 'Figma', 'AI is thinking…', 'AI is thinking…'],
  ['Intercom', 'intercom.com', 'Intercom · Automation', 'Medium', '$250M–$500M'],
  ['ElevenLabs', 'elevenlabs.io', 'ElevenLabs', 'Excellent', '$150M–$250M'],
  ['Notion', 'notion.so', 'Notion · Exec', 'Good', 'AI is thinking…'],
  ['Slack', 'slack.com', 'Slack · Expansion', 'Low', 'AI is thinking…'],
  ['Sierra', 'sierra.ai', 'Sierra', 'AI is thinking…', 'AI is thinking…'],
  ['Retool', 'retool.com', 'Retool', 'Excellent', '$50M–$100M'],
] as const;

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <BaseText className={classes.badge} data-tone={tone} size="xs">{children}</BaseText>;
}

const columns: TexoTableColumn[] = [
  { key: 'company', label: 'Company', width: 210 },
  { key: 'domain', label: 'Domains', width: 160 },
  { key: 'deals', label: 'Associated deals', width: 250 },
  { key: 'fit', label: 'ICP Fit', width: 140 },
  { key: 'arr', label: 'Estimated ARR', width: 170 },
];

const rows: TexoTableRow[] = companies.map(([company, domain, deals, fit, arr]) => ({
  id: company,
  company: <BaseGroup gap="xs" wrap="nowrap"><BaseBox className={classes.companyIcon}>{company[0]}</BaseBox><BaseText fw={500} size="sm">{company}</BaseText></BaseGroup>,
  domain: <Badge tone="link"><IconLink size={11} /> {domain}</Badge>,
  deals: <Badge>{deals}</Badge>,
  fit: <Badge tone={fit === 'Excellent' ? 'violet' : fit === 'Good' ? 'green' : fit === 'Medium' ? 'blue' : 'orange'}>{fit}</Badge>,
  arr: <Badge tone={arr.startsWith('$') ? 'cyan' : 'thinking'}>{arr}</Badge>,
}));

export function AttioReportsView() {
  return (
    <BaseStack className={classes.root} gap="sm">
      <BaseGroup className={classes.viewHeader} justify="space-between">
        <BaseGroup gap="xs"><IconBuilding color="var(--mantine-primary-color-filled)" size={17} /><BaseText fw={600}>Companies</BaseText></BaseGroup>
        <BaseGroup gap="xs">
          <BaseActionIcon aria-label="Search companies" variant="subtle"><IconSearch size={16} /></BaseActionIcon>
          <BaseButton leftSection={<IconSparkles size={15} />} variant="default">Ask Attio</BaseButton>
        </BaseGroup>
      </BaseGroup>
      <BaseGroup className={classes.toolbar} justify="space-between">
        <BaseButton leftSection={<IconBuilding size={15} />} rightSection={<IconChevronDown size={13} />} variant="subtle">Top companies</BaseButton>
        <BaseGroup gap="xs">
          <BaseMenu position="bottom-end">
            <BaseMenu.Target><BaseButton leftSection={<IconAdjustments size={14} />} variant="default">View settings</BaseButton></BaseMenu.Target>
            <BaseMenu.Dropdown><BaseMenu.Item>Configure columns</BaseMenu.Item><BaseMenu.Item>Change density</BaseMenu.Item><BaseMenu.Item>Save view</BaseMenu.Item></BaseMenu.Dropdown>
          </BaseMenu>
          <BaseButton leftSection={<IconDownload size={14} />} rightSection={<IconChevronDown size={13} />} variant="default">Import / Export</BaseButton>
        </BaseGroup>
      </BaseGroup>
      <BaseGroup className={classes.filters} gap="xs">
        <BaseButton leftSection={<IconFilter size={14} />} variant="default">Sorted by Last email interaction</BaseButton>
        <BaseButton variant="default">Advanced filter · 3</BaseButton>
        <BaseActionIcon aria-label="Add filter" variant="default"><IconPlus size={14} /></BaseActionIcon>
      </BaseGroup>
      <BaseBox px="sm">
        <TexoTable columns={columns} rows={rows} selectable />
      </BaseBox>
    </BaseStack>
  );
}

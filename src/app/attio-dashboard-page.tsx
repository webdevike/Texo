import { useState } from 'react';
import {
  IconArrowUp,
  IconBell,
  IconBolt,
  IconBriefcase,
  IconBuilding,
  IconChevronDown,
  IconLayoutSidebar,
  IconMessageCircle,
  IconPhone,
  IconPlayerPlay,
  IconPlus,
  IconReportAnalytics,
  IconSearch,
  IconSend,
  IconSparkles,
  IconStar,
  IconThumbDown,
  IconThumbUp,
  IconUsers,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import {
  BaseActionIcon,
  BaseBox,
  BaseButton,
  BaseGroup,
  BaseMenu,
  BaseNavLink,
  BaseStack,
  BaseText,
  BaseTextarea,
  useTexoTheme,
} from '@texo/ui';

import classes from './attio-dashboard-page.module.css';
import { AttioReportsView } from './attio-reports-view';

const mainNav = [
  [IconBuilding, 'Home'],
  [IconBell, 'Notifications'],
  [IconBriefcase, 'Tasks'],
  [IconMessageCircle, 'Notes'],
  [IconPhone, 'Calls'],
  [IconReportAnalytics, 'Reports'],
] as const;

const favorites = [
  [IconBriefcase, 'Lead workflows'],
  [IconBuilding, 'Pipeline', 'Deals'],
  [IconSend, 'Outreach'],
  [IconSparkles, 'Lead triage'],
  [IconBriefcase, 'Reports'],
  [IconUsers, 'Revenue'],
] as const;

export function AttioDashboardPage() {
  const { config } = useTexoTheme();
  const [active, setActive] = useState('Home');
  const [automationsOpen, setAutomationsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [sentMessage, setSentMessage] = useState('How do I win my deal with GreenLeaf?');
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);

  const sendMessage = () => {
    const next = message.trim();
    if (!next) return;
    setSentMessage(next);
    setMessage('');
  };

  return (
    <BaseBox className={classes.window}>
      <BaseGroup className={classes.trafficLights} gap={8}>
        <span className={classes.red} />
        <span className={classes.yellow} />
        <span className={classes.green} />
      </BaseGroup>

      <BaseBox component="aside" className={classes.sidebar}>
        <BaseGroup className={classes.workspaceHeader} justify="space-between" wrap="nowrap">
          <BaseMenu>
            <BaseMenu.Target>
              <BaseButton
                className={classes.workspaceButton}
                leftSection={<BaseBox className={classes.logo}>B</BaseBox>}
                rightSection={<IconChevronDown size={14} />}
                size="compact-sm"
                styles={{ label: { fontSize: 'var(--mantine-font-size-sm)', fontWeight: 600 } }}
                variant="subtle"
              >
                Basepoint
              </BaseButton>
            </BaseMenu.Target>
            <BaseMenu.Dropdown>
              <BaseMenu.Item>Basepoint</BaseMenu.Item>
              <BaseMenu.Item>Create workspace</BaseMenu.Item>
            </BaseMenu.Dropdown>
          </BaseMenu>
          <BaseActionIcon aria-label="Toggle sidebar" variant="subtle"><IconLayoutSidebar size={17} /></BaseActionIcon>
        </BaseGroup>

        <BaseGroup className={classes.quickActions} gap="xs" wrap="nowrap">
          <BaseButton fullWidth justify="flex-start" leftSection={<IconBolt size={15} />} variant="default">Quick Actions</BaseButton>
          <BaseActionIcon aria-label="Search" size="lg" variant="default"><IconSearch size={16} /></BaseActionIcon>
        </BaseGroup>

        <BaseStack className={classes.nav} gap={2}>
          {mainNav.map(([Icon, label]) => (
            <BaseNavLink active={active === label} key={label} label={label} leftSection={<Icon size={16} />} onClick={() => setActive(label)} />
          ))}
          <BaseNavLink
            childrenOffset="var(--texo-sidebar-indent)"
            defaultOpened
            label="Automations"
            leftSection={<IconPlayerPlay size={16} />}
            onChange={config.sidebar.collapsible ? setAutomationsOpen : undefined}
            opened={config.sidebar.collapsible ? automationsOpen : true}
          >
            <BaseNavLink label="Sequences" leftSection={<IconSend size={15} />} onClick={() => setActive('Sequences')} />
            <BaseNavLink label="Workflows" leftSection={<IconSparkles size={15} />} onClick={() => setActive('Workflows')} />
          </BaseNavLink>
        </BaseStack>

        <BaseText c="dimmed" className={classes.sectionLabel} size="xs">Favorites</BaseText>
        <BaseStack className={classes.nav} gap={2}>
          {favorites.map(([Icon, label, detail]) => (
            <BaseNavLink active={active === label} key={label} label={<BaseGroup gap="xs"><span>{label}</span>{detail && <BaseText c="dimmed" size="sm">{detail}</BaseText>}</BaseGroup>} leftSection={<Icon size={16} />} onClick={() => setActive(label)} />
          ))}
        </BaseStack>
      </BaseBox>

      <BaseBox className={classes.main}>
        {active === 'Reports' ? (
          <AttioReportsView />
        ) : (
          <>
        <BaseGroup className={classes.header} justify="space-between">
          <BaseGroup gap="xs"><BaseText fw={600}>Win deal with GreenLeaf</BaseText><IconStar color="var(--mantine-color-dimmed)" size={17} /></BaseGroup>
          <BaseGroup gap="xs"><BaseActionIcon aria-label="Add" variant="subtle"><IconPlus size={18} /></BaseActionIcon><BaseActionIcon aria-label="Toggle panel" variant="subtle"><IconLayoutSidebar size={18} /></BaseActionIcon><BaseActionIcon aria-label="Close" variant="subtle"><IconX size={18} /></BaseActionIcon></BaseGroup>
        </BaseGroup>

        <BaseBox className={classes.conversation}>
          <BaseText className={classes.userMessage} size="sm">{sentMessage}</BaseText>
          <BaseBox className={classes.answer}>
            <BaseText fw={600}>Strategy to win GreenLeaf</BaseText>
            <BaseText fw={600}>Deal context:</BaseText>
            <BaseGroup className={classes.meeting} justify="space-between" wrap="nowrap">
              <BaseGroup gap="sm" wrap="nowrap">
                <BaseBox className={classes.meetingImage}><IconVideo size={20} /></BaseBox>
                <div><BaseText fw={500}>GreenLeaf Intro</BaseText><BaseText c="dimmed" size="xs">Dec 12, 10:40 – 11:32 AM · 48m</BaseText></div>
              </BaseGroup>
              <BaseGroup gap={4}><BaseBox className={classes.miniAvatar}>J</BaseBox><BaseBox className={classes.miniAvatar}>A</BaseBox></BaseGroup>
            </BaseGroup>
            <BaseBox mt="md">
              <BaseText fw={600}>Key opportunity signals:</BaseText>
              <BaseText size="sm">1. Large startup deal, 52 seats and a global AI team.</BaseText>
              <BaseText size="sm">2. Active migration intent, leaving their current stack.</BaseText>
              <BaseText size="sm">3. Strong ICP fit, 80+ employees and engaged buyers.</BaseText>
              <BaseText size="sm">4. Recent engagement, met the Basepoint team this month.</BaseText>
            </BaseBox>
            <BaseText mt="md" size="sm">Want me to draft an agenda with talking points?</BaseText>
            <BaseGroup gap={4} mt="xs">
              <BaseActionIcon aria-label="Helpful" color={reaction === 'up' ? 'blue' : 'gray'} onClick={() => setReaction('up')} variant="subtle"><IconThumbUp size={15} /></BaseActionIcon>
              <BaseActionIcon aria-label="Not helpful" color={reaction === 'down' ? 'red' : 'gray'} onClick={() => setReaction('down')} variant="subtle"><IconThumbDown size={15} /></BaseActionIcon>
            </BaseGroup>
          </BaseBox>

          <BaseBox className={classes.composer}>
            <BaseTextarea
              autosize
              maxRows={4}
              minRows={2}
              onChange={(event) => setMessage(event.currentTarget.value)}
              placeholder="Ask anything..."
              styles={{
                input: {
                  background: 'transparent',
                  border: 0,
                  borderRadius: 0,
                  boxShadow: 'none',
                  padding: 0,
                },
              }}
              value={message}
              variant="unstyled"
            />
            <BaseGroup justify="flex-end"><BaseText c="dimmed" size="sm">Auto</BaseText><BaseActionIcon aria-label="Send message" disabled={!message.trim()} onClick={sendMessage}><IconArrowUp size={17} /></BaseActionIcon></BaseGroup>
          </BaseBox>
        </BaseBox>
          </>
        )}
      </BaseBox>
    </BaseBox>
  );
}

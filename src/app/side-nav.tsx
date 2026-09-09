import {
  IconChevronDown,
  IconChevronRight,
  IconComponents,
  IconFile,
  IconLayoutGrid,
  IconPalette,
  IconPencilPlus,
} from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseActionIcon, BaseGroup, BaseText, BaseTooltip } from '@texo/ui';

import { pagePath, usePreview } from './preview';
import { useChat } from './use-chat';
import classes from './side-nav.module.css';

/**
 * One sidebar, Linear style: a brand row, top-level destinations, then
 * collapsible sections whose children sit one indent in.
 */
export function SideNav({
  previews,
}: {
  /** Component preview routes shown under the Components section. */
  previews: readonly { label: string; path: string }[];
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const preview = usePreview();
  const chat = useChat();

  return (
    <div className={classes.nav}>
      <BaseGroup
        className={classes.brand}
        gap="xs"
        justify="space-between"
        wrap="nowrap"
      >
        <BaseGroup gap={8} wrap="nowrap">
          <span className={classes.mark}>T</span>
          <BaseText fw={600} size="sm">
            Texo
          </BaseText>
        </BaseGroup>
        {chat.available && (
          <BaseTooltip label="Ask Agent" withArrow>
            <BaseActionIcon
              aria-label="Ask Agent"
              onClick={chat.create}
              variant="default"
              radius="md"
            >
              <IconPencilPlus size={16} />
            </BaseActionIcon>
          </BaseTooltip>
        )}
      </BaseGroup>

      <div className={classes.group}>
        <Item
          active={pathname.startsWith('/pages')}
          icon={<IconLayoutGrid size={16} />}
          label="Pages"
          onClick={() => navigate('/pages')}
        />
        <Item
          active={pathname === '/canvas'}
          icon={<IconComponents size={16} />}
          label="Canvas"
          onClick={() => navigate('/canvas')}
        />
        <Item
          active={pathname === '/theme'}
          icon={<IconPalette size={16} />}
          label="Theme"
          onClick={() => navigate('/theme')}
        />
      </div>

      <Section label="Pages">
        {preview.pages.length === 0 && (
          <BaseText c="dimmed" size="xs" pl="sm">
            No pages yet
          </BaseText>
        )}
        {preview.pages.map((page) => (
          <Item
            active={pathname === pagePath(page.id)}
            icon={<IconFile size={16} />}
            key={page.id}
            label={page.label}
            onClick={() => navigate(pagePath(page.id))}
          />
        ))}
      </Section>

      <Section defaultOpen={false} label="Components">
        {previews.map((item) => (
          <Item
            active={pathname === item.path}
            key={item.path}
            label={item.label}
            onClick={() => navigate(item.path)}
          />
        ))}
      </Section>
    </div>
  );
}

function Item({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      className={classes.item}
      onClick={onClick}
      type="button"
    >
      {icon ? <span className={classes.icon}>{icon}</span> : null}
      <span className={classes.label}>{label}</span>
    </button>
  );
}

function Section({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={classes.group}>
      <button
        aria-expanded={open}
        className={classes.section}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>{label}</span>
        {open ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
      </button>
      {open && <div className={classes.children}>{children}</div>}
    </div>
  );
}

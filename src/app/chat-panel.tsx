import {
  IconChevronDown,
  IconPlayerStop,
  IconPlus,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import {
  BaseAccordion,
  BaseActionIcon,
  BaseBadge,
  BaseButton,
  BaseCodeHighlight,
  BaseGroup,
  BaseLoader,
  BaseMenu,
  BasePopover,
  BaseStack,
  BaseText,
  BaseTextarea,
  BaseTextInput,
  BaseTooltip,
} from '@texo/ui';

import type { ChatItem } from './chat-protocol';
import { useChat } from './use-chat';
import classes from './chat-panel.module.css';

const statusLabel = {
  idle: 'Not running',
  starting: 'Starting omp',
  ready: 'Ready',
  streaming: 'Working',
  error: 'Error',
} as const;

/** 56px rail header: which thread, plus a new one. */
export function ChatHeader() {
  const chat = useChat();
  const active = chat.threads.find((thread) => thread.id === chat.activeId);
  return (
    <BaseGroup
      gap="xs"
      justify="space-between"
      px="sm"
      wrap="nowrap"
      style={{ flex: 1, minWidth: 0 }}
    >
      <BaseMenu position="bottom-start" width={280}>
        <BaseMenu.Target>
          <BaseButton
            rightSection={<IconChevronDown size={12} />}
            size="compact-sm"
            variant="subtle"
            color="gray"
            styles={{ label: { overflow: 'hidden', textOverflow: 'ellipsis' } }}
          >
            {active ? active.title || 'New thread' : 'Threads'}
          </BaseButton>
        </BaseMenu.Target>
        <BaseMenu.Dropdown>
          {chat.threads.length === 0 && (
            <BaseMenu.Label>No threads yet</BaseMenu.Label>
          )}
          {chat.threads.map((thread) => (
            <BaseMenu.Item key={thread.id} onClick={() => chat.open(thread.id)}>
              <BaseText size="sm" truncate>
                {thread.title || 'New thread'}
              </BaseText>
            </BaseMenu.Item>
          ))}
        </BaseMenu.Dropdown>
      </BaseMenu>
      <BaseTooltip label="New thread (new omp session)" withArrow>
        <BaseActionIcon
          aria-label="New thread"
          onClick={chat.create}
          variant="subtle"
        >
          <IconPlus size={16} />
        </BaseActionIcon>
      </BaseTooltip>
    </BaseGroup>
  );
}

/** 48px rail subheader: session status and thread removal. */
export function ChatSubheader() {
  const chat = useChat();
  if (!chat.activeId) {
    return (
      <BaseText c="dimmed" size="xs">
        Each thread is its own omp session in this repo.
      </BaseText>
    );
  }
  const status = chat.active?.status ?? 'idle';
  return (
    <BaseGroup
      gap="xs"
      justify="space-between"
      wrap="nowrap"
      style={{ flex: 1, minWidth: 0 }}
    >
      <BaseGroup gap={6} wrap="nowrap">
        {status === 'streaming' || status === 'starting' ? (
          <BaseLoader size={12} />
        ) : null}
        <BaseText c={status === 'error' ? 'red' : 'dimmed'} size="xs" truncate>
          {chat.active?.message ?? statusLabel[status]}
        </BaseText>
      </BaseGroup>
      <BaseTooltip label="Remove thread" withArrow>
        <BaseActionIcon
          aria-label="Remove thread"
          color="red"
          onClick={() => chat.activeId && chat.remove(chat.activeId)}
          size="sm"
          variant="subtle"
        >
          <IconTrash size={14} />
        </BaseActionIcon>
      </BaseTooltip>
    </BaseGroup>
  );
}

export function ChatPanel() {
  const chat = useChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const items = chat.active?.items ?? [];
  const status = chat.active?.status ?? 'idle';

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [items]);

  if (!chat.available) {
    return (
      <BaseText c="dimmed" size="sm">
        Chat needs the Vite dev server; it is not part of the production build.
      </BaseText>
    );
  }

  if (!chat.activeId) {
    return (
      <BaseStack gap="sm">
        <BaseText c="dimmed" size="sm">
          Describe the page you want. The agent builds it from the Texo UI
          system and it appears as a page tab.
        </BaseText>
        <BaseButton
          leftSection={<IconPlus size={14} />}
          onClick={chat.create}
          size="compact-sm"
        >
          New thread
        </BaseButton>
      </BaseStack>
    );
  }

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    chat.send(text);
    setDraft('');
  };

  return (
    <div className={classes.root}>
      <div className={classes.list} ref={listRef}>
        {items.length === 0 && (
          <BaseText c="dimmed" size="sm">
            Try: "Design a settings page with profile, notifications and billing
            sections."
          </BaseText>
        )}
        {items.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </div>
      <div className={classes.composer}>
        <BaseTextarea
          aria-label="Message"
          autosize
          minRows={2}
          maxRows={8}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Describe the page or the change"
          value={draft}
        />
        <BaseGroup gap="xs" justify="flex-end">
          {status === 'streaming' && (
            <BaseButton
              leftSection={<IconPlayerStop size={14} />}
              onClick={chat.abort}
              size="compact-sm"
              variant="default"
            >
              Stop
            </BaseButton>
          )}
          <BaseButton
            disabled={!draft.trim()}
            leftSection={<IconSend size={14} />}
            onClick={submit}
            size="compact-sm"
          >
            Send
          </BaseButton>
        </BaseGroup>
      </div>
    </div>
  );
}

function Item({ item }: { item: ChatItem }) {
  switch (item.kind) {
    case 'user':
      return (
        <div className={classes.user}>
          <BaseText size="sm" className={classes.text}>
            {item.text}
          </BaseText>
        </div>
      );
    case 'assistant':
      return (
        <div className={classes.assistant}>
          {item.thinking && (
            <BaseAccordion
              chevronPosition="left"
              classNames={{
                control: classes.thinkingControl,
                content: classes.thinkingContent,
                item: classes.thinkingItem,
                label: classes.thinkingLabel,
              }}
              variant="default"
            >
              <BaseAccordion.Item value="thinking">
                <BaseAccordion.Control>
                  {item.text || item.done ? 'Thinking' : 'Thinking...'}
                </BaseAccordion.Control>
                <BaseAccordion.Panel>
                  <BaseText c="dimmed" size="xs" className={classes.text}>
                    {item.thinking}
                  </BaseText>
                </BaseAccordion.Panel>
              </BaseAccordion.Item>
            </BaseAccordion>
          )}
          {item.text && (
            <BaseText size="sm" className={classes.text}>
              {item.text}
            </BaseText>
          )}
        </div>
      );
    case 'tool':
      return <ToolItem item={item} />;
    case 'ask':
      return <AskItem item={item} />;
    case 'notice':
      return (
        <BaseText c="dimmed" size="xs" className={classes.notice}>
          {item.text}
        </BaseText>
      );
  }
}

const languageByExtension: Record<string, string> = {
  ts: 'ts',
  tsx: 'tsx',
  js: 'js',
  jsx: 'jsx',
  mjs: 'js',
  mts: 'ts',
  css: 'css',
  json: 'json',
  md: 'markdown',
  html: 'html',
  sh: 'bash',
};

function outputLanguage(item: ChatItem & { kind: 'tool' }) {
  if (item.name === 'bash') return 'bash';
  if (item.name === 'grep' || item.name === 'glob') return 'text';
  const extension = item.path?.match(/\.([a-z]+)(?::[^/]*)?$/)?.[1];
  return (extension && languageByExtension[extension]) ?? 'text';
}

function ToolItem({ item }: { item: ChatItem & { kind: 'tool' } }) {
  const [opened, setOpened] = useState(false);
  const hasOutput = Boolean(item.output);
  return (
    <BasePopover
      opened={opened && hasOutput}
      onChange={setOpened}
      position="right-start"
      shadow="md"
      width={560}
      withArrow
    >
      <BasePopover.Target>
        <BaseBadge
          className={classes.toolBadge}
          color={item.ok === false ? 'red' : item.done ? 'gray' : 'blue'}
          component="button"
          data-disabled={!hasOutput || undefined}
          fw={500}
          leftSection={!item.done ? <BaseLoader size={8} /> : undefined}
          onClick={() => hasOutput && setOpened((value) => !value)}
          size="sm"
          title={item.title}
          tt="none"
          type="button"
          variant="light"
        >
          {item.name}
          <span className={classes.toolTitle}>{item.title}</span>
        </BaseBadge>
      </BasePopover.Target>
      <BasePopover.Dropdown className={classes.toolDropdown}>
        <BaseText size="xs" fw={600} mb={6} truncate>
          {item.name}: {item.path ?? item.title}
        </BaseText>
        <div className={classes.toolOutput}>
          <BaseCodeHighlight
            code={item.output ?? ''}
            language={outputLanguage(item)}
            withCopyButton
          />
        </div>
      </BasePopover.Dropdown>
    </BasePopover>
  );
}

function AskItem({ item }: { item: ChatItem & { kind: 'ask' } }) {
  const chat = useChat();
  const [value, setValue] = useState('');
  return (
    <div className={classes.ask}>
      <BaseStack gap="xs">
        {item.title && (
          <BaseText size="sm" fw={600}>
            {item.title}
          </BaseText>
        )}
        {item.message && (
          <BaseText size="sm" className={classes.text}>
            {item.message}
          </BaseText>
        )}
        {item.answered ? (
          <BaseText c="dimmed" size="xs">
            Answered
          </BaseText>
        ) : item.method === 'confirm' ? (
          <BaseGroup gap="xs">
            <BaseButton
              onClick={() => chat.answer(item.id, { confirmed: true })}
              size="compact-sm"
            >
              Yes
            </BaseButton>
            <BaseButton
              onClick={() => chat.answer(item.id, { confirmed: false })}
              size="compact-sm"
              variant="default"
            >
              No
            </BaseButton>
          </BaseGroup>
        ) : item.method === 'select' ? (
          <BaseStack gap={4}>
            {(item.options ?? []).map((option) => (
              <BaseButton
                justify="flex-start"
                key={option}
                onClick={() => chat.answer(item.id, { value: option })}
                size="compact-sm"
                variant="default"
              >
                {option}
              </BaseButton>
            ))}
          </BaseStack>
        ) : (
          <BaseGroup gap="xs" wrap="nowrap">
            <BaseTextInput
              onChange={(event) => setValue(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') chat.answer(item.id, { value });
              }}
              placeholder={item.placeholder}
              size="xs"
              style={{ flex: 1 }}
              value={value}
            />
            <BaseButton
              onClick={() => chat.answer(item.id, { value })}
              size="compact-sm"
            >
              Reply
            </BaseButton>
          </BaseGroup>
        )}
      </BaseStack>
    </div>
  );
}

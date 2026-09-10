import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconDots,
  IconHistory,
  IconMinus,
  IconSparkles,
  IconTrash,
  IconX,
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
  BaseTextInput,
  TexoChatComposer,
  TexoMarkdown,
} from '@texo/ui';

import type { AgentContextSnapshot } from '../context/agent-context';
import { useAgentContext } from '../context/agent-context-provider';
import { AgentContextInspector } from './agent-context-inspector';
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


/**
 * Linear-style agent dock: a small fixed footer at the bottom right with one
 * chip per open thread, an Ask Agent button and thread history. A chip opens
 * the floating conversation window above it.
 */
export function ChatDock() {
  const chat = useChat();
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [shown, setShown] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const active = chat.threads.find((thread) => thread.id === chat.activeId);
  const { current, capture } = useAgentContext();
  const [inspection, setInspection] = useState<
    | { mode: 'live' }
    | { mode: 'history'; snapshot: AgentContextSnapshot }
    | null
  >(null);

  // A newly created or chosen thread becomes a chip and shows its window.
  useEffect(() => {
    if (!chat.activeId) return;
    setOpenIds((ids) =>
      ids.includes(chat.activeId!) ? ids : [...ids, chat.activeId!],
    );
    setShown(true);
  }, [chat.activeId]);

  if (!chat.available) return null;

  const close = (id: string) => {
    const rest = openIds.filter((item) => item !== id);
    setOpenIds(rest);
    if (chat.activeId === id) {
      chat.open(rest[rest.length - 1] ?? null);
      if (rest.length === 0) setShown(false);
    }
  };

  return (
    <>
      {shown && active && (
        <div className={classes.window} data-expanded={expanded || undefined}>
          <div className={classes.windowHeader}>
            <BaseGroup gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
              <BaseText size="sm" fw={600} truncate>
                {active.title || 'New thread'}
              </BaseText>
              <Status />
            </BaseGroup>
            <BaseGroup gap={2} wrap="nowrap">
              <BaseMenu position="bottom-end">
                <BaseMenu.Target>
                  <BaseActionIcon
                    aria-label="Thread options"
                    size="sm"
                    variant="subtle"
                    color="gray"
                  >
                    <IconDots size={14} />
                  </BaseActionIcon>
                </BaseMenu.Target>
                <BaseMenu.Dropdown>
                  <BaseMenu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => {
                      close(active.id);
                      chat.remove(active.id);
                    }}
                  >
                    Delete thread
                  </BaseMenu.Item>
                </BaseMenu.Dropdown>
              </BaseMenu>
              <BaseActionIcon
                aria-label="Minimize"
                onClick={() => setShown(false)}
                size="sm"
                variant="subtle"
                color="gray"
              >
                <IconMinus size={14} />
              </BaseActionIcon>
              <BaseActionIcon
                aria-label={expanded ? 'Shrink' : 'Expand'}
                onClick={() => setExpanded((value) => !value)}
                size="sm"
                variant="subtle"
                color="gray"
              >
                {expanded ? (
                  <IconArrowsMinimize size={14} />
                ) : (
                  <IconArrowsMaximize size={14} />
                )}
              </BaseActionIcon>
              <BaseActionIcon
                aria-label="Close"
                onClick={() => close(active.id)}
                size="sm"
                variant="subtle"
                color="gray"
              >
                <IconX size={14} />
              </BaseActionIcon>
            </BaseGroup>
          </div>
          <ChatThreadView
            context={current}
            capture={capture}
            onInspectCurrent={() => {
              capture();
              setInspection({ mode: 'live' });
            }}
            onInspectSaved={(snapshot) => setInspection({ mode: 'history', snapshot })}
          />
        </div>
      )}
      <div className={classes.dock} role="toolbar" aria-label="Agent threads">
        {openIds.map((id) => {
          const thread = chat.threads.find((item) => item.id === id);
          if (!thread) return null;
          const selected = shown && id === chat.activeId;
          return (
            <button
              aria-pressed={selected}
              className={classes.chip}
              key={id}
              onClick={() => {
                if (selected) setShown(false);
                else {
                  chat.open(id);
                  setShown(true);
                }
              }}
              type="button"
            >
              <span className={classes.chipLabel}>
                {thread.title || 'New thread'}
              </span>
            </button>
          );
        })}
        <BaseButton
          leftSection={<IconSparkles size={14} />}
          onClick={chat.create}
          size="compact-sm"
          variant="subtle"
          color="gray"
        >
          Ask Agent
        </BaseButton>
        <BaseMenu position="top-end" width={300}>
          <BaseMenu.Target>
            <BaseActionIcon
              aria-label="Thread history"
              size="sm"
              variant="subtle"
              color="gray"
            >
              <IconHistory size={16} />
            </BaseActionIcon>
          </BaseMenu.Target>
          <BaseMenu.Dropdown>
            {chat.threads.length === 0 && (
              <BaseMenu.Label>No threads yet</BaseMenu.Label>
            )}
            {chat.threads.map((thread) => (
              <BaseMenu.Item
                key={thread.id}
                onClick={() => chat.open(thread.id)}
              >
                <BaseText size="sm" truncate>
                  {thread.title || 'New thread'}
                </BaseText>
              </BaseMenu.Item>
            ))}
          </BaseMenu.Dropdown>
        </BaseMenu>
      </div>
      {inspection && (
        <AgentContextInspector
          historical={inspection.mode === 'history'}
          onClose={() => setInspection(null)}
          snapshot={inspection.mode === 'live' ? current : inspection.snapshot}
        />
      )}
    </>
  );
}

function Status() {
  const chat = useChat();
  const status = chat.active?.status ?? 'idle';
  return (
    <BaseGroup gap={4} wrap="nowrap">
      {status === 'streaming' || status === 'starting' ? (
        <BaseLoader size={10} />
      ) : null}
      <BaseText c={status === 'error' ? 'red' : 'dimmed'} size="xs" truncate>
        {chat.active?.message ?? statusLabel[status]}
      </BaseText>
    </BaseGroup>
  );
}

function ChatThreadView({ context, capture, onInspectCurrent, onInspectSaved }: {
  context: AgentContextSnapshot;
  capture: () => AgentContextSnapshot;
  onInspectCurrent: () => void;
  onInspectSaved: (snapshot: AgentContextSnapshot) => void;
}) {
  const chat = useChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const items = chat.active?.items ?? [];
  const status = chat.active?.status ?? 'idle';

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [items]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    chat.send(text, chat.contextEnabled ? capture() : null);
    setDraft('');
  };

  return (
    <div className={classes.root}>
      <div className={classes.list} ref={listRef}>
        {items.map((item) => (
          <Item key={item.id} item={item} onInspectContext={onInspectSaved} />
        ))}
      </div>
      <TexoChatComposer
        className={classes.composerSlot}
        context={chat.contextEnabled ? {
          label: context.label,
          source: context.preview?.page.status === 'ready'
            ? context.preview.page.value.sourcePath
            : undefined,
        } : null}
        onChange={setDraft}
        onInspectContext={onInspectCurrent}
        onClearContext={() => chat.setContextEnabled(false)}
        onAttachContext={() => chat.setContextEnabled(true)}
        onStop={chat.abort}
        onSubmit={submit}
        placeholder={items.length ? 'Reply...' : 'Ask Texo...'}
        streaming={status === 'streaming'}
        value={draft}
      />
    </div>
  );
}

function Item({ item, onInspectContext }: {
  item: ChatItem;
  onInspectContext: (snapshot: AgentContextSnapshot) => void;
}) {
  switch (item.kind) {
    case 'user':
      return (
        <div className={classes.user}>
          <BaseText size="sm" className={classes.text}>
            {item.text}
          </BaseText>
          {item.context ? (
            <BaseButton
              aria-label="Inspect message context"
              leftSection={<IconSparkles aria-hidden size={12} />}
              onClick={() => item.context && onInspectContext(item.context)}
              size="compact-xs"
              type="button"
              variant="subtle"
            >
              Context
            </BaseButton>
          ) : (
            <BaseText c="dimmed" size="xs">
              {item.context === null ? 'No context attached' : 'Context not recorded'}
            </BaseText>
          )}
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
                  <TexoMarkdown c="dimmed" size="xs">
                    {item.thinking}
                  </TexoMarkdown>
                </BaseAccordion.Panel>
              </BaseAccordion.Item>
            </BaseAccordion>
          )}
          {item.text && (
            <TexoMarkdown>{item.text}</TexoMarkdown>
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

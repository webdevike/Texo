import { IconArrowUp, IconFocus2, IconPlayerStop, IconSparkles, IconX } from '@tabler/icons-react';
import { useRef } from 'react';

import {
  BaseActionIcon,
  BaseButton,
  BaseGroup,
  BaseText,
  BaseTextarea,
  BaseTooltip,
} from './components';
import classes from './texo-chat-composer.module.css';

export interface TexoChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  /** Invoked for nonblank drafts. The owner sends and clears the controlled value. */
  onSubmit: () => void;
  /** Null means this message will not attach workspace context. */
  context: { label: string; source?: string } | null;
  onInspectContext?: () => void;
  onClearContext?: () => void;
  onAttachContext?: () => void;
  streaming?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  messageLabel?: string;
  className?: string;
}

/** A recessed context strip above a separately themed message field. */
export function TexoChatComposer({
  value,
  onChange,
  onSubmit,
  context,
  onInspectContext,
  onClearContext,
  onAttachContext,
  streaming = false,
  onStop,
  disabled = false,
  placeholder = 'Ask Texo...',
  messageLabel = 'Message',
  className,
}: TexoChatComposerProps) {
  const composing = useRef(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const canSubmit = !disabled && value.trim().length > 0;
  const submit = () => {
    if (canSubmit) onSubmit();
  };
  const contextAction = context ? onInspectContext : onAttachContext;
  const contextActionLabel = context ? 'Inspect current context' : 'Attach current context';

  return (
    <div className={[classes.root, className].filter(Boolean).join(' ')} data-context={context ? true : undefined}>
      {context && (
        <div className={classes.context}>
          <BaseTooltip
            disabled={!context.source && !onInspectContext}
            events={{ hover: true, focus: true, touch: false }}
            label={context.source ?? 'Inspect current context'}
          >
            {onInspectContext ? (
              <BaseButton
                aria-label={`Inspect current context: ${context.label}`}
                aria-haspopup="dialog"
                className={classes.contextButton}
                classNames={{ label: classes.label, inner: classes.contextInner }}
                color="gray"
                h="auto"
                leftSection={<IconSparkles aria-hidden size="1em" />}
                onClick={onInspectContext}
                type="button"
                variant="transparent"
              >
                <BaseText component="span" c="dimmed" fw={400} size="sm" truncate>{context.label}</BaseText>
              </BaseButton>
            ) : (
              <BaseGroup className={classes.metadata} gap="xs" wrap="nowrap" tabIndex={context.source ? 0 : undefined}>
                <IconSparkles aria-hidden size="1em" />
                <BaseText c="dimmed" fw={400} size="sm" truncate>{context.label}</BaseText>
              </BaseGroup>
            )}
          </BaseTooltip>
          {onClearContext && (
            <BaseActionIcon
              aria-label="Clear context"
              className={classes.clear}
              color="gray"
              onClick={() => {
                onClearContext();
                input.current?.focus();
              }}
              size="sm"
              type="button"
              variant="subtle"
            >
              <IconX aria-hidden size="1em" />
            </BaseActionIcon>
          )}
        </div>
      )}
      <div className={classes.field}>
        <BaseTextarea
          aria-label={messageLabel}
          autosize
          classNames={{ input: classes.input }}
          disabled={disabled}
          maxRows={8}
          minRows={1}
          onChange={(event) => onChange(event.currentTarget.value)}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={() => { composing.current = false; }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.shiftKey || composing.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
            event.preventDefault();
            submit();
          }}
          placeholder={placeholder}
          ref={input}
          value={value}
          variant="unstyled"
        />
        <BaseGroup className={classes.toolbar} gap="xs" justify="flex-end" wrap="nowrap">
          {streaming && onStop && (
            <BaseButton
              leftSection={<IconPlayerStop aria-hidden size="1em" />}
              onClick={onStop}
              size="compact-sm"
              type="button"
              variant="default"
            >
              Stop
            </BaseButton>
          )}
          {contextAction && (
            <BaseTooltip label={contextActionLabel}>
              <BaseActionIcon
                aria-label={contextActionLabel}
                color="gray"
                onClick={contextAction}
                radius="xl"
                size="sm"
                type="button"
                variant={context ? 'light' : 'subtle'}
              >
                <IconFocus2 aria-hidden size="1em" />
              </BaseActionIcon>
            </BaseTooltip>
          )}
          <BaseTooltip label="Send message (Enter). Shift + Enter for a new line.">
            <BaseActionIcon
              aria-label="Send message"
              disabled={!canSubmit}
              onClick={submit}
              radius="xl"
              size="sm"
              type="button"
              variant="filled"
            >
              <IconArrowUp aria-hidden size="1em" />
            </BaseActionIcon>
          </BaseTooltip>
        </BaseGroup>
      </div>
    </div>
  );
}

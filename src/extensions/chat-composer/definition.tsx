import { BaseModal, BaseStack, BaseText, defineTexoComponent, TexoChatComposer } from '@texo/ui';
import { useState } from 'react';

export type ChatComposerDemoProps = {
  contextLabel: string;
  source: string;
  placeholder: string;
};

export function ChatComposerDemo({ contextLabel, source, placeholder }: ChatComposerDemoProps) {
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [attached, setAttached] = useState(true);
  const [inspect, setInspect] = useState(false);

  return (
    <BaseStack gap="sm">
      <BaseText c="dimmed" size="sm">Local interaction demo. Messages are not sent to an agent.</BaseText>
      <TexoChatComposer
        context={attached ? { label: contextLabel, source } : null}
        onChange={setDraft}
        onClearContext={() => setAttached(false)}
        onAttachContext={() => setAttached(true)}
        onInspectContext={() => setInspect(true)}
        onStop={() => setStreaming(false)}
        onSubmit={() => {
          setSubmitted(draft.trim());
          setDraft('');
          setStreaming(true);
        }}
        placeholder={placeholder}
        streaming={streaming}
        value={draft}
      />
      <BaseText aria-live="polite" c="dimmed" size="sm" style={{ overflowWrap: 'anywhere' }}>
        {submitted
          ? `${streaming ? 'Demo run active; use Stop to end it' : 'Demo run stopped'}. Submitted message: ${submitted}`
          : 'Type a message and send it with Enter or the send button.'}
      </BaseText>
      <BaseModal opened={inspect} onClose={() => setInspect(false)} title="Context">
        <BaseStack gap="xs">
          <BaseText>{contextLabel}</BaseText>
          <BaseText c="dimmed" size="sm">{source}</BaseText>
        </BaseStack>
      </BaseModal>
    </BaseStack>
  );
}

export const chatComposerDemo = defineTexoComponent<ChatComposerDemoProps>({
  component: ChatComposerDemo,
  defaultProps: {
    contextLabel: 'Customer dashboard',
    source: 'src/pages/customer-dashboard.tsx',
    placeholder: 'Ask for a change...',
  },
  id: 'chat-composer',
  name: 'Chat Composer',
  properties: {
    contextLabel: { default: 'Customer dashboard', label: 'Context label', type: 'string' },
    source: { default: 'src/pages/customer-dashboard.tsx', label: 'Context source', type: 'string' },
    placeholder: { default: 'Ask for a change...', label: 'Placeholder', type: 'string' },
  },
  targets: {
    message: { label: 'Message', selector: 'textarea' },
    send: { label: 'Send message', selector: 'button[aria-label="Send message"]' },
  },
});

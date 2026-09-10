import type { ReactNode } from 'react';
import {
  BaseBadge,
  BaseCode,
  BaseFieldset,
  BaseGroup,
  BaseModal,
  BaseStack,
  BaseText,
  BaseTitle,
} from '@texo/ui';

import type {
  AgentContextSnapshot,
  AgentRequest,
  AgentTarget,
  ContextState,
} from '../context/agent-context';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <BaseStack gap="xs">
      <BaseText c="dimmed" size="xs">{label}</BaseText>
      <BaseText size="sm" style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
        {children}
      </BaseText>
    </BaseStack>
  );
}

function ContextSection<T>({ label, state, children }: {
  label: string;
  state: ContextState<T>;
  children: (value: T) => ReactNode;
}) {
  return (
    <BaseFieldset legend={label}>
      <BaseStack gap="sm">
        <BaseGroup>
          <BaseBadge variant="light">{state.status}</BaseBadge>
        </BaseGroup>
        {state.status === 'ready'
          ? children(state.value)
          : <Field label="Reason">{state.reason}</Field>}
      </BaseStack>
    </BaseFieldset>
  );
}

function Target({ target }: { target: AgentTarget }) {
  return (
    <BaseStack gap="xs">
      <Field label="Target ID">{target.key}</Field>
      <Field label="Target label">{target.label}</Field>
      <Field label="Record">{target.record ?? 'No record'}</Field>
      {target.recordLabel !== undefined && <Field label="Record label">{target.recordLabel}</Field>}
    </BaseStack>
  );
}

function Requests({ requests }: { requests: ContextState<AgentRequest[]> }) {
  return (
    <ContextSection label="Open requests" state={requests}>
      {(items) => items.length === 0
        ? <BaseText c="dimmed" size="sm">No open requests.</BaseText>
        : items.map((request) => (
          <BaseFieldset key={request.id} legend={request.id}>
            <BaseStack gap="sm">
              <Field label="Request">{request.body}</Field>
              <Target target={request.target} />
            </BaseStack>
          </BaseFieldset>
        ))}
    </ContextSection>
  );
}

/** One inspector is shared by the live composer and all saved message attachments. */
export function AgentContextInspector({ snapshot, historical, onClose }: {
  snapshot: AgentContextSnapshot;
  historical: boolean;
  onClose: () => void;
}) {
  return (
    <BaseModal
      opened
      onClose={onClose}
      size="lg"
      title={historical ? 'Message context' : 'Current context'}
    >
      <BaseStack gap="md">
        <BaseText c="dimmed" size="sm">
          {historical
            ? 'This snapshot was saved with this message. It does not change with the workspace.'
            : 'Live workspace context. A fresh snapshot is attached when you send a message.'}
        </BaseText>
        <BaseFieldset legend="Workspace">
          <BaseStack gap="sm">
            <Field label="Context">{snapshot.label}</Field>
            <Field label="Route">{snapshot.route}</Field>
            <Field label="Surface">{snapshot.surface}</Field>
            <Field label="Snapshot version">{snapshot.version}</Field>
            {historical && (
              <Field label="Captured with message">{new Date(snapshot.capturedAt).toISOString()}</Field>
            )}
          </BaseStack>
        </BaseFieldset>
        {snapshot.preview && (
          <BaseStack gap="sm">
            <BaseTitle order={3} size="sm">Preview</BaseTitle>
            <ContextSection label="Page and source" state={snapshot.preview.page}>
              {(page) => (
                <BaseStack gap="sm">
                  <Field label="Page ID">{page.id}</Field>
                  <Field label="Page label">{page.label}</Field>
                  <Field label="Source path">{page.sourcePath}</Field>
                  <Field label="Preview URL">{page.previewUrl}</Field>
                </BaseStack>
              )}
            </ContextSection>
            <ContextSection label="Visible targets" state={snapshot.preview.targets}>
              {(targets) => targets.length === 0
                ? <BaseText c="dimmed" size="sm">No visible targets.</BaseText>
                : targets.map((target, index) => (
                  <BaseFieldset key={`${target.key}:${target.record ?? ''}:${index}`} legend={target.label}>
                    <Target target={target} />
                  </BaseFieldset>
                ))}
            </ContextSection>
          </BaseStack>
        )}
        {snapshot.prototype && (
          <BaseStack gap="sm">
            <BaseTitle order={3} size="sm">Prototype</BaseTitle>
            <Field label="Prototype mode">{snapshot.prototype.active ? 'Active' : 'Inactive'}</Field>
            <ContextSection label="Prototype selection" state={snapshot.prototype.selection}>
              {(selection) => selection
                ? <Target target={selection} />
                : <BaseText c="dimmed" size="sm">Nothing selected.</BaseText>}
            </ContextSection>
            <Requests requests={snapshot.prototype.requests} />
          </BaseStack>
        )}
        {snapshot.canvas && (
          <BaseStack gap="sm">
            <BaseTitle order={3} size="sm">Canvas</BaseTitle>
            <Field label="Canvas mode">{snapshot.canvas.mode}</Field>
            <ContextSection label="Canvas selection" state={snapshot.canvas.selection}>
              {(selection) => selection ? (
                <BaseStack gap="sm">
                  <Field label="Instance ID">{selection.instanceId}</Field>
                  <Field label="Component ID">{selection.componentId}</Field>
                  <Field label="Component label">{selection.label}</Field>
                  <BaseStack gap="xs">
                    <BaseText c="dimmed" size="xs">Props</BaseText>
                    <BaseCode block>{JSON.stringify(selection.props, null, 2)}</BaseCode>
                  </BaseStack>
                  {selection.target && <Target target={selection.target} />}
                </BaseStack>
              ) : <BaseText c="dimmed" size="sm">Nothing selected.</BaseText>}
            </ContextSection>
            <Requests requests={snapshot.canvas.requests} />
          </BaseStack>
        )}
        {!snapshot.preview && !snapshot.prototype && !snapshot.canvas && (
          <BaseText c="dimmed" size="sm">No surface-specific context applies to this route.</BaseText>
        )}
      </BaseStack>
    </BaseModal>
  );
}

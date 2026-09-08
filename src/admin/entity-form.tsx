// Form rendered from entity.fields. No per-entity code. Relation pickers search their target
// through `store`; `resolveEntity` maps a relation's `to` onto the live entity registry.
import { BaseButton, BaseGroup, BaseStack, BaseText } from '@texo/ui';
import { useState } from 'react';

import type { Entity, Input, Row } from '../../experiments/contracts-spike/contracts/entity';
import { type ClientStore, StoreValidationError } from '../../experiments/contracts-spike/contracts/store';
import { compact, FieldControl, initialValue } from './fields/field-control';

function initial(entity: Entity, row?: Row): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of entity.fields) {
    const v = row?.[f.name];
    // Included single relations arrive as { id, title }; the form edits the id.
    const included = f.kind === 'relation' && !f.many && v !== null && typeof v === 'object' && 'id' in v;
    out[f.name] = included ? v.id : (v ?? initialValue(f));
  }
  return out;
}

export function EntityForm({ entity, row, store, resolveEntity, onSubmit, onCancel }: {
  entity: Entity;
  /** When present the form edits; otherwise it creates. */
  row?: Row;
  store: ClientStore;
  resolveEntity: (name: string) => Entity | undefined;
  onSubmit: (values: Input) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(() => initial(entity, row));
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(compact(entity.fields, values));
    } catch (e) {
      if (e instanceof StoreValidationError) setError(e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
      else setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <BaseStack gap="sm">
      {entity.fields.map((f) => (
        <FieldControl ctx={{ store, resolveEntity }} field={f} key={f.name} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} value={values[f.name]} />
      ))}
      {error && (
        <BaseText c="red" size="sm">
          {error}
        </BaseText>
      )}
      <BaseGroup gap="xs" justify="flex-end">
        <BaseButton onClick={onCancel} variant="subtle">
          Cancel
        </BaseButton>
        <BaseButton loading={busy} onClick={submit}>
          {row ? 'Save' : 'Create'}
        </BaseButton>
      </BaseGroup>
    </BaseStack>
  );
}

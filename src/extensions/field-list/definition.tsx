import { defineTexoComponent, TexoFieldList, type TexoFieldListItem } from '@texo/ui';
import { useState } from 'react';

// Dogfood: the schema builder's primitive, demoed with fixed data. The component registry's
// prop schema is flat scalars only, so `items` cannot be described there (ledger P10); the
// demo exposes knobs and owns its own data.
const DEMO: TexoFieldListItem[] = [
  { id: 'name', label: 'name', description: 'Text', kind: 'text', badges: ['REQUIRED'] },
  { id: 'model', label: 'model', description: 'Text', kind: 'text' },
  { id: 'max_speed', label: 'max_speed', description: 'Number (integer)', kind: 'number' },
  {
    id: 'pilot_reviews',
    label: 'pilot_reviews',
    description: 'Component (folder.component)',
    kind: 'group',
    badges: ['REPEATABLE'],
    children: [
      { id: 'rating', label: 'rating', description: 'Number (integer)', kind: 'number' },
      { id: 'comment', label: 'comment', description: 'Text', kind: 'text' },
      { id: 'date', label: 'date', description: 'Date', kind: 'date' },
      { id: 'author', label: 'author', description: 'Relation (User)', kind: 'relation' },
    ],
  },
];

export type FieldListDemoProps = {
  showBadges: boolean;
  editable: boolean;
  addLabel: string;
};

function reorder(items: TexoFieldListItem[], parentId: string | null, ids: string[]): TexoFieldListItem[] {
  if (parentId === null) return ids.map((id) => items.find((i) => i.id === id)!);
  return items.map((i) => (i.id === parentId && i.children ? { ...i, children: reorder(i.children, null, ids) } : i));
}

export function FieldListDemo({ showBadges, editable, addLabel }: FieldListDemoProps) {
  const [items, setItems] = useState(DEMO);
  const [editing, setEditing] = useState<string | null>(null);
  const strip = (list: TexoFieldListItem[]): TexoFieldListItem[] =>
    list.map(({ badges, children, ...rest }) => ({ ...rest, children: children && strip(children) }));
  return (
    <TexoFieldList
      addLabel={addLabel}
      editing={editing}
      items={showBadges ? items : strip(items)}
      onAdd={editable ? () => undefined : undefined}
      onEdit={editable ? (id) => setEditing(editing === id ? null : id) : undefined}
      onRemove={editable ? () => undefined : undefined}
      onReorder={(parentId, ids) => setItems((current) => reorder(current, parentId, ids))}
      renderEditor={editable ? (item) => <span>Editing {item.label}</span> : undefined}
    />
  );
}

export const fieldListDemo = defineTexoComponent<FieldListDemoProps>({
  component: FieldListDemo,
  defaultProps: { showBadges: true, editable: true, addLabel: 'Add new field' },
  id: 'field-list',
  name: 'Field List',
  properties: {
    showBadges: { default: true, label: 'Show badges', type: 'boolean' },
    editable: { default: true, label: 'Editable', type: 'boolean' },
    addLabel: { default: 'Add new field', label: 'Add label', type: 'string' },
  },
});

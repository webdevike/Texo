import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconCalendar,
  IconGripVertical,
  IconLink,
  IconList,
  IconPencil,
  IconPlus,
  IconSitemap,
  IconToggleLeft,
  IconTrash,
  IconTypography,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

import {
  BaseActionIcon,
  BaseBadge,
  BaseBox,
  BaseButton,
  BaseCollapse,
  BaseGroup,
  BaseText,
} from './components';
import classes from './texo-field-list.module.css';

/**
 * A sortable, nestable list of "field" rows: drag handle, kind badge, label + description,
 * trailing badges, edit/remove, optional inline editor, optional children with a connector.
 * Data in, events out. Knows nothing about entities; the schema builder maps FieldSpec onto it
 * and the Custom page demos it with fixed data.
 */

export type TexoFieldKindIcon =
  | 'text'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'date'
  | 'relation'
  | 'group';

export interface TexoFieldListItem {
  id: string;
  label: string;
  description?: string;
  kind: TexoFieldKindIcon;
  badges?: string[];
  children?: TexoFieldListItem[];
}

export interface TexoFieldListProps {
  items: TexoFieldListItem[];
  /** Id of the row whose inline editor is open. */
  editing?: string | null;
  /** Renders below the row when `editing === item.id`. */
  renderEditor?: (item: TexoFieldListItem) => ReactNode;
  addLabel?: string;
  onAdd?: (parentId: string | null) => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** New sibling order under `parentId` (null = root). */
  onReorder?: (parentId: string | null, orderedIds: string[]) => void;
}

const KIND_META: Record<TexoFieldKindIcon, { color: string; icon: ReactNode; label: string }> = {
  text: { color: 'green', icon: <IconTypography size={16} />, label: 'Text' },
  number: { color: 'red', icon: <BaseText fw={700} size="xs">123</BaseText>, label: 'Number' },
  boolean: { color: 'yellow', icon: <IconToggleLeft size={16} />, label: 'Boolean' },
  enum: { color: 'grape', icon: <IconList size={16} />, label: 'Enumeration' },
  date: { color: 'orange', icon: <IconCalendar size={16} />, label: 'Date' },
  relation: { color: 'indigo', icon: <IconLink size={16} />, label: 'Relation' },
  group: { color: 'gray', icon: <IconSitemap size={16} />, label: 'Component' },
};

export function texoFieldKindLabel(kind: TexoFieldKindIcon) {
  return KIND_META[kind].label;
}

function Row({
  item,
  depth,
  props,
}: {
  item: TexoFieldListItem;
  depth: number;
  props: TexoFieldListProps;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const meta = KIND_META[item.kind];
  const open = props.editing === item.id;

  return (
    <BaseBox
      className={classes.row}
      data-dragging={isDragging || undefined}
      data-open={open || undefined}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <BaseGroup className={classes.rowMain} gap="sm" wrap="nowrap">
        <BaseActionIcon
          aria-label={`Reorder ${item.label}`}
          className={classes.handle}
          size="sm"
          variant="subtle"
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={14} />
        </BaseActionIcon>
        <BaseBox className={classes.kind} data-color={meta.color}>
          {meta.icon}
        </BaseBox>
        <BaseText className={classes.label} fw={600} size="sm">
          {item.label}
        </BaseText>
        <BaseText c="dimmed" className={classes.description} size="sm">
          {item.description ?? meta.label}
        </BaseText>
        <BaseGroup className={classes.trailing} gap="xs" wrap="nowrap">
          {item.badges?.map((badge) => (
            <BaseBadge key={badge} size="xs" variant="outline">
              {badge}
            </BaseBadge>
          ))}
          {props.onEdit && (
            <BaseActionIcon
              aria-label={`Edit ${item.label}`}
              onClick={() => props.onEdit?.(item.id)}
              size="sm"
              variant={open ? 'light' : 'subtle'}
            >
              <IconPencil size={14} />
            </BaseActionIcon>
          )}
          {props.onRemove && (
            <BaseActionIcon
              aria-label={`Remove ${item.label}`}
              color="red"
              onClick={() => props.onRemove?.(item.id)}
              size="sm"
              variant="subtle"
            >
              <IconTrash size={14} />
            </BaseActionIcon>
          )}
        </BaseGroup>
      </BaseGroup>
      {props.renderEditor && (
        <BaseCollapse expanded={open}>
          <BaseBox className={classes.editor}>{open ? props.renderEditor(item) : null}</BaseBox>
        </BaseCollapse>
      )}
      {item.children && (
        <BaseBox className={classes.children}>
          <List depth={depth + 1} items={item.children} parentId={item.id} props={props} />
        </BaseBox>
      )}
    </BaseBox>
  );
}

function List({
  items,
  parentId,
  depth,
  props,
}: {
  items: TexoFieldListItem[];
  parentId: string | null;
  depth: number;
  props: TexoFieldListProps;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = items.map((item) => item.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return; // cross-list drops are not supported yet
    props.onReorder?.(parentId, arrayMove(ids, from, to));
  };

  return (
    <BaseBox className={classes.list} data-depth={depth}>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <Row depth={depth} item={item} key={item.id} props={props} />
          ))}
        </SortableContext>
      </DndContext>
      {props.onAdd && (
        <BaseButton
          className={classes.add}
          leftSection={<IconPlus size={14} />}
          onClick={() => props.onAdd?.(parentId)}
          size="xs"
          variant="subtle"
        >
          {props.addLabel ?? 'Add new field'}
        </BaseButton>
      )}
    </BaseBox>
  );
}

export function TexoFieldList(props: TexoFieldListProps) {
  return (
    <BaseBox className={classes.root}>
      <List depth={0} items={props.items} parentId={null} props={props} />
    </BaseBox>
  );
}

import { DndContext, type DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import type { ReactNode } from 'react';

import { BaseBox, BaseGroup, BaseStack, BaseText } from './components';

/**
 * Kanban board over one enum field. Columns are given by the caller (one per option) with their
 * cards and total; dragging a card onto another column calls `onMove(cardId, column)`. Card
 * content is delegated to `renderCard`. The caller owns the data and the optimistic write.
 */
export interface TexoBoardColumn<T extends { id: string }> {
  id: string;
  label: string;
  cards: readonly T[];
  total: number;
}

export interface TexoBoardProps<T extends { id: string }> {
  columns: readonly TexoBoardColumn<T>[];
  renderCard: (card: T) => ReactNode;
  onMove: (cardId: string, column: string) => void;
  onOpen?: (card: T) => void;
}

function Card<T extends { id: string }>({ card, renderCard, onOpen }: { card: T; renderCard: (c: T) => ReactNode; onOpen?: (c: T) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });
  return (
    <BaseBox
      data-card={card.id}
      onClick={() => onOpen?.(card)}
      ref={setNodeRef}
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-default)',
        background: 'var(--texo-color-card)',
        padding: 'var(--mantine-spacing-xs)',
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      {renderCard(card)}
    </BaseBox>
  );
}

function Column<T extends { id: string }>({ column, renderCard, onOpen }: { column: TexoBoardColumn<T>; renderCard: (c: T) => ReactNode; onOpen?: (c: T) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <BaseStack
      data-column={column.id}
      gap="xs"
      ref={setNodeRef}
      style={{
        minWidth: 240,
        flex: 1,
        padding: 'var(--mantine-spacing-xs)',
        borderRadius: 'var(--mantine-radius-default)',
        background: isOver ? 'var(--mantine-color-default-hover)' : 'var(--texo-color-surface)',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <BaseGroup gap="xs" px="calc(var(--mantine-spacing-xs) / 2)">
        <BaseText fw={600} size="sm">{column.label}</BaseText>
        <BaseText c="dimmed" size="xs" data-count>{column.total}</BaseText>
      </BaseGroup>
      {column.cards.map((card) => (
        <Card card={card} key={card.id} onOpen={onOpen} renderCard={renderCard} />
      ))}
    </BaseStack>
  );
}

export function TexoBoard<T extends { id: string }>({ columns, renderCard, onMove, onOpen }: TexoBoardProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const onDragEnd = (event: DragEndEvent) => {
    const to = event.over?.id;
    if (typeof to !== 'string') return;
    const from = columns.find((c) => c.cards.some((card) => card.id === event.active.id))?.id;
    if (from !== to) onMove(String(event.active.id), to);
  };
  return (
    <DndContext onDragEnd={onDragEnd} sensors={sensors}>
      <BaseGroup align="stretch" gap="sm" style={{ height: '100%', overflowX: 'auto' }} wrap="nowrap">
        {columns.map((c) => (
          <Column column={c} key={c.id} onOpen={onOpen} renderCard={renderCard} />
        ))}
      </BaseGroup>
    </DndContext>
  );
}

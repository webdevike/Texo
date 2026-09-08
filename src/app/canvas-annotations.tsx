import {
  IconCheck,
  IconMessageCircle,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  BaseActionIcon,
  BaseButton,
  BaseGroup,
  BaseStack,
  BaseText,
  BaseTextarea,
  type TexoComponentDefinition,
  type TexoComponentRegistry,
} from '@texo/ui';

import type {
  AnnotationTarget,
  CanvasAnnotation,
  CanvasDocument,
  CanvasInstance,
} from './canvas-document';
import classes from './canvas-annotations.module.css';

const TARGETS_CHANGED = 'texo:annotation-targets-changed';
const MAX_BODY_LENGTH = 4000;
type Bounds = { x: number; y: number; width: number; height: number };
type TargetBounds = { target: string | null; bounds: Bounds };

function targetElement(
  content: Element,
  definition: TexoComponentDefinition,
  target: string | null,
) {
  if (target === null) return content;
  const registered = definition.targets?.[target];
  if (!registered) return null;
  try {
    const matches = content.querySelectorAll(registered.selector);
    return matches.length === 1 ? matches[0] : null;
  } catch {
    return null;
  }
}

function relativeBounds(rect: DOMRect, root: DOMRect): Bounds {
  return {
    x: (rect.left - root.left) / root.width,
    y: (rect.top - root.top) / root.height,
    width: rect.width / root.width,
    height: rect.height / root.height,
  };
}

function boundsStyle(bounds: Bounds) {
  return {
    left: `${bounds.x * 100}%`,
    top: `${bounds.y * 100}%`,
    width: `${bounds.width * 100}%`,
    height: `${bounds.height * 100}%`,
  };
}

function announceTargets() {
  window.dispatchEvent(new Event(TARGETS_CHANGED));
}

export function AnnotationSurface({
  instance,
  definition,
  annotations,
  mode,
  selectedNoteId,
  onCreate,
  onSelect,
  children,
}: {
  instance: CanvasInstance;
  definition: TexoComponentDefinition;
  annotations: CanvasAnnotation[];
  mode: 'design' | 'annotate' | 'preview';
  selectedNoteId: string | null;
  onCreate: (target: AnnotationTarget) => void;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<TargetBounds[]>([]);
  const [hover, setHover] = useState<TargetBounds | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content || mode === 'preview') return;
    let frame = 0;
    const observed = new Set<Element>();
    const resize = new ResizeObserver(() => schedule());
    function measure() {
      if (!root || !content) return;
      const rootBounds = root.getBoundingClientRect();
      const targets: TargetBounds[] = [];
      const elements = new Set<Element>([root, content]);
      for (const target of [null, ...Object.keys(definition.targets ?? {})]) {
        const element = targetElement(content, definition, target);
        if (!element) continue;
        elements.add(element);
        const rect = element.getBoundingClientRect();
        if (
          rootBounds.width > 0 &&
          rootBounds.height > 0 &&
          rect.width > 0 &&
          rect.height > 0
        ) {
          targets.push({ target, bounds: relativeBounds(rect, rootBounds) });
        }
      }
      for (const element of observed) {
        if (!elements.has(element)) {
          resize.unobserve(element);
          observed.delete(element);
        }
      }
      for (const element of elements) {
        if (!observed.has(element)) {
          resize.observe(element);
          observed.add(element);
        }
      }
      setGeometry(targets);
      setHover((current) =>
        current
          ? (targets.find((item) => item.target === current.target) ?? null)
          : null,
      );
      announceTargets();
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    const mutations = new MutationObserver(schedule);
    mutations.observe(content, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
    content.addEventListener('load', schedule, true);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      content.removeEventListener('load', schedule, true);
      queueMicrotask(announceTargets);
    };
  }, [definition, instance.props, mode]);

  function hitTest(clientX: number, clientY: number) {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return null;
    const rootBounds = root.getBoundingClientRect();
    if (!rootBounds.width || !rootBounds.height) return null;
    let hit: { target: string | null; rect: DOMRect } | null = null;
    for (const target of [null, ...Object.keys(definition.targets ?? {})]) {
      const rect = targetElement(
        content,
        definition,
        target,
      )?.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) continue;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      )
        continue;
      if (
        !hit ||
        (target !== null &&
          (hit.target === null ||
            rect.width * rect.height < hit.rect.width * hit.rect.height))
      ) {
        hit = { target, rect };
      }
    }
    return hit
      ? { ...hit, bounds: relativeBounds(hit.rect, rootBounds) }
      : null;
  }

  function movePointer(event: PointerEvent<HTMLButtonElement>) {
    const hit = hitTest(event.clientX, event.clientY);
    setHover(hit ? { target: hit.target, bounds: hit.bounds } : null);
  }

  return (
    <div
      className={classes.surface}
      data-annotation-surface={instance.id}
      ref={rootRef}
    >
      <div
        className={classes.content}
        data-annotation-content
        inert={mode !== 'preview'}
        ref={contentRef}
      >
        {children}
      </div>
      {mode === 'annotate' && (
        <>
          <button
            aria-label={`Add note to ${definition.name}`}
            className={`${classes.capture} nodrag nopan`}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={movePointer}
            onPointerLeave={() => setHover(null)}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              if (event.detail === 0) {
                onCreate({
                  instanceId: instance.id,
                  target: null,
                  anchor: { x: 0.5, y: 0.5 },
                });
                return;
              }
              const hit = hitTest(event.clientX, event.clientY);
              if (!hit) return;
              onCreate({
                instanceId: instance.id,
                target: hit.target,
                anchor: {
                  x: Math.max(
                    0,
                    Math.min(
                      1,
                      (event.clientX - hit.rect.left) / hit.rect.width,
                    ),
                  ),
                  y: Math.max(
                    0,
                    Math.min(
                      1,
                      (event.clientY - hit.rect.top) / hit.rect.height,
                    ),
                  ),
                },
              });
            }}
            type="button"
          />
          {hover && (
            <div
              aria-hidden
              className={classes.highlight}
              style={boundsStyle(hover.bounds)}
            >
              <span className={classes.targetLabel}>
                {hover.target === null
                  ? 'Whole component'
                  : definition.targets?.[hover.target]?.label}
              </span>
            </div>
          )}
        </>
      )}
      {mode !== 'preview' &&
        annotations
          .filter((note) => note.instanceId === instance.id)
          .map((note) => {
            const target = geometry.find((item) => item.target === note.target);
            if (!target) return null;
            return (
              <button
                aria-label={`${note.resolved ? 'Resolved note' : 'Note'}: ${note.body}`}
                aria-pressed={note.id === selectedNoteId}
                className={`${classes.pin} nodrag nopan`}
                data-resolved={note.resolved || undefined}
                key={note.id}
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(note.id);
                }}
                style={{
                  left: `${(target.bounds.x + target.bounds.width * note.anchor.x) * 100}%`,
                  top: `${(target.bounds.y + target.bounds.height * note.anchor.y) * 100}%`,
                }}
                title={note.body}
                type="button"
              >
                {note.resolved ? (
                  <IconCheck size={14} />
                ) : (
                  <IconMessageCircle size={14} />
                )}
              </button>
            );
          })}
    </div>
  );
}

function NoteComposer({
  label,
  initialBody = '',
  submitLabel,
  onCancel,
  onSubmit,
}: {
  label: string;
  initialBody?: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (body: string) => void;
}) {
  const [body, setBody] = useState(initialBody);
  return (
    <BaseStack gap="xs">
      <BaseTextarea
        autoFocus
        autosize
        label={label}
        maxLength={MAX_BODY_LENGTH}
        minRows={3}
        maxRows={10}
        onChange={(event) => setBody(event.currentTarget.value)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
          }
          if (
            (event.metaKey || event.ctrlKey) &&
            event.key === 'Enter' &&
            body.trim()
          ) {
            event.preventDefault();
            onSubmit(body.trim());
          }
        }}
        placeholder="What needs attention?"
        value={body}
      />
      <BaseGroup gap="xs" justify="flex-end">
        <BaseButton onClick={onCancel} size="compact-sm" variant="subtle">
          Cancel
        </BaseButton>
        <BaseButton
          disabled={!body.trim()}
          onClick={() => onSubmit(body.trim())}
          size="compact-sm"
        >
          {submitLabel}
        </BaseButton>
      </BaseGroup>
    </BaseStack>
  );
}

function NoteRow({
  note,
  label,
  missing,
  selected,
  onUpdate,
  onDelete,
  onFocus,
}: {
  note: CanvasAnnotation;
  label: string;
  missing: string | null;
  selected: boolean;
  onUpdate: (id: string, patch: { body?: string; resolved?: boolean }) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const rowRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (selected) rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);
  useEffect(() => {
    setEditing(false);
  }, [note.body]);
  return (
    <li
      className={classes.note}
      data-selected={selected || undefined}
      ref={rowRef}
    >
      <BaseStack gap="xs">
        <button
          aria-pressed={selected}
          className={classes.noteFocus}
          onClick={() => onFocus(note.id)}
          type="button"
        >
          <BaseText component="span" size="xs" c="dimmed">
            {label}
          </BaseText>
          <BaseText component="span" className={classes.noteBody} size="sm">
            {note.body}
          </BaseText>
          <BaseText
            component="span"
            size="xs"
            c={missing ? 'orange' : 'dimmed'}
          >
            {missing
              ? `Unresolved target: ${missing}`
              : note.resolved
                ? 'Resolved'
                : 'Open'}
          </BaseText>
        </button>
        {editing ? (
          <NoteComposer
            initialBody={note.body}
            key={note.body}
            label="Edit note"
            onCancel={() => setEditing(false)}
            onSubmit={(body) => {
              onUpdate(note.id, { body });
              setEditing(false);
            }}
            submitLabel="Update note"
          />
        ) : (
          <BaseGroup gap={4} justify="space-between">
            <BaseButton
              leftSection={note.resolved ? undefined : <IconCheck size={14} />}
              onClick={() => onUpdate(note.id, { resolved: !note.resolved })}
              size="compact-xs"
              variant="subtle"
            >
              {note.resolved ? 'Reopen' : 'Resolve'}
            </BaseButton>
            <BaseGroup gap={4}>
              <BaseActionIcon
                aria-label="Edit note"
                onClick={() => setEditing(true)}
                size="sm"
                variant="subtle"
              >
                <IconPencil size={14} />
              </BaseActionIcon>
              <BaseActionIcon
                aria-label="Delete note"
                onClick={() => onDelete(note.id)}
                size="sm"
                variant="subtle"
              >
                <IconTrash size={14} />
              </BaseActionIcon>
            </BaseGroup>
          </BaseGroup>
        )}
      </BaseStack>
    </li>
  );
}

export function NotesPanel({
  document: canvas,
  registry,
  draft,
  selectedNoteId,
  onCancel,
  onAdd,
  onUpdate,
  onDelete,
  onFocus,
}: {
  document: CanvasDocument;
  registry: TexoComponentRegistry;
  draft: AnnotationTarget | null;
  selectedNoteId: string | null;
  onCancel: () => void;
  onAdd: (body: string) => void;
  onUpdate: (id: string, patch: { body?: string; resolved?: boolean }) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
}) {
  const [missingTargets, setMissingTargets] = useState<Set<string>>(new Set());
  useLayoutEffect(() => {
    function inspectTargets() {
      const surfaces = [
        ...window.document.querySelectorAll('[data-annotation-surface]'),
      ];
      const missing = new Set<string>();
      for (const note of canvas.annotations) {
        const instance = canvas.instances.find(
          (item) => item.id === note.instanceId,
        );
        const definition = instance && registry[instance.componentId];
        if (!definition || note.target === null) continue;
        const surface = surfaces.find(
          (element) =>
            element.getAttribute('data-annotation-surface') === note.instanceId,
        );
        const content = surface?.querySelector('[data-annotation-content]');
        if (!content || !targetElement(content, definition, note.target))
          missing.add(note.id);
      }
      setMissingTargets((current) =>
        current.size === missing.size &&
        [...current].every((id) => missing.has(id))
          ? current
          : missing,
      );
    }
    inspectTargets();
    window.addEventListener(TARGETS_CHANGED, inspectTargets);
    return () => window.removeEventListener(TARGETS_CHANGED, inspectTargets);
  }, [canvas.instances, canvas.annotations, registry]);

  function describe(target: AnnotationTarget) {
    const instance = canvas.instances.find(
      (item) => item.id === target.instanceId,
    );
    const definition = instance && registry[instance.componentId];
    const targetLabel =
      target.target === null
        ? 'Whole component'
        : (definition?.targets?.[target.target]?.label ?? 'Removed target');
    return {
      label: `${definition?.name ?? 'Removed component'} / ${targetLabel}`,
      missing: !instance
        ? 'Component removed'
        : !definition
          ? 'Component unavailable'
          : target.target !== null && !definition.targets?.[target.target]
            ? 'Target removed'
            : null,
    };
  }

  return (
    <aside
      aria-label="Canvas notes"
      className={`${classes.panel} nodrag nopan nowheel`}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onKeyUp={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <BaseStack gap="md">
        <BaseStack gap={2}>
          <BaseText fw={600}>Notes</BaseText>
          <BaseText c="dimmed" size="xs">
            Select a note to find it on the canvas.
          </BaseText>
        </BaseStack>
        {draft && (
          <BaseStack className={classes.composer} gap="xs">
            <BaseText c="dimmed" size="xs">
              {describe(draft).label}
            </BaseText>
            <NoteComposer
              key={`${draft.instanceId}:${draft.target}:${draft.anchor.x}:${draft.anchor.y}`}
              label="New note"
              onCancel={onCancel}
              onSubmit={onAdd}
              submitLabel="Add note"
            />
          </BaseStack>
        )}
        {!canvas.annotations.length && !draft && (
          <BaseStack gap={4}>
            <BaseText size="sm">No notes yet</BaseText>
            <BaseText c="dimmed" size="sm">
              Choose Annotate, then click a component or one of its named
              targets.
            </BaseText>
          </BaseStack>
        )}
        {!!canvas.annotations.length && (
          <ul className={classes.notes}>
            {canvas.annotations.map((note) => {
              const target = describe(note);
              return (
                <NoteRow
                  key={note.id}
                  note={note}
                  label={target.label}
                  missing={
                    target.missing ??
                    (missingTargets.has(note.id)
                      ? 'Target not found uniquely'
                      : null)
                  }
                  selected={note.id === selectedNoteId}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onFocus={onFocus}
                />
              );
            })}
          </ul>
        )}
      </BaseStack>
    </aside>
  );
}

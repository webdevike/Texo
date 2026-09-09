import {
  IconCheck,
  IconMessageCircle,
  IconPencil,
  IconRotate,
  IconTrash,
} from '@tabler/icons-react';
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  BaseActionIcon,
  BaseBadge,
  BaseButton,
  BaseCheckbox,
  BaseGroup,
  BaseStack,
  BaseText,
  BaseTextarea,
  BaseTooltip,
} from '@texo/ui';

import type { CanvasPoint } from './canvas-document';
import {
  MAX_COMMENT_LENGTH,
  prototypeFile,
  type PrototypeComment,
  type PrototypeDocument,
} from './prototype-document';
import {
  useProjectDocument,
  type ProjectDocumentState,
} from './use-project-document';
import classes from './prototype.module.css';

/**
 * Prototype mode for a designed page. Hover a marked element (`data-target`),
 * click it, and describe the interaction it should have. The description is
 * saved to project/prototype.json as a request; nothing here executes it.
 */

const CARD_WIDTH = 336;

type Hit = {
  element: Element;
  target: string;
  targetLabel: string;
  record: string | null;
  recordLabel: string | null;
  /** Rendered from a repeated template (table rows): requests default to every record. */
  template: boolean;
  rect: DOMRect;
};

type Point = { x: number; y: number };

type Draft = {
  hit: Omit<Hit, 'element' | 'rect'>;
  anchor: CanvasPoint;
  point: Point;
};

type PrototypeContextValue = ProjectDocumentState<PrototypeDocument> & {
  page: string | null;
  active: boolean;
  setActive: (active: boolean) => void;
  focusedId: string | null;
  focus: (id: string | null) => void;
  visibleIds: readonly string[];
  setVisibleIds: (ids: string[]) => void;
  add: (comment: PrototypeComment) => void;
  change: (id: string, patch: Partial<PrototypeComment>) => void;
  remove: (id: string) => void;
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function usePrototype() {
  const value = useContext(PrototypeContext);
  if (!value) throw new Error('usePrototype requires PrototypeProvider.');
  return value;
}

export function PrototypeProvider({
  page,
  children,
}: {
  page: string | null;
  children: ReactNode;
}) {
  const file = useProjectDocument(prototypeFile);
  const [active, setActive] = useState(false);
  const [focusedId, focus] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  useEffect(() => {
    focus(null);
  }, [page, active]);

  const { update } = file;
  const value = useMemo<PrototypeContextValue>(
    () => ({
      ...file,
      page,
      active: active && page !== null,
      setActive,
      focusedId,
      focus,
      visibleIds,
      setVisibleIds,
      add: (comment) =>
        update((current) => ({
          ...current,
          comments: [...current.comments, comment],
        })),
      change: (id, patch) =>
        update((current) => ({
          ...current,
          comments: current.comments.map((comment) =>
            comment.id === id ? { ...comment, ...patch } : comment,
          ),
        })),
      remove: (id) =>
        update((current) => ({
          ...current,
          comments: current.comments.filter((comment) => comment.id !== id),
        })),
    }),
    [file, page, active, focusedId, visibleIds, update],
  );

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  );
}

function describe(element: Element, content: Element): Omit<Hit, 'rect'> {
  const keys: string[] = [];
  let node: Element | null = element;
  while (node && node !== content) {
    const key = (node as HTMLElement).dataset.target;
    if (key) keys.unshift(key);
    node = node.parentElement;
  }
  const data = (element as HTMLElement).dataset;
  return {
    element,
    target: keys.join('.'),
    targetLabel: data.targetLabel ?? keys[keys.length - 1] ?? 'Element',
    record: data.record ?? null,
    recordLabel: data.record ? (data.recordLabel ?? data.record) : null,
    template: data.recordTemplate !== undefined,
  };
}

function candidates(content: Element) {
  return [...content.querySelectorAll('[data-target]')];
}

function resolve(content: Element, comment: PrototypeComment) {
  return candidates(content).find((element) => {
    const described = describe(element, content);
    return (
      described.target === comment.target &&
      (comment.record === null || described.record === comment.record)
    );
  });
}

function hitTest(content: Element, x: number, y: number): Hit | null {
  let hit: Hit | null = null;
  for (const element of candidates(content)) {
    const rect = element.getBoundingClientRect();
    if (
      !rect.width ||
      !rect.height ||
      x < rect.left ||
      x > rect.right ||
      y < rect.top ||
      y > rect.bottom
    )
      continue;
    if (!hit || rect.width * rect.height < hit.rect.width * hit.rect.height)
      hit = { ...describe(element, content), rect };
  }
  return hit;
}

function subject(
  comment: Pick<PrototypeComment, 'targetLabel' | 'recordLabel'>,
) {
  return comment.recordLabel
    ? `${comment.targetLabel}: ${comment.recordLabel}`
    : comment.targetLabel;
}

export function PrototypeSurface({
  page,
  children,
}: {
  page: string;
  children: ReactNode;
}) {
  const proto = usePrototype();
  const { active, focusedId, focus, setVisibleIds } = proto;
  const comments = useMemo(
    () => (proto.document?.comments ?? []).filter((c) => c.page === page),
    [proto.document, page],
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    hit: Hit;
    box: Point & { width: number; height: number };
  } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pins, setPins] = useState<Record<string, Point>>({});
  const [rootWidth, setRootWidth] = useState(0);

  useEffect(() => {
    if (!active) {
      setDraft(null);
      setHover(null);
    }
  }, [active]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content || !active) {
      setVisibleIds([]);
      return;
    }
    let frame = 0;
    function measure() {
      if (!root || !content) return;
      const rootRect = root.getBoundingClientRect();
      const next: Record<string, Point> = {};
      for (const comment of comments) {
        const rect = resolve(content, comment)?.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) continue;
        next[comment.id] = {
          x: rect.left - rootRect.left + rect.width * comment.anchor.x,
          y: rect.top - rootRect.top + rect.height * comment.anchor.y,
        };
      }
      setPins(next);
      setRootWidth(rootRect.width);
      setVisibleIds(Object.keys(next));
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    resize.observe(content);
    const mutations = new MutationObserver(schedule);
    mutations.observe(content, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
    };
  }, [active, comments, setVisibleIds]);

  function movePointer(event: PointerEvent<HTMLButtonElement>) {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;
    const hit = hitTest(content, event.clientX, event.clientY);
    if (!hit) {
      setHover(null);
      return;
    }
    const rootRect = root.getBoundingClientRect();
    setHover({
      hit,
      box: {
        x: hit.rect.left - rootRect.left,
        y: hit.rect.top - rootRect.top,
        width: hit.rect.width,
        height: hit.rect.height,
      },
    });
  }

  function cardStyle(point: Point) {
    return {
      left: Math.max(0, Math.min(point.x + 14, rootWidth - CARD_WIDTH)),
      top: point.y + 14,
      width: CARD_WIDTH,
    };
  }

  const focused = comments.find((comment) => comment.id === focusedId) ?? null;
  const focusedPin = focused ? pins[focused.id] : undefined;

  return (
    <div
      className={classes.surface}
      data-prototype-active={active || undefined}
      ref={rootRef}
    >
      <div className={classes.content} inert={active} ref={contentRef}>
        {children}
      </div>
      {active && (
        <>
          <button
            aria-label="Describe an interaction on this page"
            className={classes.capture}
            onPointerMove={movePointer}
            onPointerLeave={() => setHover(null)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setDraft(null);
                focus(null);
              }
            }}
            onClick={(event) => {
              const root = rootRef.current;
              const content = contentRef.current;
              if (!root || !content || event.detail === 0) return;
              const hit = hitTest(content, event.clientX, event.clientY);
              focus(null);
              if (!hit) {
                setDraft(null);
                return;
              }
              const rootRect = root.getBoundingClientRect();
              const { element: _element, rect, ...described } = hit;
              setDraft({
                hit: described,
                anchor: {
                  x: Math.max(
                    0,
                    Math.min(1, (event.clientX - rect.left) / rect.width),
                  ),
                  y: Math.max(
                    0,
                    Math.min(1, (event.clientY - rect.top) / rect.height),
                  ),
                },
                point: {
                  x: event.clientX - rootRect.left,
                  y: event.clientY - rootRect.top,
                },
              });
            }}
            type="button"
          />
          {hover && !draft && (
            <div
              aria-hidden
              className={classes.highlight}
              style={{
                left: hover.box.x,
                top: hover.box.y,
                width: hover.box.width,
                height: hover.box.height,
              }}
            >
              <span className={classes.targetLabel}>{subject(hover.hit)}</span>
            </div>
          )}
          {comments.map((comment) => {
            const pin = pins[comment.id];
            if (!pin) return null;
            return (
              <button
                aria-label={`${comment.resolved ? 'Resolved request' : 'Request'} on ${subject(comment)}: ${comment.body}`}
                aria-pressed={comment.id === focusedId}
                className={classes.pin}
                data-resolved={comment.resolved || undefined}
                key={comment.id}
                onClick={() => {
                  setDraft(null);
                  focus(comment.id === focusedId ? null : comment.id);
                }}
                style={{ left: pin.x, top: pin.y }}
                type="button"
              >
                {comment.resolved ? (
                  <IconCheck size={14} />
                ) : (
                  <IconMessageCircle size={14} />
                )}
              </button>
            );
          })}
          {draft && (
            <div className={classes.card} style={cardStyle(draft.point)}>
              <span className={classes.marker} />
              <Composer
                draft={draft}
                onCancel={() => setDraft(null)}
                onSubmit={(body, onlyRecord) => {
                  proto.add({
                    id: crypto.randomUUID(),
                    page,
                    target: draft.hit.target,
                    targetLabel: draft.hit.targetLabel,
                    record: onlyRecord ? draft.hit.record : null,
                    recordLabel: onlyRecord ? draft.hit.recordLabel : null,
                    anchor: draft.anchor,
                    body,
                    resolved: false,
                  });
                  setDraft(null);
                }}
              />
            </div>
          )}
          {focused && focusedPin && (
            <div className={classes.card} style={cardStyle(focusedPin)}>
              <CommentCard comment={focused} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Composer({
  draft,
  onCancel,
  onSubmit,
}: {
  draft: Draft;
  onCancel: () => void;
  onSubmit: (body: string, onlyRecord: boolean) => void;
}) {
  const [body, setBody] = useState('');
  const [onlyRecord, setOnlyRecord] = useState(!draft.hit.template);
  const trimmed = body.trim();
  const { hit } = draft;
  return (
    <BaseStack gap="sm">
      <BaseStack gap={2}>
        <BaseText size="sm" fw={600}>
          {hit.targetLabel}
          {hit.recordLabel ? `: ${hit.recordLabel}` : ''}
        </BaseText>
        <BaseText size="xs" c="dimmed">
          Describe what should happen here. This records the request; it does
          not build it.
        </BaseText>
      </BaseStack>
      <BaseTextarea
        aria-label="Interaction request"
        autoFocus
        autosize
        maxLength={MAX_COMMENT_LENGTH}
        minRows={3}
        maxRows={8}
        onChange={(event) => setBody(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
          }
          if (
            (event.metaKey || event.ctrlKey) &&
            event.key === 'Enter' &&
            trimmed
          ) {
            event.preventDefault();
            onSubmit(trimmed, onlyRecord);
          }
        }}
        placeholder="Open a modal with the customer details"
        value={body}
      />
      {hit.record && (
        <BaseCheckbox
          checked={onlyRecord}
          label={`Only for ${hit.recordLabel}, not every ${hit.targetLabel.toLowerCase()}`}
          onChange={(event) => setOnlyRecord(event.currentTarget.checked)}
          size="xs"
        />
      )}
      <BaseGroup gap="xs" justify="flex-end">
        <BaseButton onClick={onCancel} size="compact-sm" variant="subtle">
          Cancel
        </BaseButton>
        <BaseButton
          disabled={!trimmed}
          onClick={() => onSubmit(trimmed, onlyRecord)}
          size="compact-sm"
        >
          Add request
        </BaseButton>
      </BaseGroup>
    </BaseStack>
  );
}

function StatusBadge({ resolved }: { resolved: boolean }) {
  return (
    <BaseBadge
      color={resolved ? 'gray' : 'blue'}
      fw={500}
      size="sm"
      tt="none"
      variant="light"
    >
      {resolved ? 'Resolved' : 'Requested'}
    </BaseBadge>
  );
}

function CommentCard({ comment }: { comment: PrototypeComment }) {
  const proto = usePrototype();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  useEffect(() => {
    setEditing(false);
    setBody(comment.body);
  }, [comment.id, comment.body]);
  const trimmed = body.trim();
  return (
    <BaseStack gap="sm">
      <BaseGroup gap="xs" justify="space-between" wrap="nowrap">
        <BaseText size="sm" fw={600} truncate>
          {subject(comment)}
        </BaseText>
        <StatusBadge resolved={comment.resolved} />
      </BaseGroup>
      {editing ? (
        <>
          <BaseTextarea
            aria-label="Edit request"
            autoFocus
            autosize
            maxLength={MAX_COMMENT_LENGTH}
            minRows={3}
            maxRows={8}
            onChange={(event) => setBody(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setBody(comment.body);
                setEditing(false);
              }
              if (
                (event.metaKey || event.ctrlKey) &&
                event.key === 'Enter' &&
                trimmed
              ) {
                event.preventDefault();
                proto.change(comment.id, { body: trimmed });
                setEditing(false);
              }
            }}
            value={body}
          />
          <BaseGroup gap="xs" justify="flex-end">
            <BaseButton
              onClick={() => {
                setBody(comment.body);
                setEditing(false);
              }}
              size="compact-sm"
              variant="subtle"
            >
              Cancel
            </BaseButton>
            <BaseButton
              disabled={!trimmed}
              onClick={() => {
                proto.change(comment.id, { body: trimmed });
                setEditing(false);
              }}
              size="compact-sm"
            >
              Save request
            </BaseButton>
          </BaseGroup>
        </>
      ) : (
        <>
          <BaseText className={classes.body} size="sm">
            {comment.body}
          </BaseText>
          <BaseGroup gap={4} justify="flex-end">
            <BaseTooltip label="Edit" withArrow>
              <BaseActionIcon
                aria-label="Edit request"
                onClick={() => setEditing(true)}
                size="sm"
                variant="subtle"
              >
                <IconPencil size={14} />
              </BaseActionIcon>
            </BaseTooltip>
            <BaseTooltip
              label={comment.resolved ? 'Reopen' : 'Resolve'}
              withArrow
            >
              <BaseActionIcon
                aria-label={
                  comment.resolved ? 'Reopen request' : 'Resolve request'
                }
                onClick={() =>
                  proto.change(comment.id, { resolved: !comment.resolved })
                }
                size="sm"
                variant="subtle"
              >
                {comment.resolved ? (
                  <IconRotate size={14} />
                ) : (
                  <IconCheck size={14} />
                )}
              </BaseActionIcon>
            </BaseTooltip>
            <BaseTooltip label="Delete" withArrow>
              <BaseActionIcon
                aria-label="Delete request"
                color="red"
                onClick={() => {
                  proto.remove(comment.id);
                  proto.focus(null);
                }}
                size="sm"
                variant="subtle"
              >
                <IconTrash size={14} />
              </BaseActionIcon>
            </BaseTooltip>
          </BaseGroup>
        </>
      )}
    </BaseStack>
  );
}

/** Rail panel body: every request on the current page. */
export function PrototypePanel() {
  const proto = usePrototype();
  const comments = (proto.document?.comments ?? []).filter(
    (comment) => comment.page === proto.page,
  );
  if (!proto.page) {
    return (
      <BaseText c="dimmed" size="sm">
        Open a page to see its requests.
      </BaseText>
    );
  }
  if (proto.error && !proto.document) {
    return (
      <BaseText c="red" size="sm">
        {proto.error}
      </BaseText>
    );
  }
  if (comments.length === 0) {
    return (
      <BaseText c="dimmed" size="sm">
        No requests yet. Turn on Prototype, hover an element and click it to
        describe what it should do.
      </BaseText>
    );
  }
  return (
    <BaseStack gap={0}>
      {comments.map((comment) => {
        const visible = proto.visibleIds.includes(comment.id);
        return (
          <button
            aria-pressed={comment.id === proto.focusedId}
            className={classes.row}
            key={comment.id}
            onClick={() => {
              proto.setActive(true);
              proto.focus(comment.id);
            }}
            type="button"
          >
            <BaseGroup gap="xs" justify="space-between" wrap="nowrap">
              <BaseText size="sm" fw={600} truncate>
                {subject(comment)}
              </BaseText>
              <StatusBadge resolved={comment.resolved} />
            </BaseGroup>
            <BaseText
              className={classes.body}
              c="dimmed"
              lineClamp={3}
              size="sm"
            >
              {comment.body}
            </BaseText>
            {proto.active && !visible && (
              <BaseText c="dimmed" size="xs">
                Not on screen with the current filters.
              </BaseText>
            )}
          </button>
        );
      })}
    </BaseStack>
  );
}

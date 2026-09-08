import {
  IconGripVertical,
  IconMessage,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  applyNodeChanges,
  Background,
  Controls,
  NodeResizeControl,
  ReactFlow,
  type Node as FlowNode,
  type NodeChange,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BaseButton,
  BaseGroup,
  BaseStack,
  BaseText,
  BaseTitle,
  TexoComponent,
  type TexoComponentRegistry,
} from '@texo/ui';

import { AnnotationSurface, NotesPanel } from './canvas-annotations';
import type {
  AnnotationTarget,
  CanvasInstance,
  CanvasPoint,
} from './canvas-document';
import {
  useCanvasDocument,
  type CanvasDocumentState,
} from './use-canvas-document';
import '@xyflow/react/dist/style.css';
import classes from './canvas-page.module.css';

const COMPONENT_TRANSFER = 'application/x-texo-component';
type CanvasMode = 'design' | 'annotate' | 'preview';
type ComponentNode = FlowNode<{ instance: CanvasInstance }, 'component'>;
type CanvasContextValue = CanvasDocumentState & {
  registry: TexoComponentRegistry;
  selectedId: string | null;
  select: Dispatch<SetStateAction<string | null>>;
  mode: CanvasMode;
  setMode: (mode: CanvasMode) => void;
  selectedNoteId: string | null;
  draft: AnnotationTarget | null;
  notesOpened: boolean;
  setNotesOpened: Dispatch<SetStateAction<boolean>>;
  flow: RefObject<ReactFlowInstance<ComponentNode> | null>;
  surface: RefObject<HTMLDivElement | null>;
  insert: (componentId: string, position?: CanvasPoint) => void;
  createNote: (target: AnnotationTarget) => void;
  focusNote: (id: string) => void;
  cancelNote: () => void;
  addNote: (body: string) => void;
  removeSelected: () => void;
};

const CanvasContext = createContext<CanvasContextValue | null>(null);

function useCanvas() {
  const canvas = useContext(CanvasContext);
  if (!canvas) throw new Error('Canvas components require CanvasProvider.');
  return canvas;
}

export function CanvasProvider({
  registry,
  children,
}: {
  registry: TexoComponentRegistry;
  children: ReactNode;
}) {
  const file = useCanvasDocument();
  const [selectedId, select] = useState<string | null>(null);
  const [mode, setModeState] = useState<CanvasMode>('design');
  const [selectedNoteId, selectNote] = useState<string | null>(null);
  const [draft, setDraft] = useState<AnnotationTarget | null>(null);
  const [notesOpened, setNotesOpened] = useState(false);
  const flow = useRef<ReactFlowInstance<ComponentNode> | null>(null);
  const surface = useRef<HTMLDivElement | null>(null);

  const insert = (componentId: string, position?: CanvasPoint) => {
    if (
      mode !== 'design' ||
      !file.document ||
      !Object.prototype.hasOwnProperty.call(registry, componentId)
    )
      return;
    const bounds = surface.current?.getBoundingClientRect();
    const center =
      bounds && flow.current
        ? flow.current.screenToFlowPosition({
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          })
        : { x: 240, y: 160 };
    const instance: CanvasInstance = {
      id: crypto.randomUUID(),
      componentId,
      props: structuredClone(registry[componentId].defaultProps),
      position: position ?? { x: center.x - 160, y: center.y - 40 },
      width: 320,
    };
    file.update((current) => ({
      ...current,
      instances: [...current.instances, instance],
    }));
    select(instance.id);
  };

  const focusNote = (id: string) => {
    const note = file.document?.annotations.find(
      (annotation) => annotation.id === id,
    );
    if (!note) return;
    selectNote(id);
    setDraft(null);
    setNotesOpened(true);
    select(note.instanceId);
    if (
      file.document?.instances.some(
        (instance) => instance.id === note.instanceId,
      )
    ) {
      requestAnimationFrame(() => {
        void flow.current?.fitView({
          nodes: [{ id: note.instanceId }],
          padding: 0.6,
          maxZoom: 1,
          duration: 250,
        });
      });
    }
  };

  const createNote = (target: AnnotationTarget) => {
    if (mode !== 'annotate' || !file.document) return;
    setDraft(target);
    selectNote(null);
    select(target.instanceId);
    setNotesOpened(true);
  };

  const addNote = (body: string) => {
    if (!draft || !body.trim() || body.length > 4000) return;
    const id = crypto.randomUUID();
    file.update((current) => ({
      ...current,
      annotations: [
        ...current.annotations,
        { ...draft, id, body: body.trim(), resolved: false },
      ],
    }));
    setDraft(null);
    selectNote(id);
  };

  const removeSelected = useCallback(() => {
    if (mode !== 'design' || !selectedId) return;
    file.update((current) => ({
      ...current,
      instances: current.instances.filter(
        (instance) => instance.id !== selectedId,
      ),
    }));
    select(null);
    setDraft((current) =>
      current?.instanceId === selectedId ? null : current,
    );
  }, [mode, selectedId, file.update]);

  return (
    <CanvasContext.Provider
      value={{
        ...file,
        registry,
        selectedId,
        select,
        mode,
        setMode: (next) => {
          setModeState(next);
          setDraft(null);
        },
        selectedNoteId,
        draft,
        notesOpened,
        setNotesOpened,
        flow,
        surface,
        insert,
        createNote,
        focusNote,
        cancelNote: () => setDraft(null),
        addNote,
        removeSelected,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function CanvasLibrary() {
  const { registry, document, mode, insert } = useCanvas();
  const navigate = useNavigate();
  const designing = mode === 'design' && document !== null;
  return (
    <BaseStack gap="sm">
      {!designing && (
        <BaseText c="dimmed" size="sm">
          {document
            ? 'Switch to Design to add components.'
            : 'Load the canvas document to add components.'}
        </BaseText>
      )}
      <ul aria-label="Canvas components" className={classes.library}>
        {Object.entries(registry).map(([id, definition]) => (
          <li
            className={classes.libraryRow}
            draggable={designing}
            key={id}
            onDragStart={
              designing
                ? (event) => {
                    event.dataTransfer.setData(COMPONENT_TRANSFER, id);
                    event.dataTransfer.effectAllowed = 'copy';
                  }
                : undefined
            }
          >
            <IconGripVertical aria-hidden size={16} className={classes.grip} />
            <BaseText className={classes.componentName} size="sm">
              {definition.name}
            </BaseText>
            <BaseButton
              aria-label={`Add ${definition.name} to canvas`}
              disabled={!designing}
              leftSection={<IconPlus aria-hidden size={14} />}
              onClick={() => {
                insert(id);
                navigate('/canvas');
              }}
              size="compact-xs"
              variant="subtle"
            >
              Add
            </BaseButton>
          </li>
        ))}
      </ul>
    </BaseStack>
  );
}

function CanvasComponentNode({ data, selected }: NodeProps<ComponentNode>) {
  const {
    registry,
    document,
    update,
    mode,
    selectedNoteId,
    createNote,
    focusNote,
  } = useCanvas();
  const { instance } = data;
  const definition = registry[instance.componentId];
  const previewing = mode === 'preview';
  const content = definition ? (
    <AnnotationSurface
      instance={instance}
      definition={definition}
      annotations={
        document?.annotations.filter(
          (note) => note.instanceId === instance.id,
        ) ?? []
      }
      mode={mode}
      selectedNoteId={selectedNoteId}
      onCreate={createNote}
      onSelect={focusNote}
    >
      <TexoComponent
        id={instance.componentId}
        props={instance.props}
        registry={registry}
      />
    </AnnotationSurface>
  ) : (
    <BaseText size="sm">Component unavailable: {instance.componentId}</BaseText>
  );

  return (
    <div
      className={`${classes.instance}${mode !== 'design' ? ' nodrag nopan' : ''}${previewing ? ' nowheel' : ''}`}
      data-instance-id={instance.id}
      data-selected={selected || undefined}
      data-mode={mode}
    >
      {!previewing && (
        <div className={classes.nodeLabel}>
          {definition?.name ?? instance.componentId}
        </div>
      )}
      {content}
      {mode === 'design' &&
        selected &&
        (['left', 'right'] as const).map((position) => (
          <NodeResizeControl
            key={position}
            position={position}
            resizeDirection="horizontal"
            minWidth={160}
            maxWidth={4000}
            className={classes.resizeHandle}
            onResizeEnd={(_event, params) =>
              update((current) => ({
                ...current,
                instances: current.instances.map((item) =>
                  item.id === instance.id
                    ? {
                        ...item,
                        width: params.width,
                        position: { x: params.x, y: params.y },
                      }
                    : item,
                ),
              }))
            }
          />
        ))}
    </div>
  );
}

const nodeTypes = { component: CanvasComponentNode };
const noEdges: [] = [];

export function CanvasPage() {
  const canvas = useCanvas();
  const {
    registry,
    document,
    update,
    selectedId,
    select,
    mode,
    setMode,
    flow,
    surface,
    insert,
    selectedNoteId,
    draft,
    notesOpened,
    setNotesOpened,
    focusNote,
    cancelNote,
    addNote,
    removeSelected,
    save,
    reload,
    dirty,
    busy,
    error,
    conflict,
  } = canvas;
  const [nodes, setNodes] = useState<ComponentNode[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const designing = mode === 'design' && document !== null;
  const previewing = mode === 'preview';
  const fitOnLoad = useRef<boolean | null>(null);
  if (document && fitOnLoad.current === null)
    fitOnLoad.current = document.instances.length > 0;

  useEffect(() => {
    setNodes((current) =>
      (document?.instances ?? []).map((instance) => ({
        id: instance.id,
        type: 'component',
        position: instance.position,
        style: { width: instance.width, pointerEvents: 'all' },
        data: { instance },
        selected:
          current.find((node) => node.id === instance.id)?.selected ?? false,
      })),
    );
  }, [document]);

  useEffect(() => {
    setNodes((current) =>
      current.map((node) => ({ ...node, selected: node.id === selectedId })),
    );
  }, [selectedId, document]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || !designing) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest(
          'input, textarea, select, [contenteditable="true"], [role="textbox"]',
        )
      )
        return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!selectedId) return;
        event.preventDefault();
        removeSelected();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [designing, selectedId, removeSelected]);

  useEffect(() => {
    const clearDrop = () => setDropActive(false);
    clearDrop();
    window.addEventListener('dragend', clearDrop);
    window.addEventListener('drop', clearDrop);
    window.addEventListener('blur', clearDrop);
    return () => {
      window.removeEventListener('dragend', clearDrop);
      window.removeEventListener('drop', clearDrop);
      window.removeEventListener('blur', clearDrop);
      flow.current = null;
    };
  }, [flow]);

  const changeNodes = useCallback(
    (changes: NodeChange<ComponentNode>[]) => {
      setNodes((current) => applyNodeChanges(changes, current));
      const selection = changes.find(
        (change) => change.type === 'select' && change.selected,
      );
      if (selection?.type === 'select') select(selection.id);
      if (designing) {
        const positions = changes.filter(
          (change) =>
            change.type === 'position' &&
            change.dragging === false &&
            change.position,
        );
        if (positions.length)
          update((current) => ({
            ...current,
            instances: current.instances.map((instance) => {
              const change = positions.find((item) => item.type === 'position' && item.id === instance.id);
              return change?.type === 'position' && change.position
                ? { ...instance, position: change.position }
                : instance;
            }),
          }));
      }
    },
    [select, designing, update],
  );

  const allowDrop = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes(COMPONENT_TRANSFER)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDropActive(true);
  };

  const reloadDocument = () => {
    if (
      (dirty || draft) &&
      !window.confirm('Discard unsaved canvas changes and reload from disk?')
    )
      return;
    cancelNote();
    void reload();
  };

  const status = !document
    ? 'Canvas document unavailable'
    : conflict
      ? 'Disk changed. Reload to review before saving.'
      : busy
        ? 'Syncing canvas…'
        : dirty
          ? 'Unsaved changes'
          : 'Saved to project/canvas.json';

  return (
    <BaseStack className={classes.workspace} gap="sm">
      <BaseGroup
        align="center"
        justify="space-between"
        className={classes.toolbar}
      >
        <BaseStack gap={0}>
          <BaseTitle order={2} size="h3">
            Canvas
          </BaseTitle>
          <BaseText c="dimmed" size="xs" role="status">
            {status}
          </BaseText>
        </BaseStack>
        <BaseGroup gap="xs">
          <BaseGroup aria-label="Canvas mode" gap={4} role="group">
            {(['design', 'annotate', 'preview'] as const).map((value) => (
              <BaseButton
                key={value}
                aria-pressed={mode === value}
                disabled={!document}
                onClick={() => setMode(value)}
                size="compact-sm"
                variant={mode === value ? 'light' : 'subtle'}
              >
                {value === 'design'
                  ? 'Design'
                  : value === 'annotate'
                    ? 'Annotate'
                    : 'Preview'}
              </BaseButton>
            ))}
          </BaseGroup>
          {!previewing && (
            <BaseButton
              aria-pressed={notesOpened}
              disabled={!document}
              leftSection={<IconMessage size={15} />}
              onClick={() => setNotesOpened((current) => !current)}
              size="compact-sm"
              variant="subtle"
            >
              Notes
            </BaseButton>
          )}
          {designing && (
            <BaseButton
              disabled={
                !document.instances.some(
                  (instance) => instance.id === selectedId,
                )
              }
              leftSection={<IconTrash size={15} />}
              onClick={removeSelected}
              size="compact-sm"
              variant="subtle"
            >
              Delete
            </BaseButton>
          )}
          <BaseButton
            disabled={busy}
            onClick={reloadDocument}
            size="compact-sm"
            variant="default"
          >
            Reload
          </BaseButton>
          <BaseButton
            disabled={!document || !dirty || busy || conflict}
            onClick={() => void save()}
            size="compact-sm"
          >
            Save
          </BaseButton>
        </BaseGroup>
      </BaseGroup>
      {error && (
        <div role="alert" className={classes.error}>
          {error}
        </div>
      )}
      <div className={classes.editor}>
        <div
          ref={surface}
          aria-label={previewing ? 'Page preview' : 'Freeform canvas'}
          className={classes.page}
          data-mode={mode}
          data-drop-active={(designing && dropActive) || undefined}
          onDragEnter={designing ? allowDrop : undefined}
          onDragOver={designing ? allowDrop : undefined}
          onDragLeave={
            designing
              ? (event) => {
                  if (
                    !(event.relatedTarget instanceof globalThis.Node) ||
                    !event.currentTarget.contains(event.relatedTarget)
                  )
                    setDropActive(false);
                }
              : undefined
          }
          onDrop={
            designing
              ? (event) => {
                  setDropActive(false);
                  if (
                    !event.dataTransfer.types.includes(COMPONENT_TRANSFER) ||
                    !flow.current
                  )
                    return;
                  event.preventDefault();
                  insert(
                    event.dataTransfer.getData(COMPONENT_TRANSFER),
                    flow.current.screenToFlowPosition({
                      x: event.clientX,
                      y: event.clientY,
                    }),
                  );
                }
              : undefined
          }
        >
          {document ? (
            <ReactFlow<ComponentNode>
              nodes={nodes}
              edges={noEdges}
              nodeTypes={nodeTypes}
              onInit={(instance) => {
                flow.current = instance;
              }}
              onNodesChange={changeNodes}
              onNodeClick={
                previewing ? undefined : (_event, node) => select(node.id)
              }
              onPaneClick={previewing ? undefined : () => select(null)}
              nodesDraggable={designing}
              nodesConnectable={false}
              elementsSelectable={!previewing}
              nodeExtent={[
                [-1_000_000, -1_000_000],
                [1_000_000, 1_000_000],
              ]}
              nodesFocusable={!previewing}
              edgesFocusable={false}
              deleteKeyCode={null}
              multiSelectionKeyCode={null}
              selectionKeyCode={null}
              selectionOnDrag={false}
              panOnDrag={!previewing}
              panOnScroll={!previewing}
              zoomOnScroll={!previewing}
              zoomOnPinch={!previewing}
              zoomOnDoubleClick={!previewing}
              preventScrolling={!previewing}
              minZoom={0.1}
              maxZoom={2}
              fitView={fitOnLoad.current ?? false}
              fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
            >
              {!previewing && (
                <>
                  <Background gap={20} size={1} />
                  <Controls showInteractive={false} />
                </>
              )}
            </ReactFlow>
          ) : (
            <BaseStack className={classes.unavailable} gap={4}>
              <BaseText fw={600}>
                {busy ? 'Loading canvas…' : 'Canvas could not be loaded'}
              </BaseText>
              <BaseText c="dimmed" size="sm">
                {busy
                  ? 'Reading project/canvas.json.'
                  : 'Resolve the document error, then choose Reload.'}
              </BaseText>
            </BaseStack>
          )}
          {document?.instances.length === 0 && (
            <BaseStack className={classes.empty} gap={4}>
              <BaseText fw={600}>
                {designing ? 'Start with a component' : 'Your canvas is empty'}
              </BaseText>
              <BaseText c="dimmed" size="sm">
                {designing
                  ? 'Drag from the library, or choose Add. Place and resize components freely.'
                  : 'Switch to Design to add components from the library.'}
              </BaseText>
            </BaseStack>
          )}
          {designing && dropActive && (
            <div className={classes.dropFeedback} role="status">
              Drop to place component
            </div>
          )}
        </div>
        {!previewing && notesOpened && document && (
          <div className={classes.notes}>
            <NotesPanel
              document={document}
              registry={registry}
              draft={draft}
              selectedNoteId={selectedNoteId}
              onCancel={cancelNote}
              onAdd={addNote}
              onFocus={focusNote}
              onUpdate={(id, patch) =>
                update((current) => ({
                  ...current,
                  annotations: current.annotations.map((note) =>
                    note.id === id ? { ...note, ...patch } : note,
                  ),
                }))
              }
              onDelete={(id) =>
                update((current) => ({
                  ...current,
                  annotations: current.annotations.filter(
                    (note) => note.id !== id,
                  ),
                }))
              }
            />
          </div>
        )}
      </div>
    </BaseStack>
  );
}

import { IconGripVertical, IconPlus } from '@tabler/icons-react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type DragEvent,
  type ReactNode,
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

import classes from './canvas-page.module.css';

const COMPONENT_TRANSFER = 'application/x-texo-component';
type CanvasMode = 'design' | 'preview';

type CanvasInstance = {
  id: string;
  componentId: string;
  props: Record<string, unknown>;
};

type CanvasContextValue = {
  registry: TexoComponentRegistry;
  instances: CanvasInstance[];
  selectedId: string | null;
  mode: CanvasMode;
  insert: (componentId: string) => void;
  select: (id: string) => void;
  setMode: (mode: CanvasMode) => void;
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
  const [instances, setInstances] = useState<CanvasInstance[]>([]);
  const [selectedId, select] = useState<string | null>(null);
  const [mode, setMode] = useState<CanvasMode>('design');

  const insert = (componentId: string) => {
    if (
      mode !== 'design' ||
      !Object.prototype.hasOwnProperty.call(registry, componentId)
    )
      return;
    const instance: CanvasInstance = {
      id: crypto.randomUUID(),
      componentId,
      props: structuredClone(registry[componentId].defaultProps),
    };
    setInstances((current) => [...current, instance]);
    select(instance.id);
  };

  return (
    <CanvasContext.Provider
      value={{ registry, instances, selectedId, mode, insert, select, setMode }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function CanvasLibrary() {
  const { registry, mode, insert } = useCanvas();
  const navigate = useNavigate();
  const designing = mode === 'design';

  return (
    <BaseStack gap="sm">
      {!designing && (
        <BaseText c="dimmed" size="sm">
          Switch to Design to add components.
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

export function CanvasPage() {
  const { registry, instances, selectedId, mode, insert, select, setMode } =
    useCanvas();
  const [dropActive, setDropActive] = useState(false);
  const designing = mode === 'design';

  useEffect(() => {
    const clearDrop = () => setDropActive(false);
    const cancelDrag = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearDrop();
    };
    clearDrop();
    if (!designing) return;
    window.addEventListener('dragend', clearDrop);
    window.addEventListener('drop', clearDrop);
    window.addEventListener('blur', clearDrop);
    window.addEventListener('keydown', cancelDrag);
    return () => {
      window.removeEventListener('dragend', clearDrop);
      window.removeEventListener('drop', clearDrop);
      window.removeEventListener('blur', clearDrop);
      window.removeEventListener('keydown', cancelDrag);
    };
  }, [designing]);

  const allowDrop = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes(COMPONENT_TRANSFER)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDropActive(true);
  };

  return (
    <BaseStack className={classes.workspace} gap="md">
      <BaseGroup align="center" justify="space-between">
        <BaseStack gap={0}>
          <BaseTitle order={2} size="h3">
            Canvas
          </BaseTitle>
          <BaseText c="dimmed" size="xs">
            Not saved. This canvas lasts until you reload.
          </BaseText>
        </BaseStack>
        <BaseGroup aria-label="Canvas mode" gap={4} role="group">
          <BaseButton
            aria-pressed={designing}
            onClick={() => setMode('design')}
            size="compact-sm"
            variant={designing ? 'light' : 'subtle'}
          >
            Design
          </BaseButton>
          <BaseButton
            aria-pressed={!designing}
            onClick={() => setMode('preview')}
            size="compact-sm"
            variant={!designing ? 'light' : 'subtle'}
          >
            Preview
          </BaseButton>
        </BaseGroup>
      </BaseGroup>

      <section
        aria-label={designing ? 'Design canvas' : 'Page preview'}
        className={classes.page}
        data-drop-active={(designing && dropActive) || undefined}
        onDragEnter={designing ? allowDrop : undefined}
        onDragOver={designing ? allowDrop : undefined}
        onDragLeave={
          designing
            ? (event) => {
                if (
                  !(event.relatedTarget instanceof Node) ||
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
                if (!event.dataTransfer.types.includes(COMPONENT_TRANSFER))
                  return;
                event.preventDefault();
                insert(event.dataTransfer.getData(COMPONENT_TRANSFER));
              }
            : undefined
        }
      >
        {instances.length === 0 ? (
          <BaseStack className={classes.empty} gap={4}>
            <BaseText fw={600}>
              {designing ? 'Start with a component' : 'Your canvas is empty'}
            </BaseText>
            <BaseText c="dimmed" size="sm">
              {designing
                ? 'Drag a component from the canvas library onto this page, or choose Add.'
                : 'Switch to Design to add components from the library.'}
            </BaseText>
          </BaseStack>
        ) : null}

        {instances.map((instance, index) => {
          const name =
            registry[instance.componentId]?.name ?? instance.componentId;
          const selected = selectedId === instance.id;
          return (
            <div
              className={classes.instance}
              data-instance-id={instance.id}
              key={instance.id}
            >
              <div className={classes.content} inert={designing}>
                <TexoComponent
                  id={instance.componentId}
                  props={instance.props}
                  registry={registry}
                />
              </div>
              {designing ? (
                <button
                  aria-label={`Select ${name}, component ${index + 1}`}
                  aria-pressed={selected}
                  className={classes.selection}
                  data-selected={selected || undefined}
                  onClick={() => select(instance.id)}
                  onFocus={() => select(instance.id)}
                  type="button"
                >
                  {selected ? (
                    <span className={classes.selectionLabel}>{name}</span>
                  ) : null}
                </button>
              ) : null}
            </div>
          );
        })}

        {designing && dropActive ? (
          <div className={classes.dropFeedback} role="status">
            Drop to add to this page
          </div>
        ) : null}
      </section>
    </BaseStack>
  );
}

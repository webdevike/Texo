/** Serializable context shared by workspace features, chat history, and agent delivery. */
export type ContextState<T> =
  | { status: 'ready'; value: T }
  | { status: 'loading'; reason: string }
  | { status: 'unavailable'; reason: string };

export type AgentTarget = {
  key: string;
  label: string;
  record?: string;
  recordLabel?: string;
};

export type AgentRequest = {
  id: string;
  body: string;
  target: AgentTarget;
};

export type AgentPreviewContext = {
  page: ContextState<{ id: string; label: string; sourcePath: string; previewUrl: string }>;
  targets: ContextState<AgentTarget[]>;
};

export type AgentPrototypeContext = {
  active: boolean;
  /** Ready with null means nothing selected; unavailable is not an empty selection. */
  selection: ContextState<AgentTarget | null>;
  requests: ContextState<AgentRequest[]>;
};

export type AgentCanvasContext = {
  mode: 'design' | 'annotate' | 'preview';
  selection: ContextState<{
    instanceId: string;
    componentId: string;
    label: string;
    props: Record<string, unknown>;
    target?: AgentTarget;
  } | null>;
  requests: ContextState<AgentRequest[]>;
};

export type AgentContextSources = {
  preview: AgentPreviewContext;
  prototype: AgentPrototypeContext;
  canvas: AgentCanvasContext;
};

export type AgentContextSnapshot = {
  version: 1;
  capturedAt: number;
  route: string;
  surface: 'workspace' | 'preview' | 'canvas';
  label: string;
  preview?: AgentPreviewContext;
  prototype?: AgentPrototypeContext;
  canvas?: AgentCanvasContext;
};

import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCanvasDocument, type CanvasDocument } from './canvas-document';

export type CanvasDocumentState = {
  document: CanvasDocument | null;
  update: (fn: (document: CanvasDocument) => CanvasDocument) => void;
  save: () => Promise<void>;
  reload: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
  error: string | null;
  conflict: boolean;
};

type State = {
  document: CanvasDocument | null;
  revision: string | null;
  dirty: boolean;
  busy: boolean;
  error: string | null;
  conflict: boolean;
};

type Operation = {
  controller: AbortController;
  kind: 'read' | 'reload' | 'save';
};
const conflictMessage =
  'project/canvas.json changed elsewhere. Your local changes are retained. Reload to discard them and use the file.';

class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function responseData(
  response: Response,
): Promise<Record<string, unknown>> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      'The canvas file API did not return JSON. Check that the Vite canvas plugin is running.',
    );
  }
  if (!data || typeof data !== 'object' || Array.isArray(data))
    throw new Error('Invalid canvas file API response.');
  const record = data as Record<string, unknown>;
  if (!response.ok)
    throw new RequestError(
      response.status,
      typeof record.error === 'string'
        ? record.error
        : `Canvas request failed (${response.status}).`,
    );
  if (
    typeof record.revision !== 'string' ||
    !/^[a-f0-9]{64}$/.test(record.revision)
  )
    throw new Error('Canvas file API returned an invalid revision.');
  return record;
}

export function useCanvasDocument(): CanvasDocumentState {
  const [state, setState] = useState<State>({
    document: null,
    revision: null,
    dirty: false,
    busy: true,
    error: null,
    conflict: false,
  });
  const current = useRef(state);
  const mounted = useRef(false);
  const operation = useRef<Operation | null>(null);
  const editVersion = useRef(0);
  const commit = useCallback((next: State) => {
    current.current = next;
    if (mounted.current) setState(next);
  }, []);

  const load = useCallback(
    async (explicit: boolean) => {
      if (!mounted.current || operation.current?.kind === 'save') return;
      if (operation.current && !explicit) return;
      operation.current?.controller.abort();
      const request: Operation = {
        controller: new AbortController(),
        kind: explicit ? 'reload' : 'read',
      };
      operation.current = request;
      const startingEdit = editVersion.current;
      if (explicit || !current.current.document)
        commit({ ...current.current, busy: true, error: null });
      try {
        const data = await responseData(
          await fetch('/__texo/canvas', {
            cache: 'no-store',
            signal: request.controller.signal,
          }),
        );
        validateCanvasDocument(data.document);
        if (!mounted.current || operation.current !== request) return;
        const latest = current.current;
        if (explicit && startingEdit !== editVersion.current) {
          commit({
            ...latest,
            busy: false,
            conflict: true,
            error:
              'The canvas was edited while reloading. Those edits were retained. Reload again to discard them.',
          });
        } else if (explicit || !latest.document) {
          commit({
            document: data.document,
            revision: data.revision as string,
            dirty: false,
            busy: false,
            error: null,
            conflict: false,
          });
        } else if (
          latest.conflict ||
          (latest.dirty && latest.revision !== data.revision)
        ) {
          commit({
            ...latest,
            busy: false,
            conflict: true,
            error: conflictMessage,
          });
        } else if (latest.revision !== data.revision) {
          commit({
            document: data.document,
            revision: data.revision as string,
            dirty: false,
            busy: false,
            error: null,
            conflict: false,
          });
        } else if (latest.error || latest.busy) {
          commit({ ...latest, busy: false, error: null });
        }
      } catch (error) {
        if (
          !mounted.current ||
          operation.current !== request ||
          request.controller.signal.aborted
        )
          return;
        commit({
          ...current.current,
          busy: false,
          conflict:
            current.current.conflict ||
            (current.current.dirty &&
              error instanceof RequestError &&
              error.status === 422),
          error:
            error instanceof Error
              ? error.message
              : 'Could not load project/canvas.json.',
        });
      } finally {
        if (operation.current === request) operation.current = null;
      }
    },
    [commit],
  );

  const update = useCallback(
    (fn: (document: CanvasDocument) => CanvasDocument) => {
      const previous = current.current;
      if (!previous.document) return;
      const document = fn(previous.document);
      if (document === previous.document) return;
      editVersion.current++;
      commit({ ...previous, document, dirty: true });
    },
    [commit],
  );

  const save = useCallback(async () => {
    const snapshot = current.current;
    if (
      !mounted.current ||
      !snapshot.document ||
      !snapshot.revision ||
      snapshot.busy
    )
      return;
    if (snapshot.conflict) {
      commit({ ...snapshot, error: conflictMessage });
      return;
    }
    if (!snapshot.dirty) return;
    let body: string;
    try {
      validateCanvasDocument(snapshot.document);
      body = JSON.stringify({
        document: snapshot.document,
        revision: snapshot.revision,
      });
    } catch (error) {
      commit({
        ...snapshot,
        error:
          error instanceof Error
            ? error.message
            : 'The canvas cannot be saved.',
      });
      return;
    }
    operation.current?.controller.abort();
    const request: Operation = {
      controller: new AbortController(),
      kind: 'save',
    };
    operation.current = request;
    const savedEdit = editVersion.current;
    commit({ ...snapshot, busy: true, error: null });
    try {
      const data = await responseData(
        await fetch('/__texo/canvas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-texo-editor': '1' },
          body,
          signal: request.controller.signal,
        }),
      );
      if (!mounted.current || operation.current !== request) return;
      commit({
        ...current.current,
        revision: data.revision as string,
        dirty: savedEdit !== editVersion.current,
        busy: false,
        error: null,
      });
    } catch (error) {
      if (
        !mounted.current ||
        operation.current !== request ||
        request.controller.signal.aborted
      )
        return;
      commit({
        ...current.current,
        busy: false,
        conflict:
          current.current.conflict ||
          (error instanceof RequestError &&
            (error.status === 409 || error.status === 422)),
        error:
          error instanceof Error
            ? error.message
            : 'Could not save project/canvas.json.',
      });
    } finally {
      if (operation.current === request) operation.current = null;
    }
  }, [commit]);

  const reload = useCallback(() => load(true), [load]);
  useEffect(() => {
    mounted.current = true;
    void load(false);
    const interval = window.setInterval(() => {
      void load(false);
    }, 2000);
    return () => {
      mounted.current = false;
      window.clearInterval(interval);
      operation.current?.controller.abort();
      operation.current = null;
    };
  }, [load]);

  return {
    document: state.document,
    update,
    save,
    reload,
    dirty: state.dirty,
    busy: state.busy,
    error: state.error,
    conflict: state.conflict,
  };
}

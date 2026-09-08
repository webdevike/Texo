// `useOptimistic(store, entity)`: create/update/remove that show immediately (the live cache applies
// them before the server answers and rolls back on reject) plus in-flight bookkeeping for the UI:
// `pending` counts calls still awaiting the server, `pendingIds` names the rows they touch (a
// temporary id for creates), `error` is the last rejection until the next call succeeds.
import { useCallback, useMemo, useState } from "react";
import { isTempId, liveOf } from "../../../experiments/contracts-spike/adapters/store-live";
import type { Entity, Input, Row } from "../../../experiments/contracts-spike/contracts/entity";
import type { ClientStore } from "../../../experiments/contracts-spike/contracts/store";

export interface OptimisticWrites {
  create(input: Input): Promise<Row>;
  update(id: string, patch: Input): Promise<Row>;
  remove(id: string): Promise<void>;
  /** Calls still awaiting the server. */
  pending: number;
  /** Ids touched by in-flight update/remove calls. Creates show up as rows whose id `isTempId`. */
  pendingIds: ReadonlySet<string>;
  error?: unknown;
  /** True for a row that exists only optimistically so far. */
  isTemp(id: string): boolean;
}

export function useOptimistic(store: ClientStore, entity: Entity): OptimisticWrites {
  const live = useMemo(() => liveOf(store), [store]);
  const [pending, setPending] = useState(0);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<unknown>();

  const track = useCallback(async <T>(id: string | undefined, run: () => Promise<T>): Promise<T> => {
    setPending((n) => n + 1);
    if (id) setPendingIds((s) => new Set(s).add(id));
    try {
      const out = await run();
      setError(undefined);
      return out;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setPending((n) => n - 1);
      if (id) {
        setPendingIds((s) => {
          const next = new Set(s);
          next.delete(id);
          return next;
        });
      }
    }
  }, []);

  return {
    create: useCallback((input) => track(undefined, () => live.create(entity, input)), [track, live, entity]),
    update: useCallback((id, patch) => track(id, () => live.update(entity, id, patch)), [track, live, entity]),
    remove: useCallback((id) => track(id, () => live.remove(entity, id)), [track, live, entity]),
    pending,
    pendingIds,
    error,
    isTemp: isTempId,
  };
}

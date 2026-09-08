// `useLive(store, entity, query)`: a ListQuery that stays current. Works with any ClientStore:
// the store is wrapped in (or already is) a live cache, so rows update from optimistic writes and
// the change feed without refetching. The query is compared by value, so callers may pass literals.
import { useEffect, useMemo, useState } from "react";
import { liveOf } from "../../../experiments/contracts-spike/adapters/store-live";
import type { Entity, Row } from "../../../experiments/contracts-spike/contracts/entity";
import type { ClientStore, ListQuery } from "../../../experiments/contracts-spike/contracts/store";

export interface LiveResult {
  rows: Row[];
  total: number;
  /** True until the first page arrives. */
  loading: boolean;
}

const EMPTY: LiveResult = { rows: [], total: 0, loading: true };

export function useLive(store: ClientStore, entity: Entity, query: ListQuery = {}): LiveResult {
  const key = JSON.stringify(query);
  // The query object identity changes every render; its value is what the watcher keys on.
  const stable = useMemo<ListQuery>(() => JSON.parse(key), [key]);
  const [state, setState] = useState<LiveResult>(EMPTY);

  useEffect(() => {
    setState(EMPTY);
    return liveOf(store).watch(entity, stable, ({ rows, total }) => setState({ rows, total, loading: false }));
  }, [store, entity, stable]);

  return state;
}

// useList: the list surface's one data hook. Owns a ListQuery, debounces `search`, keeps the
// previous rows visible while the next page loads (no flicker), and discards stale responses.
// Paging is offset based: `loadMore` appends the next page, anything else resets to offset 0.
import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Entity, Row } from "../../../experiments/contracts-spike/contracts/entity";
import type { ClientStore, ListQuery, Where } from "../../../experiments/contracts-spike/contracts/store";

export type Order = { field: string; direction: "asc" | "desc" };

export interface ListState {
  rows: Row[];
  total: number;
  loading: boolean;
  error?: string;
  query: ListQuery;
  /** Rows loaded so far are fewer than `total`. */
  hasMore: boolean;
}

export interface ListHandle extends ListState {
  setQuery: (patch: Partial<Pick<ListQuery, "where" | "search" | "orderBy" | "limit">>) => void;
  setSearch: (search: string) => void;
  setWhere: (where: Where) => void;
  setOrderBy: (orderBy: Order[]) => void;
  loadMore: () => void;
  refetch: () => void;
}

type Action =
  | { type: "query"; query: ListQuery }
  | { type: "start" }
  | { type: "page"; rows: Row[]; total: number; append: boolean }
  | { type: "error"; error: string };

const DEFAULT_LIMIT = 100;

function reduce(state: ListState, action: Action): ListState {
  switch (action.type) {
    case "query":
      return { ...state, query: action.query, loading: true, error: undefined };
    case "start":
      return { ...state, loading: true, error: undefined };
    case "page": {
      const rows = action.append ? state.rows.concat(action.rows) : action.rows;
      return { ...state, rows, total: action.total, loading: false, error: undefined, hasMore: rows.length < action.total };
    }
    case "error":
      return { ...state, loading: false, error: action.error };
  }
}

export function useList(store: ClientStore, entity: Entity, initial: ListQuery = {}, searchDebounceMs = 200): ListHandle {
  const [state, dispatch] = useReducer(reduce, undefined, () => ({
    rows: [],
    total: 0,
    loading: true,
    query: { limit: DEFAULT_LIMIT, offset: 0, ...initial },
    hasMore: false,
  }));
  const latest = useRef(state);
  latest.current = state;
  const seq = useRef(0);
  const searchTimer = useRef<number | undefined>(undefined);

  const run = useCallback(
    async (query: ListQuery, append: boolean) => {
      const mine = ++seq.current;
      try {
        const page = await store.list(entity, query);
        if (mine !== seq.current) return;
        dispatch({ type: "page", rows: page.rows, total: page.total, append });
      } catch (e) {
        if (mine !== seq.current) return;
        dispatch({ type: "error", error: e instanceof Error ? e.message : String(e) });
      }
    },
    [store, entity],
  );

  // Every query change (except loadMore, which drives `run` directly) refetches from offset 0.
  useEffect(() => {
    void run({ ...state.query, offset: 0 }, false);
  }, [run, state.query]);

  useEffect(() => () => window.clearTimeout(searchTimer.current), []);

  const setQuery = useCallback<ListHandle["setQuery"]>((patch) => {
    const prev = latest.current.query;
    const next = { ...prev, ...patch, offset: 0 };
    if (JSON.stringify(prev) === JSON.stringify(next)) return;
    dispatch({ type: "query", query: next });
  }, []);

  const setSearch = useCallback(
    (search: string) => {
      window.clearTimeout(searchTimer.current);
      searchTimer.current = window.setTimeout(() => setQuery({ search: search.trim() || undefined }), searchDebounceMs);
    },
    [setQuery, searchDebounceMs],
  );

  const loadMore = useCallback(() => {
    const s = latest.current;
    if (s.loading || !s.hasMore) return;
    dispatch({ type: "start" });
    void run({ ...s.query, offset: s.rows.length }, true);
  }, [run]);

  const refetch = useCallback(() => {
    const s = latest.current;
    dispatch({ type: "start" });
    // Re-read everything currently on screen in one call so scroll position survives.
    void run({ ...s.query, offset: 0, limit: Math.max(s.query.limit ?? DEFAULT_LIMIT, s.rows.length) }, false);
  }, [run]);

  return {
    ...state,
    setQuery,
    setSearch,
    setWhere: useCallback((where: Where) => setQuery({ where: Object.keys(where).length ? where : undefined }), [setQuery]),
    setOrderBy: useCallback((orderBy: Order[]) => setQuery({ orderBy: orderBy.length ? orderBy : undefined }), [setQuery]),
    loadMore,
    refetch,
  };
}

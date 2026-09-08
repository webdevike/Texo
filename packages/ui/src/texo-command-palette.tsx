import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { BaseBox, BaseKbd, BaseModal, BaseText, BaseTextInput } from './components';
import classes from './texo-command-palette.module.css';
import { formatKeys, keysOf } from './texo-hotkeys';

/** What the palette lists. The app maps its registry commands (and dynamic ones) onto this. */
export interface TexoPaletteItem {
  id: string;
  label: string;
  group?: string;
  keys?: string | string[];
}

export interface TexoCommandPaletteProps {
  items: TexoPaletteItem[];
  onClose: () => void;
  onRun: (item: TexoPaletteItem) => void;
  opened: boolean;
  placeholder?: string;
}

interface Match {
  item: TexoPaletteItem;
  score: number;
  /** Indices into `item.label` that matched, for highlighting. */
  hits: number[];
}

/**
 * Subsequence fuzzy match. Scores contiguous runs and word starts higher so `sys` prefers
 * "Go to system" over a label that merely contains the letters in order.
 */
export function fuzzyMatch(query: string, label: string): Match['hits'] | null {
  const q = query.toLowerCase();
  const l = label.toLowerCase();
  if (q.length === 0) return [];
  const hits: number[] = [];
  let from = 0;
  for (const ch of q) {
    const at = l.indexOf(ch, from);
    if (at === -1) return null;
    hits.push(at);
    from = at + 1;
  }
  return hits;
}

function scoreHits(hits: number[], label: string) {
  let score = 0;
  for (let i = 0; i < hits.length; i++) {
    const at = hits[i];
    if (at === 0 || label[at - 1] === ' ') score += 3;
    if (i > 0 && hits[i - 1] === at - 1) score += 2;
    score += 1;
  }
  return score - hits[hits.length - 1] * 0.01;
}

export function rankItems(items: TexoPaletteItem[], query: string): Match[] {
  const trimmed = query.trim();
  const matches: Match[] = [];
  for (const item of items) {
    const hits = fuzzyMatch(trimmed, item.label);
    if (hits) matches.push({ item, hits, score: trimmed ? scoreHits(hits, item.label) : 0 });
  }
  if (trimmed) matches.sort((a, b) => b.score - a.score);
  return matches;
}

function highlight(label: string, hits: number[]): ReactNode {
  if (hits.length === 0) return label;
  const out: ReactNode[] = [];
  let cursor = 0;
  for (const at of hits) {
    if (at > cursor) out.push(label.slice(cursor, at));
    out.push(<mark key={at}>{label[at]}</mark>);
    cursor = at + 1;
  }
  if (cursor < label.length) out.push(label.slice(cursor));
  return out;
}

export function TexoKeys({ keys }: { keys: string }) {
  const chords = formatKeys(keys);
  return (
    <span className={classes.keys}>
      {chords.map((glyphs, i) => (
        <span className={classes.keys} key={i}>
          {i > 0 && <span className={classes.chordGap} />}
          {glyphs.map((g, j) => (
            <BaseKbd key={j} size="xs">
              {g}
            </BaseKbd>
          ))}
        </span>
      ))}
    </span>
  );
}

export function TexoCommandPalette({ items, onClose, onRun, opened, placeholder = 'Type a command' }: TexoCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const ranked = useMemo(() => rankItems(items, query), [items, query]);
  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup: Record<string, Match[]> = {};
    for (const m of ranked) {
      const g = m.item.group ?? 'Commands';
      if (!byGroup[g]) {
        byGroup[g] = [];
        order.push(g);
      }
      byGroup[g].push(m);
    }
    return order.map((g) => ({ label: g, matches: byGroup[g] }));
  }, [ranked]);
  const flat = useMemo(() => groups.flatMap((g) => g.matches), [groups]);

  useEffect(() => {
    if (opened) {
      setQuery('');
      setActive(0);
    }
  }, [opened]);
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (match: Match | undefined) => {
    if (!match) return;
    onClose();
    onRun(match.item);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(flat[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  let index = 0;
  return (
    <BaseModal
      classNames={{ body: classes.body }}
      onClose={onClose}
      opened={opened}
      padding={0}
      size="md"
      withCloseButton={false}
      yOffset="12vh"
    >
      <BaseBox className={classes.search}>
        <BaseTextInput
          aria-label="Command"
          autoComplete="off"
          data-autofocus
          leftSection={<IconSearch size={16} />}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          size="md"
          styles={{ input: { border: 0, background: 'transparent' } }}
          value={query}
          variant="unstyled"
        />
      </BaseBox>
      <BaseBox className={classes.list} ref={listRef} role="listbox">
        {groups.map((group) => (
          <div key={group.label}>
            <div className={classes.group}>{group.label}</div>
            {group.matches.map((match) => {
              const i = index++;
              const key = keysOf(match.item)[0];
              return (
                <button
                  aria-selected={i === active}
                  className={classes.item}
                  data-active={i === active || undefined}
                  key={match.item.id}
                  onClick={() => run(match)}
                  onMouseMove={() => setActive(i)}
                  role="option"
                  type="button"
                >
                  <BaseText component="span" size="sm">
                    {highlight(match.item.label, match.hits)}
                  </BaseText>
                  {key && <TexoKeys keys={key} />}
                </button>
              );
            })}
          </div>
        ))}
        {flat.length === 0 && (
          <BaseText c="dimmed" className={classes.empty} size="sm">
            No commands match
          </BaseText>
        )}
      </BaseBox>
    </BaseModal>
  );
}

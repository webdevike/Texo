import { useEffect, useRef } from 'react';

/**
 * Sequence-aware hotkey binder. Bindings use Mousetrap-style strings: a chord is
 * `mod+k` / `shift+?` / `t`; a sequence is chords separated by spaces (`g i`). `mod` is
 * Command on macOS and Control elsewhere. Events inside editable elements are ignored
 * unless the binding sets `inInputs`.
 */

export interface HotkeyCommand {
  id: string;
  keys?: string | string[];
  run: () => void;
  /** Absent = always. Evaluated at keypress time. */
  when?: () => boolean;
  /** Fire even when focus is inside an input, textarea, select or contenteditable. */
  inInputs?: boolean;
}

export interface Chord {
  key: string;
  mod: boolean;
  ctrl: boolean;
  alt: boolean;
  /** `undefined` = do not care (symbol keys such as `?` need shift to be typed). */
  shift: boolean | undefined;
}

const SEQUENCE_TIMEOUT_MS = 1000;
const MODIFIER_KEYS: Record<string, true> = { Meta: true, Control: true, Shift: true, Alt: true, AltGraph: true, CapsLock: true };
const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  space: ' ',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  plus: '+',
};

export const isMac =
  typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

export function parseChord(text: string): Chord {
  const parts = text.toLowerCase().split('+').filter(Boolean);
  const key = KEY_ALIASES[parts[parts.length - 1]] ?? parts[parts.length - 1];
  const mods = parts.slice(0, -1);
  return {
    key,
    mod: mods.includes('mod') || (isMac ? mods.includes('cmd') || mods.includes('meta') : mods.includes('ctrl')),
    ctrl: isMac ? mods.includes('ctrl') : false,
    alt: mods.includes('alt') || mods.includes('option'),
    shift: mods.includes('shift') ? true : /^[a-z0-9]$/.test(key) ? false : undefined,
  };
}

export function parseSequence(keys: string): Chord[] {
  return keys.trim().split(/\s+/).map(parseChord);
}

/** The chord a keydown event represents, or null for a bare modifier press. */
export function chordOf(event: KeyboardEvent): Chord | null {
  if (MODIFIER_KEYS[event.key]) return null;
  return {
    key: event.key.toLowerCase(),
    mod: isMac ? event.metaKey : event.ctrlKey,
    ctrl: isMac ? event.ctrlKey : false,
    alt: event.altKey,
    shift: event.shiftKey,
  };
}

function chordMatches(spec: Chord, actual: Chord) {
  return (
    spec.key === actual.key &&
    spec.mod === actual.mod &&
    spec.ctrl === actual.ctrl &&
    spec.alt === actual.alt &&
    (spec.shift === undefined || spec.shift === actual.shift)
  );
}

function isPrefix(buffer: Chord[], spec: Chord[]) {
  return buffer.length <= spec.length && buffer.every((chord, i) => chordMatches(spec[i], chord));
}

export function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function keysOf(command: { keys?: string | string[] }): string[] {
  if (!command.keys) return [];
  return Array.isArray(command.keys) ? command.keys : [command.keys];
}

/**
 * Bind `commands` on `target`. Returns the unbind function. `getCommands` is read on every
 * keypress so callers can hand in a ref and never rebind.
 */
export function bindHotkeys(getCommands: () => HotkeyCommand[], target: Window | HTMLElement = window) {
  let buffer: Chord[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;

  const reset = () => {
    buffer = [];
    clearTimeout(timer);
    timer = undefined;
  };

  const onKeyDown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.defaultPrevented) return;
    const chord = chordOf(keyboardEvent);
    if (!chord) return;
    const editable = isEditable(keyboardEvent.target);
    const candidates: Array<{ sequence: Chord[]; command: HotkeyCommand }> = [];
    for (const command of getCommands()) {
      if ((editable && !command.inInputs) || !(command.when?.() ?? true)) continue;
      for (const keys of keysOf(command)) candidates.push({ sequence: parseSequence(keys), command });
    }

    const attempt = (next: Chord[]) => {
      const exact = candidates.find((c) => c.sequence.length === next.length && isPrefix(next, c.sequence));
      if (exact) {
        keyboardEvent.preventDefault();
        reset();
        exact.command.run();
        return true;
      }
      if (candidates.some((c) => c.sequence.length > next.length && isPrefix(next, c.sequence))) {
        keyboardEvent.preventDefault();
        buffer = next;
        clearTimeout(timer);
        timer = setTimeout(reset, SEQUENCE_TIMEOUT_MS);
        return true;
      }
      return false;
    };

    if (buffer.length > 0 && attempt([...buffer, chord])) return;
    reset();
    attempt([chord]);
  };

  target.addEventListener('keydown', onKeyDown);
  return () => {
    reset();
    target.removeEventListener('keydown', onKeyDown);
  };
}

/** Register every command's `keys` for the lifetime of the component. Never rebinds; reads the latest commands. */
export function useHotkeys(commands: HotkeyCommand[]) {
  const latest = useRef(commands);
  latest.current = commands;
  useEffect(() => bindHotkeys(() => latest.current), []);
}

const GLYPHS: Record<string, string> = isMac
  ? { mod: '\u2318', shift: '\u21E7', alt: '\u2325', ctrl: '\u2303', enter: '\u21A9', escape: 'Esc', arrowup: '\u2191', arrowdown: '\u2193', arrowleft: '\u2190', arrowright: '\u2192', ' ': 'Space' }
  : { mod: 'Ctrl', shift: 'Shift', alt: 'Alt', ctrl: 'Ctrl', enter: 'Enter', escape: 'Esc', arrowup: '\u2191', arrowdown: '\u2193', arrowleft: '\u2190', arrowright: '\u2192', ' ': 'Space' };

/** Human-readable form of one binding: one list of keycap glyphs per chord in the sequence. */
export function formatKeys(keys: string): string[][] {
  return keys
    .trim()
    .split(/\s+/)
    .map((chord) => {
      const parts = chord.toLowerCase().split('+').filter(Boolean);
      const key = KEY_ALIASES[parts[parts.length - 1]] ?? parts[parts.length - 1];
      const glyphs: string[] = [];
      for (const m of ['ctrl', 'alt', 'shift', 'mod']) if (parts.includes(m)) glyphs.push(GLYPHS[m]);
      glyphs.push(GLYPHS[key] ?? (key.length === 1 ? key.toUpperCase() : key));
      return glyphs;
    });
}

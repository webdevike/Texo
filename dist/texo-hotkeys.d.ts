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
export declare const isMac: boolean;
export declare function parseChord(text: string): Chord;
export declare function parseSequence(keys: string): Chord[];
/** The chord a keydown event represents, or null for a bare modifier press. */
export declare function chordOf(event: KeyboardEvent): Chord | null;
export declare function isEditable(target: EventTarget | null): boolean;
export declare function keysOf(command: {
    keys?: string | string[];
}): string[];
/**
 * Bind `commands` on `target`. Returns the unbind function. `getCommands` is read on every
 * keypress so callers can hand in a ref and never rebind.
 */
export declare function bindHotkeys(getCommands: () => HotkeyCommand[], target?: Window | HTMLElement): () => void;
/** Register every command's `keys` for the lifetime of the component. Never rebinds; reads the latest commands. */
export declare function useHotkeys(commands: HotkeyCommand[]): void;
/** Human-readable form of one binding: one list of keycap glyphs per chord in the sequence. */
export declare function formatKeys(keys: string): string[][];
//# sourceMappingURL=texo-hotkeys.d.ts.map
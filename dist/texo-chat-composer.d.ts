export interface TexoChatComposerProps {
    value: string;
    onChange: (value: string) => void;
    /** Invoked for nonblank drafts. The owner sends and clears the controlled value. */
    onSubmit: () => void;
    /** Null means this message will not attach workspace context. */
    context: {
        label: string;
        source?: string;
    } | null;
    onInspectContext?: () => void;
    onClearContext?: () => void;
    onAttachContext?: () => void;
    streaming?: boolean;
    onStop?: () => void;
    disabled?: boolean;
    placeholder?: string;
    messageLabel?: string;
    className?: string;
}
/** A recessed context strip above a separately themed message field. */
export declare function TexoChatComposer({ value, onChange, onSubmit, context, onInspectContext, onClearContext, onAttachContext, streaming, onStop, disabled, placeholder, messageLabel, className, }: TexoChatComposerProps): import("react").JSX.Element;
//# sourceMappingURL=texo-chat-composer.d.ts.map
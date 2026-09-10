import { type BaseBoxProps } from './components';
import type { TexoSize } from './texo-theme-provider';
export interface TexoMarkdownProps {
    children: string;
    size?: TexoSize;
    c?: BaseBoxProps['c'];
}
/** Safe GFM content. Raw HTML stays disabled; ReactMarkdown filters unsafe URLs. */
export declare const TexoMarkdown: import("react").MemoExoticComponent<({ children, size, c }: TexoMarkdownProps) => import("react").JSX.Element>;
//# sourceMappingURL=texo-markdown.d.ts.map
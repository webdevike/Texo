import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BaseBox, BaseCode, BaseText, BaseTitle, type BaseBoxProps } from './components';
import type { TexoSize } from './texo-theme-provider';
import classes from './texo-markdown.module.css';

const plugins = [remarkGfm];
const components: Components = {
  h1: ({ children }) => <BaseTitle order={1} size="xl">{children}</BaseTitle>,
  h2: ({ children }) => <BaseTitle order={2} size="lg">{children}</BaseTitle>,
  h3: ({ children }) => <BaseTitle order={3} size="md">{children}</BaseTitle>,
  h4: ({ children }) => <BaseTitle order={4} size="sm">{children}</BaseTitle>,
  h5: ({ children }) => <BaseTitle order={5} size="sm">{children}</BaseTitle>,
  h6: ({ children }) => <BaseTitle order={6} size="sm">{children}</BaseTitle>,
  code: ({ children, className }) => <BaseCode className={className}>{children}</BaseCode>,
  a: ({ href, title, children }) => href
    ? <BaseText component="a" inherit href={href} title={title} target="_blank" rel="noopener noreferrer">{children}</BaseText>
    : <span>{children}</span>,
  table: ({ children }) => (
    <BaseBox className={classes.tableScroll} role="region" aria-label="Markdown table" tabIndex={0}>
      <table>{children}</table>
    </BaseBox>
  ),
  img: ({ src, alt, title }) => src
    ? <img src={src} alt={alt ?? ''} title={title} loading="lazy" />
    : <span>{alt}</span>,
};

export interface TexoMarkdownProps {
  children: string;
  size?: TexoSize;
  c?: BaseBoxProps['c'];
}

/** Safe GFM content. Raw HTML stays disabled; ReactMarkdown filters unsafe URLs. */
export const TexoMarkdown = memo(function TexoMarkdown({ children, size = 'sm', c }: TexoMarkdownProps) {
  return (
    <BaseBox className={classes.root} fz={size} lh={size} c={c}>
      <ReactMarkdown components={components} remarkPlugins={plugins} skipHtml>
        {children}
      </ReactMarkdown>
    </BaseBox>
  );
});

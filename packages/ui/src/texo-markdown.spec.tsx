import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { BaseProvider } from './provider';
import { TexoMarkdown } from './texo-markdown';

afterEach(cleanup);

function message(text: string) {
  return <BaseProvider><TexoMarkdown>{text}</TexoMarkdown></BaseProvider>;
}

describe('TexoMarkdown', () => {
  it('renders formatting without enabling raw HTML or executable URLs', () => {
    const { container } = render(message('**Safe** [docs](https://example.com) [bad](javascript:alert%281%29)\n\n<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">'));
    expect(container.querySelector('strong')?.textContent).toBe('Safe');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(container.querySelector('script, img, [onerror]')).toBeNull();
    expect(container.textContent).toContain('bad');
  });

  it('finishes a streamed code fence without losing code or swallowing following blocks', () => {
    const partial = '## Update\n\n```ts\nconst count = 1;';
    const { container, rerender } = render(message(partial));
    expect(container.querySelector('pre code')?.textContent).toContain('const count = 1;');
    rerender(message(partial + '\n```\n\n**Done**\n\n| Name | Count |\n| :--- | ---: |\n| Items | 2 |'));
    expect(container.querySelectorAll('pre')).toHaveLength(1);
    expect(container.querySelector('pre code')?.textContent).toBe('const count = 1;\n');
    expect(container.querySelector('strong')?.textContent).toBe('Done');
    expect(container.querySelector('tbody td:last-child')?.textContent).toBe('2');
    expect(container.querySelector('tbody td:last-child')?.getAttribute('style')).toContain('text-align: right');
  });
});

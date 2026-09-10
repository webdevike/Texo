import { defineTexoComponent, TexoMarkdown } from '@texo/ui';

const example = `## Markdown in Texo

**Strong**, *emphasis*, ~~removed~~, and \`inline code\` inherit the theme.

- A list item
  - A nested item
- [x] Completed task
- [ ] Open task

> A quoted note.

[Documentation](https://commonmark.org/help/)

\`\`\`tsx
const message = "Hello, Texo";
console.log(message);
\`\`\`

| Feature | State |
| :--- | ---: |
| Context | Ready |
| Markdown | Ready |
`;

export const markdownExample = defineTexoComponent<{ content: string }>({
  id: 'markdown',
  name: 'Markdown',
  component: ({ content }) => <TexoMarkdown>{content}</TexoMarkdown>,
  defaultProps: { content: example },
  properties: {
    content: { type: 'string', label: 'Markdown content', default: example },
  },
});

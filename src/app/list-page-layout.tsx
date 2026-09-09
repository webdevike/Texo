import type { ReactNode } from 'react';
import { BaseStack, BaseText, BaseTitle } from '@texo/ui';
import classes from './list-page-layout.module.css';

export function ListPageLayout({
  title,
  description,
  filters,
  children,
}: {
  title: string;
  description: string;
  filters: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={classes.page}
      aria-label={title}
      data-target="page"
      data-target-label="Page"
    >
      <BaseStack
        gap={4}
        component="header"
        data-target="header"
        data-target-label="Page header"
      >
        <BaseTitle
          order={1}
          size="h2"
          data-target="title"
          data-target-label="Title"
        >
          {title}
        </BaseTitle>
        <BaseText
          c="dimmed"
          size="sm"
          data-target="description"
          data-target-label="Description"
        >
          {description}
        </BaseText>
      </BaseStack>
      <div data-target="filters" data-target-label="Filters">
        {filters}
      </div>
      <div
        className={classes.content}
        data-target="content"
        data-target-label="Content"
      >
        {children}
      </div>
    </section>
  );
}

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
    <section className={classes.page} aria-label={title}>
      <BaseStack gap={4} component="header">
        <BaseTitle order={1} size="h2">
          {title}
        </BaseTitle>
        <BaseText c="dimmed" size="sm">
          {description}
        </BaseText>
      </BaseStack>
      <div>{filters}</div>
      <div className={classes.content}>{children}</div>
    </section>
  );
}

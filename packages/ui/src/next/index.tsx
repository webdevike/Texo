'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useTexoBridge, type TexoPage } from '../texo-bridge';

export type { TexoPage } from '../texo-bridge';

export interface TexoBridgeProps {
  /** Pages the Texo workspace can open, prototype, and hand to its agent. */
  pages: TexoPage[];
}

/**
 * Mount once in the root layout. Reports the current page to the Texo admin
 * and follows its navigation; inert when the app is not framed. `page.path`
 * is the in-app path, which `usePathname` reports without the basePath.
 */
export function TexoBridge({ pages }: TexoBridgeProps) {
  const pathname = usePathname();
  const router = useRouter();
  useTexoBridge({
    pages,
    page: pages.find((page) => page.path === pathname) ?? null,
    navigate: useCallback((page: TexoPage) => router.push(page.path), [router]),
  });
  return null;
}

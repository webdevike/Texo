/**
 * Shape of next.config we touch; typed structurally so this package does not
 * depend on `next`.
 */
export interface TexoNextConfig {
  basePath?: string;
  transpilePackages?: string[];
  [key: string]: unknown;
}

/**
 * Wrap next.config for apps framed by the Texo workspace.
 *
 * - TEXO_PREVIEW=1 serves the app under /preview so the admin can proxy and
 *   frame it on its own origin. `usePathname` and `Link` stay basePath-free.
 * - @texo/ui ships ESM that imports its own CSS; transpiling it lets Next
 *   handle those imports.
 */
export function withTexo<T extends TexoNextConfig>(config: T = {} as T): T {
  const preview = process.env.TEXO_PREVIEW === '1';
  const transpilePackages = config.transpilePackages ?? [];
  return {
    ...config,
    transpilePackages: transpilePackages.includes('@texo/ui')
      ? transpilePackages
      : [...transpilePackages, '@texo/ui'],
    ...(preview ? { basePath: '/preview' } : {}),
  };
}

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
export declare function withTexo<T extends TexoNextConfig>(config?: T): T;
//# sourceMappingURL=config.d.ts.map
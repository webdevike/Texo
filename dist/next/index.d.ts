import { type TexoPage } from '../texo-bridge';
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
export declare function TexoBridge({ pages }: TexoBridgeProps): null;
//# sourceMappingURL=index.d.ts.map
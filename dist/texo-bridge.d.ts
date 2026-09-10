/**
 * Bridge between the Texo admin and the app it frames under /preview/.
 *
 * The framed app describes its designable pages (`texo:pages`) and reports the
 * page it is showing (`texo:route`); the admin steers it with `texo:navigate`.
 * Both documents share an origin, so the admin can also read the frame's DOM
 * (`data-texo-page` on <html>, `data-target` markers) for Prototype mode.
 */
export declare const TEXO_PREVIEW_BASE = "/preview";
export interface TexoPage {
    id: string;
    label: string;
    /** Source file, relative to the repository the chat agent runs in. */
    sourcePath: string;
    /** In-app path of the page (without the /preview prefix), e.g. `/pages/customers`. */
    path: string;
}
export type TexoPreviewMessage = {
    type: 'texo:pages';
    pages: TexoPage[];
} | {
    type: 'texo:route';
    pageId: string | null;
    path: string | null;
};
export type TexoAdminMessage = {
    type: 'texo:navigate';
    pageId: string;
};
export interface TexoBridgeOptions {
    pages: TexoPage[];
    /** Page currently rendered, or null when the route is not a designed page. */
    page: TexoPage | null;
    /** Navigate the framed app to a page the admin selected. */
    navigate: (page: TexoPage) => void;
}
/** Mount once near the app root; the framed app becomes visible to the admin. */
export declare function useTexoBridge({ pages, page, navigate }: TexoBridgeOptions): void;
//# sourceMappingURL=texo-bridge.d.ts.map
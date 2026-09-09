/** Messages the preview frame posts to the admin that embeds it. */
export type PreviewPage = { id: string; label: string };

export type PreviewMessage =
  | { type: 'texo:pages'; pages: PreviewPage[] }
  | { type: 'texo:route'; pageId: string | null };

/** Messages the admin posts into the frame. */
export type AdminMessage = { type: 'texo:navigate'; pageId: string };

export const PREVIEW_BASE = '/preview';

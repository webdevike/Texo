import { useEffect, useLayoutEffect } from "react";
//#region src/texo-bridge.ts
/**
* Bridge between the Texo admin and the app it frames under /preview/.
*
* The framed app describes its designable pages (`texo:pages`) and reports the
* page it is showing (`texo:route`); the admin steers it with `texo:navigate`.
* Both documents share an origin, so the admin can also read the frame's DOM
* (`data-texo-page` on <html>, `data-target` markers) for Prototype mode.
*/
var TEXO_PREVIEW_BASE = "/preview";
var isBrowser = typeof window !== "undefined";
function post(message) {
	if (isBrowser && window.parent !== window) window.parent.postMessage(message, window.location.origin);
}
var useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;
/** Mount once near the app root; the framed app becomes visible to the admin. */
function useTexoBridge({ pages, page, navigate }) {
	useIsomorphicLayoutEffect(() => {
		document.documentElement.dataset.texoPage = page?.id ?? "";
		return () => {
			delete document.documentElement.dataset.texoPage;
		};
	}, [page]);
	useEffect(() => {
		post({
			type: "texo:pages",
			pages: pages.map(({ id, label, sourcePath, path }) => ({
				id,
				label,
				sourcePath,
				path
			}))
		});
	}, [pages, page]);
	useEffect(() => {
		post({
			type: "texo:route",
			pageId: page?.id ?? null,
			path: page?.path ?? null
		});
	}, [page]);
	useEffect(() => {
		const onMessage = (event) => {
			if (event.origin !== window.location.origin || event.source !== window.parent) return;
			if (event.data?.type !== "texo:navigate") return;
			const target = pages.find((item) => item.id === event.data.pageId);
			if (target) navigate(target);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [pages, navigate]);
}
//#endregion
export { useTexoBridge as n, TEXO_PREVIEW_BASE as t };

//# sourceMappingURL=texo-bridge-DuQ665gA.js.map
//#region src/next/config.ts
/**
* Wrap next.config for apps framed by the Texo workspace.
*
* - TEXO_PREVIEW=1 serves the app under /preview so the admin can proxy and
*   frame it on its own origin. `usePathname` and `Link` stay basePath-free.
* - @texo/ui ships ESM that imports its own CSS; transpiling it lets Next
*   handle those imports.
*/
function withTexo(config = {}) {
	const preview = process.env.TEXO_PREVIEW === "1";
	const transpilePackages = config.transpilePackages ?? [];
	return {
		...config,
		transpilePackages: transpilePackages.includes("@texo/ui") ? transpilePackages : [...transpilePackages, "@texo/ui"],
		...preview ? { basePath: "/preview" } : {}
	};
}
//#endregion
export { withTexo };

//# sourceMappingURL=config.js.map
import { resolve } from "node:path";
import { searchForWorkspaceRoot } from "vite";
//#region src/tanstack-start/vite.ts
/**
* Vite plugin for apps framed by the Texo workspace.
*
* - TEXO_PREVIEW=1 serves the app under /preview/ so the admin can proxy and
*   frame it on its own origin (TanStack Start derives the router basepath
*   from Vite `base`).
* - One React and one Mantine per tree, however @texo/ui is resolved.
* - @texo/ui is ESM importing its own CSS, so it and Mantine are bundled for
*   SSR instead of being loaded by Node.
*/
function texo(options = {}) {
	const preview = process.env.TEXO_PREVIEW === "1";
	const source = options.source ?? process.env.TEXO_UI_SRC;
	const entry = source ? resolve(source, "packages/ui/src/index.ts") : void 0;
	return {
		name: "texo",
		enforce: "pre",
		config(config) {
			return {
				base: preview ? "/preview/" : void 0,
				resolve: {
					alias: entry ? { "@texo/ui": entry } : void 0,
					dedupe: [
						"react",
						"react-dom",
						"@mantine/core",
						"@mantine/hooks",
						"@mantine/code-highlight"
					]
				},
				server: entry ? { fs: { allow: [searchForWorkspaceRoot(config.root ?? process.cwd()), entry] } } : void 0,
				ssr: { noExternal: ["@texo/ui", /^@mantine\//] }
			};
		}
	};
}
//#endregion
export { texo };

//# sourceMappingURL=vite.js.map
import { n as useTexoBridge } from "../chunks/texo-bridge-DuQ665gA.js";
import { useCallback } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
//#region src/tanstack-start/index.tsx
/**
* Mount once inside the router (the root route's component). Reports the
* current page to the Texo admin and follows its navigation; inert when the
* app is not framed. `page.path` is the in-app path, which TanStack Router
* reports without the /preview basepath.
*/
function TexoBridge({ pages }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const navigate = useNavigate();
	useTexoBridge({
		pages,
		page: pages.find((page) => page.path === pathname) ?? null,
		navigate: useCallback((page) => navigate({ to: page.path }), [navigate])
	});
	return null;
}
//#endregion
export { TexoBridge };

//# sourceMappingURL=index.js.map
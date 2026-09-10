"use client";
import { n as useTexoBridge } from "../chunks/texo-bridge-DuQ665gA.js";
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
//#region src/next/index.tsx
/**
* Mount once in the root layout. Reports the current page to the Texo admin
* and follows its navigation; inert when the app is not framed. `page.path`
* is the in-app path, which `usePathname` reports without the basePath.
*/
function TexoBridge({ pages }) {
	const pathname = usePathname();
	const router = useRouter();
	useTexoBridge({
		pages,
		page: pages.find((page) => page.path === pathname) ?? null,
		navigate: useCallback((page) => router.push(page.path), [router])
	});
	return null;
}
//#endregion
export { TexoBridge };

//# sourceMappingURL=index.js.map
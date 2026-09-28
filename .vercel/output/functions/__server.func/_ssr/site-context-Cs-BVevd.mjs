import { o as getRequest, r as createServerFn } from "./ssr.mjs";
import { n as SITE } from "./site-Bh5vnfwv.mjs";
import { s as resolveSiteContext } from "./site-context-BnUpVMbC.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-context-Cs-BVevd.js
function currentHost() {
	const request = getRequest();
	return (request?.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request?.headers.get("host") || SITE.domain).split(",")[0]?.trim() || SITE.domain;
}
function currentPathname() {
	const url = getRequest()?.url;
	if (!url) return "/";
	try {
		return new URL(url).pathname || "/";
	} catch {
		return "/";
	}
}
var getSiteContext_createServerFn_handler = createServerRpc({
	id: "d60d9130a3746bb3bb59d91ae9352cdfcdd1510a6430048d164669cf06540359",
	name: "getSiteContext",
	filename: "src/lib/server/site-context.ts"
}, (opts) => getSiteContext.__executeServer(opts));
var getSiteContext = createServerFn({ method: "GET" }).handler(getSiteContext_createServerFn_handler, async () => {
	return resolveSiteContext(currentHost(), currentPathname());
});
//#endregion
export { getSiteContext_createServerFn_handler };

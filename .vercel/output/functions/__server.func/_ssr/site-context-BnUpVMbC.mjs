import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SITE } from "./site-Bh5vnfwv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-context-BnUpVMbC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function normalizeHost(value) {
	return (value ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
}
function isLocalHost(host) {
	return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost");
}
function normalizePathname(value) {
	const raw = (value ?? "").trim();
	if (!raw || raw === "/") return "/";
	return (raw.startsWith("/") ? raw : `/${raw}`).replace(/\/+$/, "") || "/";
}
function isLibraryHost(host) {
	const normalized = normalizeHost(host);
	return normalized === SITE.libraryHost || normalized.startsWith("library.");
}
function resolveSiteContext(host, pathname) {
	const normalizedHost = normalizeHost(host) || SITE.domain;
	const protocol = isLocalHost(normalizedHost) ? "http" : "https";
	const normalizedPathname = normalizePathname(pathname);
	const origin = `${protocol}://${normalizedHost}`;
	return {
		host: normalizedHost,
		origin,
		pathname: normalizedPathname,
		currentUrl: normalizedPathname === "/" ? origin : `${origin}${normalizedPathname}`,
		isLibraryHost: isLibraryHost(normalizedHost),
		mainSiteUrl: SITE.url,
		librarySiteUrl: SITE.libraryUrl
	};
}
function withLeadingSlash(path) {
	return path.startsWith("/") ? path : `/${path}`;
}
function mainSiteHref(path = "/") {
	return `${SITE.url}${withLeadingSlash(path)}`;
}
function libraryHomeHref(siteContext) {
	return siteContext.isLibraryHost ? "/" : SITE.libraryUrl;
}
function libraryBookHref(slug, siteContext) {
	const cleanSlug = slug.replace(/^\/+/, "");
	return siteContext.isLibraryHost ? `/${cleanSlug}` : `${SITE.libraryUrl}/${cleanSlug}`;
}
function libraryReaderHref(slug, siteContext) {
	const cleanSlug = slug.replace(/^\/+/, "");
	return siteContext.isLibraryHost ? `/read/${cleanSlug}` : `${SITE.libraryUrl}/read/${cleanSlug}`;
}
function marketingHref(path, siteContext) {
	const target = withLeadingSlash(path);
	return siteContext.isLibraryHost ? mainSiteHref(target) : target;
}
var defaultSiteContext = resolveSiteContext(SITE.domain);
var SiteContext = (0, import_react.createContext)(defaultSiteContext);
function useSiteContext() {
	return (0, import_react.useContext)(SiteContext);
}
//#endregion
export { mainSiteHref as a, useSiteContext as c, libraryReaderHref as i, libraryBookHref as n, marketingHref as o, libraryHomeHref as r, resolveSiteContext as s, SiteContext as t };

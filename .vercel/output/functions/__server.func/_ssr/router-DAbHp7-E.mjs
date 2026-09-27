import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, _ as Outlet, b as createRootRoute, f as Scripts, g as createRouter, p as HeadContent, v as lazyRouteComponent, w as useRouter, y as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { i as authMiddleware, r as SITE } from "./site-BJP5UGIc.mjs";
import { A as boolean, D as _enum, F as object, M as literal, P as number, R as string, k as array, z as union } from "../_libs/@better-auth/core+[...].mjs";
import { n as auth } from "./server-D9B0HzbG.mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform-DEc-fw-o.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listBooks = createServerFn({ method: "GET" }).handler(createSsrRpc("431adad02939f861c034d67637e7b2c3aaae4ef8fe82002a60f44254a28e679e"));
var getBook = createServerFn({ method: "GET" }).validator(object({ slug: string() })).handler(createSsrRpc("73586ac73c79080f2ae95cb9d1e9a67e6ec56c12bcf746c26bd642ace4b1a75d"));
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fd1d6e62a1e273faf817d786c31ed5f141c550b282114593fe886b4ddc2631d8"));
var updateProfileName = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ fullName: string().min(2).max(80) })).handler(createSsrRpc("931fbaffd6198eaac0e89154b90c6dfa79d66cabd5cb75c82fd93dd8b07e022f"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("5b165c3c83dcb09ee648b0c3072327046423041d862fc3ca5b1f7f7597d4d573"));
var acceptTos = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("ac84d119572a559a03f5c2c24fcd4706c00de30d8c621790fa0b36b7f59bb29b"));
var linkDeriv = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	cr: string().min(2).max(64),
	partnerCode: string().max(80).optional()
})).handler(createSsrRpc("3fef606d0e87112a769b7c3a68684bdfd004ca30bc1d5e033159b61b7371e8ef"));
var generateMemberCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("d18154b9192d9cd5105ef25c6a2c56ba14caf7b5aeb3bb017d0ab91e95f4530e"));
var redeemCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string().min(3).max(32) })).handler(createSsrRpc("c775325625dca866a254cdbaf435819668583ab4d8859d88d82b07f63af40dda"));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	bookSlug: string().optional(),
	kind: _enum([
		"online",
		"download",
		"coupon5",
		"sub3",
		"sub6"
	]),
	provider: _enum(["stripe", "paystack"])
})).handler(createSsrRpc("245401eb6c064a28621e7b695633b5a8be104584b21c9871c0dd6f09776ab607"));
var readerPayload = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ slug: string() })).handler(createSsrRpc("fc2533132ae950be65c04fca33089b9e44e4abc7f88f33bb402dc42ae19c3270"));
var logPage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	slug: string(),
	pageIndex: number().int().min(0)
})).handler(createSsrRpc("87e61a00e51e9c6e5879f9116cc0a16f5719a488a636508cbbb35eb8acd4d0c6"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7c3905a63665241dbf6619880dab43013fd8100470b4334a53ce324f03bd5c94"));
var deleteMyAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("7a827671e42db560e9c6f02abafc536bd540aaf406705c3d575904efbff74913"));
var exportMyData = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("22e9214950effb7f61d1e7d59b6613320d4ab9b8b3287a00c68bcd4dc3ce87bc"));
var adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fbb2973f7518273fbca810f2df82887d1ce40bbce31b33f413334bccfaaaa7f1"));
var adminUsers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("404b6fc97be7a0f2f48392c73e39e9f383c9101af64e6edd7692620966cf8711"));
var adminSetBan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	banned: boolean()
})).handler(createSsrRpc("cb01c1f2f5caadc2abac63d08c77e51a26b82b065e61ccfaefd2cd71e8fc1410"));
var adminSetTagged = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	tagged: boolean()
})).handler(createSsrRpc("485595352bf67270fa93735d59b828f8dd4f18c120724ad1db4cdca5493b74ec"));
var adminBooks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("a0f275ec79df219f892e3b16bdd14df13f585c9c26c346cb9a28c0038b19437c"));
var adminCreateBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	title: string().min(2).max(160),
	subtitle: string().max(160).default(""),
	slug: string().max(160).optional(),
	category: string().min(2).max(80),
	size: _enum([
		"short",
		"medium",
		"full"
	]).default("medium"),
	launch_mode: _enum([
		"prelaunch",
		"launch",
		"public"
	]).default("prelaunch"),
	blurb: string().max(5e3).default(""),
	published: boolean().default(true)
})).handler(createSsrRpc("c863ffe5b334437e9fdd831f2c9b449ebed26df1784aa6e149b1c224045e370b"));
var adminUpdateBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	title: string().max(160).optional(),
	subtitle: string().max(160).optional(),
	slug: string().max(160).optional(),
	blurb: string().max(5e3).optional(),
	description: string().max(5e3).optional(),
	category: string().max(80).optional(),
	size: _enum([
		"short",
		"medium",
		"full"
	]).optional(),
	launch_mode: _enum([
		"prelaunch",
		"launch",
		"public"
	]).optional(),
	published: boolean().optional(),
	sort_order: number().int().min(0).optional(),
	cover_url: string().url().optional(),
	archived: boolean().optional()
})).handler(createSsrRpc("bdef7d8b5aa00ee5ca532368415f4f515079abcc8f2541d3a977d00ef2c5e809"));
var adminDeleteBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("bfb90ca6aae4fea3353da6eede48d85b3254f6f9c83e2c1866d2efa5d8629727"));
var adminSignCloudinaryUpload = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	kind: _enum(["cover", "page"]),
	bookSlug: string().min(1),
	fileName: string().optional()
})).handler(createSsrRpc("43c54d2e6552c10a90169e779940861f182097dcfce2aed36e525a5679e3e60e"));
var adminSaveBookCover = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	coverUrl: string().url()
})).handler(createSsrRpc("32ab9119064bda4fcb4847571245ecc5e77b86e7bdb74b97c43df4ab62e85097"));
var adminCreateBookPages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	bookId: string(),
	imageUrls: array(string().url()).min(1)
})).handler(createSsrRpc("f3501b4c7cf3a88a6e3430c02b5baed3fb03f8dc1f6b0b104a95add35cd7fc18"));
var adminDeleteBookPage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	pageId: string(),
	bookId: string()
})).handler(createSsrRpc("1f36f9c475d9786bd94c597ac66218fe6af4e44ea96ac73d947f52b9450d1434"));
var adminReorderBookPages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	bookId: string(),
	pageIds: array(string()).min(1)
})).handler(createSsrRpc("df967009e3e1b1d934bc0b95d1e44d3c87bf8439bcd6a803e9305bfce69a0663"));
var adminCreateCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	code: string().min(4).max(20),
	uses: number().int().min(1).max(500),
	bookId: string().optional()
})).handler(createSsrRpc("176472fc9de20cc9e6ba85c59961d999537c9877f6462b278651c9db9cde34c1"));
var adminCoupons = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0d23e03059175d54501826d235dae1507f777acfe757ff62fab824ddb4e4df2c"));
var adminSales = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("04e5639db739b0839cfebd67de896a0d2fe694e2ebcefb1c2072bc050ddd3700"));
var adminLogs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("035e846639f5cc827b39f0318f6007ce3803368cda37522808c9cebd04661413"));
createServerFn({ method: "GET" }).handler(createSsrRpc("9de6774a931d71f0fafcfda4e6a53d03b0ea05f7e6632f125e5c2174f7c9b913"));
var adminSaveSetting = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	key: string(),
	value: string()
})).handler(createSsrRpc("7788db9edffbaa146725cc19bacf940f5b5f11fb617fa862649667ac5b61092a"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DAbHp7-E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var ThemeCtx = (0, import_react.createContext)(null);
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const next = window.localStorage.getItem("slt-theme") === "dark" ? "dark" : "light";
		setThemeState(next);
		document.documentElement.classList.toggle("dark", next === "dark");
	}, []);
	const setTheme = (0, import_react.useCallback)((t) => {
		setThemeState(t);
		window.localStorage.setItem("slt-theme", t);
		document.documentElement.classList.toggle("dark", t === "dark");
	}, []);
	const toggle = (0, import_react.useCallback)(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [setTheme, theme]);
	const value = (0, import_react.useMemo)(() => ({
		theme,
		toggle,
		setTheme
	}), [
		theme,
		toggle,
		setTheme
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCtx.Provider, {
		value,
		children
	});
}
function useTheme() {
	const ctx = (0, import_react.useContext)(ThemeCtx);
	if (!ctx) throw new Error("Theme missing");
	return ctx;
}
var styles_default = "/assets/styles-zV694If6.css";
var Route$19 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: `${SITE.name} — ${SITE.library}` },
			{
				name: "description",
				content: "Exclusive trading books, community, and education for synthetic indices. The market that never sleeps."
			},
			{
				name: "theme-color",
				content: "#0E2744"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/icon-192.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@300;400;500;600;700&display=swap"
			}
		]
	}),
	component: Root
});
function Root() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				richColors: true,
				position: "top-center"
			})] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$17 = () => import("./routes-D_FfnpU8.mjs");
var Route$18 = createFileRoute("/")({
	loader: () => listBooks(),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./about-BsxR4HC9.mjs");
var Route$17 = createFileRoute("/about")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./account-B5WZTP8X.mjs");
var Route$16 = createFileRoute("/account")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./checkout-jXquCLSv.mjs");
var Route$15 = createFileRoute("/checkout")({
	validateSearch: (s) => ({ slug: typeof s.slug === "string" ? s.slug : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./community-BfQ4vzFx.mjs");
var Route$14 = createFileRoute("/community")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./contact-BL8bTfLS.mjs");
var Route$13 = createFileRoute("/contact")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./cookies-9Phg1lvt.mjs");
var Route$12 = createFileRoute("/cookies")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./copyright-DdHaJiLm.mjs");
var Route$11 = createFileRoute("/copyright")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./disclaimer-HipMYZ3y.mjs");
var Route$10 = createFileRoute("/disclaimer")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./login-CbxaCzZh.mjs");
var Route$9 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./pricing-DB_ZeWxj.mjs");
var Route$8 = createFileRoute("/pricing")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./privacy-DGdlpMCa.mjs");
var Route$7 = createFileRoute("/privacy")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./refund-4eqvergG.mjs");
var Route$6 = createFileRoute("/refund")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./terms-CnP6RXwU.mjs");
var Route$5 = createFileRoute("/terms")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin-DbyZee-3.mjs");
var Route$4 = createFileRoute("/admin/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./library-CR5qLufv.mjs");
var Route$3 = createFileRoute("/library/")({
	loader: () => listBooks(),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_slug-CBdrxDR1.mjs");
var Route$2 = createFileRoute("/library/$slug")({
	loader: ({ params }) => getBook({ data: { slug: params.slug } }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var Route$1 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var $$splitComponentImporter = () => import("./read._slug-CvVjf1Ot.mjs");
var Route = createFileRoute("/library/read/$slug")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$18.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$19
});
var AboutRoute = Route$17.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$19
});
var AccountRoute = Route$16.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => Route$19
});
var CheckoutRoute = Route$15.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => Route$19
});
var CommunityRoute = Route$14.update({
	id: "/community",
	path: "/community",
	getParentRoute: () => Route$19
});
var ContactRoute = Route$13.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$19
});
var CookiesRoute = Route$12.update({
	id: "/cookies",
	path: "/cookies",
	getParentRoute: () => Route$19
});
var CopyrightRoute = Route$11.update({
	id: "/copyright",
	path: "/copyright",
	getParentRoute: () => Route$19
});
var DisclaimerRoute = Route$10.update({
	id: "/disclaimer",
	path: "/disclaimer",
	getParentRoute: () => Route$19
});
var LoginRoute = Route$9.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$19
});
var PricingRoute = Route$8.update({
	id: "/pricing",
	path: "/pricing",
	getParentRoute: () => Route$19
});
var PrivacyRoute = Route$7.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$19
});
var RefundRoute = Route$6.update({
	id: "/refund",
	path: "/refund",
	getParentRoute: () => Route$19
});
var TermsRoute = Route$5.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$19
});
var AdminIndexRoute = Route$4.update({
	id: "/admin/",
	path: "/admin/",
	getParentRoute: () => Route$19
});
var LibraryIndexRoute = Route$3.update({
	id: "/library/",
	path: "/library/",
	getParentRoute: () => Route$19
});
var rootRouteChildren = {
	IndexRoute,
	AboutRoute,
	AccountRoute,
	CheckoutRoute,
	CommunityRoute,
	ContactRoute,
	CookiesRoute,
	CopyrightRoute,
	DisclaimerRoute,
	LoginRoute,
	PricingRoute,
	PrivacyRoute,
	RefundRoute,
	TermsRoute,
	LibrarySlugRoute: Route$2.update({
		id: "/library/$slug",
		path: "/library/$slug",
		getParentRoute: () => Route$19
	}),
	AdminIndexRoute,
	LibraryIndexRoute,
	ApiAuthSplatRoute: Route$1.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$19
	}),
	LibraryReadSlugRoute: Route.update({
		id: "/library/read/$slug",
		path: "/library/read/$slug",
		getParentRoute: () => Route$19
	})
};
var routeTree = Route$19._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { getBook as A, adminSetTagged as C, deleteMyAccount as D, adminUsers as E, redeemCoupon as F, startCheckout as I, updateProfileName as L, linkDeriv as M, logPage as N, exportMyData as O, readerPayload as P, adminSetBan as S, adminUpdateBook as T, adminOverview as _, Route$15 as a, adminSaveBookCover as b, acceptTos as c, adminCreateBook as d, adminCreateBookPages as f, adminLogs as g, adminDeleteBookPage as h, Route$3 as i, getMe as j, generateMemberCoupon as k, adminBooks as l, adminDeleteBook as m, Route as n, Route$18 as o, adminCreateCoupon as p, Route$2 as r, useTheme as s, router_exports as t, adminCoupons as u, adminReorderBookPages as v, adminSignCloudinaryUpload as w, adminSaveSetting as x, adminSales as y };

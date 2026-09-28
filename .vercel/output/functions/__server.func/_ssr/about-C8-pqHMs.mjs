import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SITE } from "./site-Bh5vnfwv.mjs";
import { z as Shell } from "./router-DMO4jLWn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-C8-pqHMs.js
var import_jsx_runtime = require_jsx_runtime();
function About() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
				children: "About"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-5xl",
				children: SITE.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/brand/trading-library-powered.png",
				alt: "",
				className: "mt-8 max-w-md"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-4 text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "SLT Trade Hub is a trading education desk built around The Trading Library. We publish books for synthetic indices traders — Volatility, Boom & Crash, Step, Jump, Range — and keep a community built around discipline, preparation, and repeatable execution." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"The library is written by ",
						SITE.author,
						", ",
						SITE.authorRole,
						". The covers you see are the real series and the books are written to be studied, not skimmed."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This is education. It is not a broker, not a signal service, and not financial advice. Trading can lose money, including money you cannot afford to lose." })
				]
			})
		]
	}) });
}
//#endregion
export { About as component };

import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as SITE } from "./site-CeNrZ-Lp.mjs";
import { t as Shell } from "./shell-mCpLug1g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-D4fstleE.js
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "SLT Trade Hub is a trading education desk built around The Trading Library. We publish books for synthetic indices traders — Volatility, Boom & Crash, Step, Jump, Range — and keep a community that treats profitability as a culture, not a slogan on a gold card." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"The library is written by ",
						SITE.author,
						", ",
						SITE.authorRole,
						". The covers you see are the real series: paper, navy, green and red candles. No black-and-gold funnel art."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This is education. It is not a broker, not a signal service, and not financial advice. Trading can lose money, including money you cannot afford to lose." })
				]
			})
		]
	}) });
}
//#endregion
export { About as component };

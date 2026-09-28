import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SITE, t as PRICING } from "./site-Bh5vnfwv.mjs";
import { B as Button, U as formatMoney, z as Shell } from "./router-DMO4jLWn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pricing-CndUCYPC.js
var import_jsx_runtime = require_jsx_runtime();
function Pricing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
				children: "Pricing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-5xl",
				children: "Clear pricing for every reader."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.16em] uppercase text-profit",
							children: "Pre-launch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl",
							children: "Tagged SLT members"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: [
								"Free online reading with a coupon generated from your account. Downloads",
								" ",
								formatMoney(PRICING.downloadPrelaunch),
								"."
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.16em] uppercase text-muted-foreground",
							children: "After public launch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl",
							children: "Tagged members pay $5"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: [
								"A ",
								formatMoney(PRICING.taggedCouponPublic),
								" coupon fee, even for tagged accounts. Downloads ",
								formatMoney(PRICING.downloadPublic),
								"."
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-12 font-display text-3xl",
				children: "Online access for everyone else"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-4 space-y-2 text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Short handbooks — ", formatMoney(PRICING.online.short)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Medium books — ", formatMoney(PRICING.online.medium)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Full guides (Trading Bible, Synthetic Indices 101, and the rest) — ", formatMoney(PRICING.online.full)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"All-books pass — ",
						formatMoney(PRICING.subQuarterly),
						" every 3 months or",
						" ",
						formatMoney(PRICING.subBiannual),
						" every 6 months"
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "navy",
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: SITE.libraryUrl,
					children: "Choose a title"
				})
			})
		]
	}) });
}
//#endregion
export { Pricing as component };

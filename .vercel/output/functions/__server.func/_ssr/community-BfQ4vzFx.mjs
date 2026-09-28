import { T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as SITE } from "./site-BJP5UGIc.mjs";
import { l as MessageCircle, m as Bot, n as Users } from "../_libs/lucide-react.mjs";
import { t as Button } from "./dist-DJDlxxL0.mjs";
import { t as Shell } from "./shell-DHDyTYq0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/community-BfQ4vzFx.js
var import_jsx_runtime = require_jsx_runtime();
function Community() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
				children: "Community"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-5xl",
				children: "A room, not a crowd."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-xl text-muted-foreground",
				children: "Telegram for the long conversation. WhatsApp for the session ping. Bots for alerts you already decided to take. None of them replace the books."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-display text-3xl",
								children: "Telegram"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "The main SLT room. Process, journal talk, and the occasional well-earned screenshot."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "navy",
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: SITE.telegram,
									children: "Open Telegram"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-profit" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-display text-3xl",
								children: "WhatsApp"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Useful for trading-day reminders, session notes, and quick updates."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: SITE.whatsapp,
									children: "Open WhatsApp"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5 text-loss" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-display text-3xl",
								children: "Market alerts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Optional alerts only. They should support an existing plan, not create one. Access notes go out to tagged members after approval."
							})
						]
					})
				]
			})
		]
	}) });
}
//#endregion
export { Community as component };

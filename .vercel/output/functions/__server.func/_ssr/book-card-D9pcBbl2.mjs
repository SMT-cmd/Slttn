import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { s as formatMoney } from "./button-DQoUfAqZ.mjs";
import { t as Badge } from "./badge-CJ-8YcJm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-card-D9pcBbl2.js
var import_jsx_runtime = require_jsx_runtime();
function BookCard({ book }) {
	const price = book.online_price_cents / 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/library/$slug",
		params: { slug: book.slug },
		className: "group block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "book-3d overflow-hidden rounded-sm bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: book.cover_url,
				alt: book.title,
				className: "aspect-[2/3] w-full object-cover"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "muted",
						children: book.category
					}), book.launch_mode === "prelaunch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "green",
						children: "Pre-launch"
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-display text-2xl leading-tight group-hover:text-primary",
					children: [
						book.title,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-profit",
							children: book.subtitle
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"From ",
						formatMoney(price),
						" to read online"
					]
				})
			]
		})]
	});
}
//#endregion
export { BookCard as t };

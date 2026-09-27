import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Shell } from "./shell-Cyz-QISl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/legal-C7Ni6UAP.js
var import_jsx_runtime = require_jsx_runtime();
function Legal({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mx-auto max-w-2xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
				children: "Legal"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-5xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-4 text-sm leading-7 text-muted-foreground",
				children
			})
		]
	}) });
}
//#endregion
export { Legal as t };

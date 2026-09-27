import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as cn } from "./button-DQoUfAqZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-CJ-8YcJm.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "navy", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em]", {
			navy: "bg-navy text-navy-foreground",
			green: "bg-profit/12 text-profit",
			red: "bg-loss/12 text-loss",
			blue: "bg-primary/12 text-primary",
			muted: "bg-muted text-muted-foreground"
		}[tone], className),
		...props
	});
}
//#endregion
export { Badge as t };

import { T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as cn } from "./dist-DJDlxxL0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-Bd3zoPZi.js
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

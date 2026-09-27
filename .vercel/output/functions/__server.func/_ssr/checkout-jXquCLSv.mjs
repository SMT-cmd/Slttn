import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as PRICING } from "./site-BJP5UGIc.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as getBook, I as startCheckout, a as Route$15 } from "./router-DAbHp7-E.mjs";
import { g as useCurrentUserState, h as formatMoney, t as Button } from "./dist-DJDlxxL0.mjs";
import { t as Shell } from "./shell-DHDyTYq0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-jXquCLSv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Checkout() {
	const { slug } = Route$15.useSearch();
	const { user } = useCurrentUserState();
	const [book, setBook] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!slug) return;
		getBook({ data: { slug } }).then(setBook);
	}, [slug]);
	async function pay(kind, provider) {
		if (!user) {
			window.location.href = "/login";
			return;
		}
		try {
			const res = await startCheckout({ data: {
				bookSlug: slug,
				kind,
				provider
			} });
			if (res.status === "granted") toast.success(res.message);
			else toast.message(res.message);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Checkout did not go through.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
				children: "Checkout"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl",
				children: "Pay the way that fits."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted-foreground",
				children: "Stripe and Paystack both sit on this page. Tagged members should generate a coupon from the account page during pre-launch instead of paying to read."
			}),
			book ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex gap-4 rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: book.cover_url,
					alt: "",
					className: "h-28 w-auto rounded-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-2xl",
					children: [
						book.title,
						" ",
						book.subtitle
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: book.category
				})] })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-4",
				children: [
					book ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayRow, {
						title: "Read online",
						price: formatMoney(book.online_price_cents / 100),
						onStripe: () => pay("online", "stripe"),
						onPaystack: () => pay("online", "paystack")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayRow, {
						title: "Download",
						price: formatMoney((book.launch_mode === "public" ? book.download_public_cents : book.download_prelaunch_cents) / 100),
						onStripe: () => pay("download", "stripe"),
						onPaystack: () => pay("download", "paystack")
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayRow, {
						title: "All-books · 3 months",
						price: formatMoney(PRICING.subQuarterly),
						onStripe: () => pay("sub3", "stripe"),
						onPaystack: () => pay("sub3", "paystack")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayRow, {
						title: "All-books · 6 months",
						price: formatMoney(PRICING.subBiannual),
						onStripe: () => pay("sub6", "stripe"),
						onPaystack: () => pay("sub6", "paystack")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayRow, {
						title: "Tagged coupon after public launch",
						price: formatMoney(PRICING.taggedCouponPublic),
						onStripe: () => pay("coupon5", "stripe"),
						onPaystack: () => pay("coupon5", "paystack")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: [
					"Need a member coupon instead?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/account",
						className: "underline",
						children: "Open your account"
					}),
					"."
				]
			})
		]
	}) });
}
function PayRow({ title, price, onStripe, onPaystack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl",
			children: price
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "navy",
				onClick: onStripe,
				children: "Stripe"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onPaystack,
				children: "Paystack"
			})]
		})]
	});
}
//#endregion
export { Checkout as component };

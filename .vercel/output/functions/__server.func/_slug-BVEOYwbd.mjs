import { S as useNavigate, b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { n as PRICING } from "./_ssr/site-BJP5UGIc.mjs";
import { r as Route$2 } from "./_ssr/router-DQyfNFaT.mjs";
import { c as useCurrentUserState, s as formatMoney, t as Button } from "./_ssr/button-VMoNJXYX.mjs";
import { t as Shell } from "./_ssr/shell-Cyz-QISl.mjs";
import { t as Badge } from "./_ssr/badge-swUHOtDb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-BVEOYwbd.js
var import_jsx_runtime = require_jsx_runtime();
function BookPage() {
	const book = Route$2.useLoaderData();
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	if (!book) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		library: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-xl px-4 py-24 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "That title is not on the shelf."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "navy",
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/library",
					children: "Back to the library"
				})
			})]
		})
	});
	const online = book.online_price_cents / 100;
	const launched = book.launch_mode !== "prelaunch";
	const dl = launched ? book.download_public_cents / 100 : book.download_prelaunch_cents / 100;
	function goRead() {
		if (!book) return;
		if (!user) {
			navigate({ to: "/login" });
			return;
		}
		navigate({
			to: "/library/read/$slug",
			params: { slug: book.slug }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		library: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[0.9fr_1.1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: book.cover_url,
				alt: "",
				className: "book-3d mx-auto w-full max-w-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "blue",
							children: book.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: launched ? "navy" : "green",
							children: launched ? "Launch" : "Pre-launch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: "muted",
							children: ["Series ", book.series_no]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: "muted",
							children: [book.page_count, " image pages"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-4 font-display text-5xl",
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
					className: "mt-2 text-sm text-muted-foreground",
					children: [
						book.author,
						" · ",
						book.size === "short" ? "Short handbook" : book.size === "full" ? "Full guide" : "Medium book"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-xl text-lg text-muted-foreground",
					children: book.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-[0.16em] text-muted-foreground uppercase",
								children: "Online reading"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl",
								children: formatMoney(online)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									"Tagged members with a valid coupon read immediately. First ",
									3,
									" pages are a sample for everyone who is signed in."
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-[0.16em] text-muted-foreground uppercase",
								children: "Download"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl",
								children: formatMoney(dl)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									"Always paid — ",
									formatMoney(PRICING.downloadPrelaunch),
									" in pre-launch,",
									" ",
									formatMoney(PRICING.downloadPublic),
									" after launch. Never free."
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "navy",
						size: "lg",
						onClick: goRead,
						disabled: isPending,
						children: "Open the reader"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/checkout",
							search: { slug: book.slug },
							children: "See payment options"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-muted-foreground",
					children: "Every uploaded page image is watermarked with your name and CR or email in the reader. Sample access shows only the opening pages until the title is unlocked."
				})
			] })]
		})
	});
}
//#endregion
export { BookPage as component };

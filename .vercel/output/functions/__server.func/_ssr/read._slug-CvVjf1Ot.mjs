import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Lock, f as ChevronRight, p as ChevronLeft, t as X } from "../_libs/lucide-react.mjs";
import { N as logPage, P as readerPayload, c as acceptTos, n as Route } from "./router-DAbHp7-E.mjs";
import { a as DialogDescription$1, c as DialogTitle$1, g as useCurrentUserState, i as DialogContent$1, m as cn, n as Dialog$1, o as DialogOverlay$1, r as DialogClose, s as DialogPortal$1, t as Button, u as RedirectToSignIn } from "./dist-DJDlxxL0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/read._slug-CvVjf1Ot.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-navy/50 backdrop-blur-[2px]", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-[var(--shadow)]", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-4 right-4 rounded-sm text-muted-foreground hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-2xl font-semibold", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function Reader() {
	const { slug } = Route.useParams();
	const { user, isPending } = useCurrentUserState();
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [page, setPage] = (0, import_react.useState)(0);
	const [tos, setTos] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		readerPayload({ data: { slug } }).then((d) => {
			setData(d);
			setTos(!d.profile.tos_accepted_at);
		}).catch((e) => setError(e instanceof Error ? e.message : "We could not open this book."));
	}, [
		isPending,
		user,
		slug
	]);
	(0, import_react.useEffect)(() => {
		if (!data) return;
		const onKey = (e) => {
			if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, data.pages.length - 1));
			if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 0));
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [data]);
	(0, import_react.useEffect)(() => {
		if (!data) return;
		logPage({ data: {
			slug,
			pageIndex: page
		} }).catch(() => void 0);
	}, [
		data,
		page,
		slug
	]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center text-muted-foreground",
		children: "Opening the desk…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center px-4 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: error
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "navy",
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/library",
				children: "Back to the library"
			})
		})] })
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center text-muted-foreground",
		children: "Setting the page…"
	});
	const current = data.pages[page];
	const showLock = data.lockedFrom !== null && page === data.pages.length - 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-select min-h-dvh bg-navy text-navy-foreground",
		onContextMenu: (e) => e.preventDefault(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: tos,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "[&>button]:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Before you read" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "These pages are watermarked with your name and CR or email. Copying, sharing, or screenshots can be traced back to this account. You also accept the Terms of Service. This is education, not financial advice." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "navy",
							className: "mt-4 w-full",
							onClick: async () => {
								await acceptTos();
								setTos(false);
							},
							children: "I accept the terms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/terms",
							className: "mt-2 block text-center text-sm underline",
							children: "Read the terms"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3 px-4 py-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/library/$slug",
						params: { slug },
						className: "hover:underline",
						children: "Close reader"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate font-display text-lg",
						children: [
							data.book.title,
							" ",
							data.book.subtitle
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-navy-foreground/70",
						children: data.totalPages === 0 ? "No pages" : `${page + 1} / ${data.totalPages}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-3xl place-items-center px-3 py-6",
				children: current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "page-flip relative z-10 w-full overflow-hidden rounded-md bg-paper shadow-[var(--shadow)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: current.image_url,
							alt: `${data.book.title} page ${page + 1}`,
							className: "block w-full select-none",
							draggable: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-black/4 via-transparent to-black/8" }),
						[
							"top-1/4",
							"top-1/2",
							"top-3/4"
						].map((topClass, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `pointer-events-none absolute inset-x-6 ${topClass} rotate-[-18deg] text-center text-sm tracking-[0.28em] text-white/18 uppercase sm:text-base`,
							children: data.watermark
						}, `${topClass}-${index}`)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-0 top-0 flex items-center justify-between bg-black/45 px-4 py-3 text-[11px] tracking-[0.2em] text-white/80 uppercase",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: data.book.author }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Page ", page + 1] })]
						}),
						showLock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-4 bottom-4 rounded-md border border-white/15 bg-black/72 p-4 text-white shadow-lg backdrop-blur-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), " The rest of this book is locked"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-white/75",
									children: "Sample pages end here. Tagged members can generate a coupon. Everyone else can buy online access."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "navy",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/account",
											children: "Get a coupon"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "outline",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/checkout",
											search: { slug },
											children: "See pricing"
										})
									})]
								})
							]
						}) : null
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative z-10 w-full rounded-md border border-white/10 bg-white/5 p-8 text-center text-white/70",
					children: "No page images have been uploaded for this title yet."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 pb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "border-white/20 bg-transparent text-navy-foreground",
					disabled: page === 0,
					onClick: () => setPage((p) => Math.max(0, p - 1)),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), " Previous"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "border-white/20 bg-transparent text-navy-foreground",
					disabled: page >= data.pages.length - 1,
					onClick: () => setPage((p) => Math.min(data.pages.length - 1, p + 1)),
					children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
				})]
			})
		]
	});
}
//#endregion
export { Reader as component };

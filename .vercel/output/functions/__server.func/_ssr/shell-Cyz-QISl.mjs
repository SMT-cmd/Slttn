import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, c as DialogTrigger, n as DialogClose, o as DialogPortal, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { r as SITE } from "./site-BJP5UGIc.mjs";
import { c as Moon, i as Sun, t as X, u as Menu } from "../_libs/lucide-react.mjs";
import { s as useTheme } from "./router-DQyfNFaT.mjs";
import { a as UserButton, c as useCurrentUserState, i as SignedOut, o as cn, r as SignedIn, t as Button } from "./button-VMoNJXYX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-Cyz-QISl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-navy/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex h-full w-[min(92vw,22rem)] flex-col bg-card p-6 text-card-foreground", side === "right" ? "top-0 right-0" : "top-0 left-0", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-4 right-4 text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
var LINKS = [
	{
		to: "/library",
		label: "Library"
	},
	{
		to: "/community",
		label: "Community"
	},
	{
		to: "/pricing",
		label: "Pricing"
	},
	{
		to: "/about",
		label: "About"
	}
];
function Header({ library }) {
	const { theme, toggle } = useTheme();
	const { user, isPending } = useCurrentUserState();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: library ? "/brand/trading-library-powered.png" : "/brand/slt-logo.png",
						alt: "",
						className: cn("object-contain", library ? "h-10 w-10" : "h-10 w-10 rounded-full")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-lg font-semibold tracking-tight",
							children: library ? SITE.library : SITE.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:block",
							children: library ? "Powered by SLT Trade Hub" : SITE.tagline
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-6 md:flex",
					children: LINKS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: l.to,
						className: cn("text-sm font-medium text-muted-foreground hover:text-foreground", pathname.startsWith(l.to) && "text-foreground"),
						children: l.label
					}, l.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggle,
							className: "grid size-11 place-items-center rounded-md hover:bg-muted",
							"aria-label": "Toggle theme",
							children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
						}),
						isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-20 animate-pulse rounded-md bg-muted" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "navy",
							className: "hidden sm:inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Sign in"
							})
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedIn, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/account",
							className: "hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline",
							children: user?.displayName?.split(" ")[0] ?? "Account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
							open,
							onOpenChange: setOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-11 place-items-center rounded-md hover:bg-muted md:hidden",
									"aria-label": "Open menu",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl",
								children: SITE.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-col gap-4",
								children: [LINKS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: l.to,
									onClick: () => setOpen(false),
									className: "text-lg",
									children: l.label
								}, l.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									onClick: () => setOpen(false),
									className: "text-lg",
									children: "Sign in"
								})]
							})] })]
						})
					]
				})
			]
		})
	});
}
var LEGAL = [
	{
		to: "/privacy",
		label: "Privacy Policy"
	},
	{
		to: "/terms",
		label: "Terms of Service"
	},
	{
		to: "/disclaimer",
		label: "Financial Disclaimer"
	},
	{
		to: "/refund",
		label: "Refund Policy"
	},
	{
		to: "/cookies",
		label: "Cookie Policy"
	},
	{
		to: "/copyright",
		label: "Copyright / DMCA"
	},
	{
		to: "/about",
		label: "About"
	},
	{
		to: "/contact",
		label: "Contact"
	}
];
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-auto border-t border-border bg-navy text-navy-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/brand/slt-logo.png",
							alt: "",
							className: "h-12 w-12 rounded-full bg-paper"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl",
							children: SITE.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.16em] text-navy-foreground/70 uppercase",
							children: SITE.tagline
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-md text-sm text-navy-foreground/75",
						children: "Exclusive books and a serious room for synthetic indices traders. Educational content only — never a promise of profit."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.16em] uppercase text-navy-foreground/60",
					children: "Library"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/library",
							className: "hover:underline",
							children: "The Trading Library"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pricing",
							className: "hover:underline",
							children: "Pricing"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/community",
							className: "hover:underline",
							children: "Community & bots"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: SITE.telegram,
							className: "hover:underline",
							children: "Telegram"
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.16em] uppercase text-navy-foreground/60",
					children: "Legal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-col gap-2 text-sm",
					children: LEGAL.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: l.to,
						className: "hover:underline",
						children: l.label
					}, l.to))
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-white/10 px-4 py-4 text-center text-xs text-navy-foreground/55",
			children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" ",
				SITE.name,
				". ",
				SITE.domain
			]
		})]
	});
}
var KEY$1 = "slt-age-ok";
function AgeGate() {
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (window.localStorage.getItem(KEY$1) !== "1") setOpen(true);
	}, []);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[70] grid place-items-center bg-navy/70 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.18em] text-muted-foreground uppercase",
					children: "Age confirmation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl",
					children: "You must be 18 or older"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "SLT Trade Hub publishes educational material about trading. Trading involves a real risk of loss. Confirm you are at least 18 before you continue."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "navy",
						className: "flex-1",
						onClick: () => {
							window.localStorage.setItem(KEY$1, "1");
							window.dispatchEvent(new Event("slt-age"));
							setOpen(false);
						},
						children: "I am 18 or older"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "flex-1",
						onClick: () => {
							window.location.href = "https://www.google.com";
						},
						children: "Leave"
					})]
				})
			]
		})
	});
}
var KEY = "slt-consent";
function gtag(...args) {
	window.dataLayer = window.dataLayer ?? [];
	window.dataLayer.push(args);
}
function CookieBanner() {
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		window.dataLayer = window.dataLayer ?? [];
		const stored = window.localStorage.getItem(KEY);
		if (!(window.localStorage.getItem("slt-age-ok") === "1")) {
			const onAge = () => {
				if (window.localStorage.getItem(KEY)) return;
				gtag("consent", "default", {
					ad_storage: "denied",
					analytics_storage: "denied",
					ad_user_data: "denied",
					ad_personalization: "denied"
				});
				setOpen(true);
			};
			window.addEventListener("slt-age", onAge);
			return () => window.removeEventListener("slt-age", onAge);
		}
		if (!stored) {
			gtag("consent", "default", {
				ad_storage: "denied",
				analytics_storage: "denied",
				ad_user_data: "denied",
				ad_personalization: "denied"
			});
			setOpen(true);
		}
	}, []);
	function set(granted) {
		const value = granted ? "granted" : "denied";
		gtag("consent", "update", {
			ad_storage: value,
			analytics_storage: value,
			ad_user_data: value,
			ad_personalization: value
		});
		window.localStorage.setItem(KEY, granted ? "granted" : "denied");
		setOpen(false);
	}
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-[var(--shadow)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"We use cookies for the site, and — after you agree — for Google AdSense. Read the",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/cookies",
						className: "underline",
						children: "Cookie Policy"
					}),
					" ",
					"and",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/privacy",
						className: "underline",
						children: "Privacy Policy"
					}),
					"."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => set(false),
					children: "Reject extra cookies"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "navy",
					size: "sm",
					onClick: () => set(true),
					children: "Accept"
				})]
			})]
		})
	});
}
function Shell({ children, library, bare }) {
	if (bare) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgeGate, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, { library }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CookieBanner, {})
		]
	});
}
//#endregion
export { Shell as t };

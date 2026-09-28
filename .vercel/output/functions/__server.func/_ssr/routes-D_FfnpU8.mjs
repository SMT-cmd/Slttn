import { T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as SITE } from "./site-BJP5UGIc.mjs";
import { a as Sparkles, g as ArrowRight, h as BookOpen, l as MessageCircle, m as Bot, n as Users, o as Shield } from "../_libs/lucide-react.mjs";
import { o as Route$18 } from "./router-DAbHp7-E.mjs";
import { m as cn, t as Button } from "./dist-DJDlxxL0.mjs";
import { t as Shell } from "./shell-DHDyTYq0.mjs";
import { t as BookCard } from "./book-card-DiMOMulw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D_FfnpU8.js
var import_jsx_runtime = require_jsx_runtime();
var SHAPE = [
	{
		x: 8,
		h: 42,
		wick: 18,
		up: false
	},
	{
		x: 28,
		h: 58,
		wick: 14,
		up: false
	},
	{
		x: 48,
		h: 36,
		wick: 22,
		up: true
	},
	{
		x: 68,
		h: 28,
		wick: 16,
		up: true
	},
	{
		x: 88,
		h: 48,
		wick: 20,
		up: false
	},
	{
		x: 108,
		h: 64,
		wick: 18,
		up: false
	},
	{
		x: 128,
		h: 40,
		wick: 14,
		up: true
	},
	{
		x: 148,
		h: 46,
		wick: 24,
		up: true
	},
	{
		x: 168,
		h: 32,
		wick: 12,
		up: true
	},
	{
		x: 188,
		h: 54,
		wick: 16,
		up: false
	},
	{
		x: 208,
		h: 38,
		wick: 20,
		up: true
	}
];
function CandleStrip({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 230 110",
		className: cn("h-full w-full", className),
		"aria-hidden": true,
		children: SHAPE.map((c, i) => {
			const bodyY = 88 - c.h;
			const color = c.up ? "var(--profit)" : i % 5 === 0 ? "#1a1f24" : "var(--loss)";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: "candle",
				style: { animationDelay: `${i * 120}ms` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: c.x + 5,
					x2: c.x + 5,
					y1: bodyY - c.wick / 2,
					y2: bodyY + c.h + c.wick / 2,
					stroke: color,
					strokeWidth: "1.6"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: c.x,
					y: bodyY,
					width: "10",
					height: c.h,
					fill: color,
					rx: "1"
				})]
			}, c.x);
		})
	});
}
var BENEFITS = [
	{
		icon: BookOpen,
		title: "A real library, not a folder of PDFs",
		text: "Designed covers, a proper reader, and books written as a series — not recycled threads."
	},
	{
		icon: Shield,
		title: "Access that respects the partnership",
		text: "Tagged SLT members get member pricing and coupons. Everyone else pays the listed rate."
	},
	{
		icon: Users,
		title: "A room that stays serious",
		text: "Telegram, WhatsApp, and signal bots for people who already treat this as work."
	},
	{
		icon: Sparkles,
		title: "Always-on markets, written clearly",
		text: "Volatility, Boom & Crash, Step, Jump, Range — without folklore and without gold-leaf hype."
	}
];
var STEPS = [
	{
		n: "01",
		t: "Sign in",
		d: "Google, X, or email. Then link your Deriv CR if you have one."
	},
	{
		n: "02",
		t: "Confirm access",
		d: "Tagged members generate a coupon. Everyone else chooses a book or a pass."
	},
	{
		n: "03",
		t: "Read at the desk",
		d: "Open the online reader. Every page is watermarked to you."
	},
	{
		n: "04",
		t: "Stay in the room",
		d: "Join the community and the bots after you have a process, not before."
	}
];
var QUOTES = [
	{
		q: "The lot-size chapter is the first time someone explained Crash without selling me a signal.",
		n: "Adewale K.",
		r: "Lagos · V75 & Crash 500"
	},
	{
		q: "I stopped chasing Boom spikes after the timing chapter. Quiet weeks started paying.",
		n: "Chioma O.",
		r: "Abuja · Boom 1000"
	},
	{
		q: "It reads like a desk manual, not a guru funnel. That is why I stayed.",
		n: "Ibrahim S.",
		r: "Accra · Step Index"
	},
	{
		q: "The watermarked reader is annoying in the right way. I treat the books like they cost something.",
		n: "Naledi M.",
		r: "Johannesburg · Jump 25"
	}
];
function Home() {
	const books = Route$18.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-[28rem] bg-[var(--hero-wash)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rise text-xs tracking-[0.22em] text-muted-foreground uppercase",
						children: "SLT Trade Hub"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "rise rise-2 mt-4 font-display text-5xl font-semibold text-navy dark:text-foreground sm:text-6xl lg:text-7xl",
						children: "For traders who protect capital and trade with intent."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rise rise-3 mt-5 max-w-xl text-lg text-muted-foreground",
						children: "Study with practical books, serious access, and a disciplined community focused on Volatility, Boom & Crash, Step, Jump, and Range."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "navy",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/library",
								children: ["Enter The Trading Library ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/community",
								children: "Join the Community"
							})
						})]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl bg-mint px-4 py-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleStrip, { className: "h-36" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/covers/synthetic-indices-101.png",
						alt: "Synthetic Indices 101",
						className: "book-3d absolute -bottom-8 right-4 hidden w-40 sm:block lg:w-52"
					})]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-6xl px-4 py-20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
					children: "What this is"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 max-w-3xl font-display text-4xl sm:text-5xl",
					children: "SLT Trade Hub gives traders a stronger foundation before they put on risk."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 max-w-2xl text-muted-foreground",
					children: "We publish books for traders who want cleaner entries, better sizing, and stronger control. The library and community are built to support serious trading work."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "border-y border-border bg-card py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-end justify-between px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
						children: "The Trading Library"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-4xl",
						children: "Featured titles"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/library",
						className: "hidden text-sm font-medium text-primary sm:inline",
						children: "Browse all titles"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "marquee px-4",
						children: (books ?? []).concat(books ?? []).map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: b.cover_url,
							alt: b.title,
							className: "h-64 w-auto rounded-sm shadow-[var(--shadow)]"
						}, `${b.slug}-${i}`))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4",
					children: (books ?? []).slice(0, 4).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCard, { book: b }, b.slug))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-6xl px-4 py-20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
					children: "Why join"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-4xl",
					children: "What you get"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid gap-6 sm:grid-cols-2",
					children: BENEFITS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-4 font-display text-2xl",
								children: b.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: b.text
							})
						]
					}, b.title))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-navy py-20 text-navy-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.2em] text-navy-foreground/60 uppercase",
						children: "How it works"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-4xl",
						children: "How access works"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4",
						children: STEPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-3xl text-primary",
								children: s.n
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 text-lg font-medium",
								children: s.t
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-navy-foreground/70",
								children: s.d
							})
						] }, s.n))
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-6xl px-4 py-20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
					children: "Community"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-4xl",
					children: "Stay in the room"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-4 md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: SITE.telegram,
							className: "rounded-xl border border-border bg-card p-6 hover:border-primary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 font-display text-2xl",
									children: "Telegram"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "The main room for SLT members. Market discussion, reviews, and session context."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: SITE.whatsapp,
							className: "rounded-xl border border-border bg-card p-6 hover:border-primary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-profit" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 font-display text-2xl",
									children: "WhatsApp"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "Session notes, reminders, and trading-day updates."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5 text-loss" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 font-display text-2xl",
									children: "Market alerts"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "Optional alerts. They do not replace the books, the size, or your stop."
								})
							]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-mint/60 py-16 dark:bg-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl overflow-hidden px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
					children: "Trader feedback"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "marquee mt-8 items-stretch",
					children: QUOTES.concat(QUOTES).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
						className: "w-[min(80vw,22rem)] shrink-0 rounded-xl border border-border bg-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-2xl leading-snug",
							children: [
								"“",
								t.q,
								"”"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
							className: "mt-4 text-sm text-muted-foreground",
							children: [
								t.n,
								" · ",
								t.r
							]
						})]
					}, i))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-4 py-20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-4xl rounded-xl bg-navy px-6 py-14 text-center text-navy-foreground sm:px-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-4xl sm:text-5xl",
						children: "Open the library."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-4 max-w-lg text-navy-foreground/75",
						children: "Start with the title that fits your market and study in a reading experience built for focused work."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col justify-center gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/library",
								children: "Enter The Trading Library"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							className: "border-white/20 bg-transparent text-navy-foreground hover:bg-white/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/community",
								children: "Join the Community"
							})
						})]
					})
				]
			})
		})
	] });
}
//#endregion
export { Home as component };

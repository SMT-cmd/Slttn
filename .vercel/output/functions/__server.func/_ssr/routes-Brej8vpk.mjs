import { w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SITE } from "./site-Bh5vnfwv.mjs";
import { c as useSiteContext } from "./site-context-BnUpVMbC.mjs";
import { a as Sparkles, g as ArrowRight, h as BookOpen, l as MessageCircle, m as Bot, n as Users, o as Shield } from "../_libs/lucide-react.mjs";
import { B as Button, c as BookCard, i as LibraryCatalogContent, u as Route$20, z as Shell } from "./router-DMO4jLWn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Brej8vpk.js
var import_jsx_runtime = require_jsx_runtime();
var BENEFITS = [
	{
		icon: BookOpen,
		title: "Books worth studying",
		text: "Straight trading books, serious online access, and material you will keep coming back to before the market opens."
	},
	{
		icon: Shield,
		title: "Clear access and pricing",
		text: "Members get their access. New readers see the price clearly from the start."
	},
	{
		icon: Users,
		title: "A serious trading community",
		text: "Telegram, WhatsApp, and market notes for traders who value discipline, accountability, and clear execution."
	},
	{
		icon: Sparkles,
		title: "Focused on synthetic indices",
		text: "Volatility, Boom & Crash, Step, Jump, and Range explained in clear trading language."
	}
];
var STEPS = [
	{
		n: "01",
		t: "Sign in",
		d: "Sign in with Deriv, Google, X, or email."
	},
	{
		n: "02",
		t: "Confirm your access",
		d: "Eligible members can unlock access. Everyone else can choose a title or a pass."
	},
	{
		n: "03",
		t: "Open your book",
		d: "Read in the online library built for focused study and repeat review."
	},
	{
		n: "04",
		t: "Stay connected",
		d: "Use the community, notes, and optional alerts to stay sharp between sessions."
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
	const books = Route$20.useLoaderData();
	if (useSiteContext().isLibraryHost) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryCatalogContent, { books });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rise text-xs tracking-[0.22em] text-muted-foreground uppercase",
						children: "SLT Trade Hub"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "rise rise-2 mt-4 font-display text-5xl font-semibold text-navy dark:text-foreground sm:text-6xl lg:text-7xl",
						children: "For traders who protect capital and trade with intent."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rise rise-3 mt-5 max-w-xl text-lg text-muted-foreground",
						children: "Study with practical books, serious access, and a disciplined community focused on Volatility, Boom & Crash, Step, Jump, and Range."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rise rise-4 mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-border bg-card px-3 py-1",
								children: "Practical trading books"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-border bg-card px-3 py-1",
								children: "Secure online reader"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-border bg-card px-3 py-1",
								children: "Community and market notes"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "navy",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: SITE.libraryUrl,
								children: ["Explore The Trading Library ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[28px] border border-border bg-card p-6 shadow-[var(--shadow)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-[0.18em] text-muted-foreground uppercase",
								children: "The Trading Library"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-display text-3xl text-navy dark:text-foreground",
								children: "Clear material for serious traders."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/brand/slt-logo.png",
								alt: SITE.name,
								className: "size-16 rounded-full object-cover"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl bg-muted px-4 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs tracking-[0.16em] text-muted-foreground uppercase",
										children: "Coverage"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm font-medium",
										children: "Volatility, Boom & Crash, Step, Jump, Range"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl bg-muted px-4 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs tracking-[0.16em] text-muted-foreground uppercase",
										children: "Access"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm font-medium",
										children: "Online reader, member pricing, straightforward checkout"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl bg-muted px-4 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs tracking-[0.16em] text-muted-foreground uppercase",
										children: "Focus"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm font-medium",
										children: "Risk, execution, and repeatable process"
									})]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/covers/synthetic-indices-101.png",
						alt: "Synthetic Indices 101",
						className: "book-3d absolute -bottom-8 right-4 hidden w-40 sm:block lg:w-52"
					})]
				})]
			})
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: SITE.libraryUrl,
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
									children: "Optional alerts that support your plan. They never replace risk control."
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: SITE.libraryUrl,
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

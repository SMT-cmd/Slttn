import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as Search } from "../_libs/lucide-react.mjs";
import { a as Route$4, c as BookCard, o as Input, z as Shell } from "./router-DMO4jLWn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-B2xMEIz-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LibraryCatalogContent({ books }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [cat, setCat] = (0, import_react.useState)("All");
	const categories = (0, import_react.useMemo)(() => ["All", ...new Set(books.map((book) => book.category).filter(Boolean))], [books]);
	const filtered = (0, import_react.useMemo)(() => {
		return books.filter((b) => {
			const hay = `${b.title} ${b.subtitle} ${b.description} ${b.category}`.toLowerCase();
			const okQ = !q || hay.includes(q.toLowerCase());
			const okC = cat === "All" || b.category === cat;
			return okQ && okC;
		});
	}, [
		books,
		q,
		cat
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		library: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-border bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-4 py-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.22em] text-muted-foreground uppercase",
						children: "The Trading Library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-5xl sm:text-6xl",
						children: "A serious library for synthetic indices traders."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-muted-foreground",
						children: "Browse the collection, filter by market, and open any title to see what it covers, what it costs, and how to get access."
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "pl-10",
						placeholder: "Search by title, topic, or market",
						value: q,
						onChange: (e) => setQ(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCat(c),
						className: `h-10 rounded-md px-3 text-sm ${cat === c ? "bg-navy text-navy-foreground" : "bg-muted text-muted-foreground"}`,
						children: c
					}, c))
				})]
			}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-16 text-center text-muted-foreground",
				children: "No title matches that search yet. Try another keyword or category."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3",
				children: filtered.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCard, { book: b }, b.slug))
			})]
		})]
	});
}
function Library() {
	const books = Route$4.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryCatalogContent, { books });
}
//#endregion
export { LibraryCatalogContent, Library as component };

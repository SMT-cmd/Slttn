import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as adminSetTagged, E as adminUsers, S as adminSetBan, T as adminUpdateBook, _ as adminOverview, b as adminSaveBookCover, d as adminCreateBook, f as adminCreateBookPages, g as adminLogs, h as adminDeleteBookPage, j as getMe, l as adminBooks, m as adminDeleteBook, p as adminCreateCoupon, u as adminCoupons, v as adminReorderBookPages, w as adminSignCloudinaryUpload, x as adminSaveSetting, y as adminSales } from "./router-DQyfNFaT.mjs";
import { c as useCurrentUserState, n as RedirectToSignIn, s as formatMoney, t as Button } from "./button-VMoNJXYX.mjs";
import { t as Shell } from "./shell-Cyz-QISl.mjs";
import { t as Input } from "./input-DY3dfF79.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-wnFJtk8-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_BOOK = {
	title: "",
	subtitle: "",
	slug: "",
	category: "Synthetic Indices",
	size: "medium",
	launch_mode: "prelaunch",
	blurb: "",
	published: true
};
function createBookDraft(book) {
	return {
		id: book.id,
		title: book.title,
		subtitle: book.subtitle,
		slug: book.slug,
		category: book.category,
		size: book.size,
		launch_mode: book.launch_mode === "prelaunch" ? "prelaunch" : "launch",
		blurb: book.description,
		published: book.published,
		sort_order: book.sort_order,
		cover_url: book.cover_url
	};
}
function normalizeSettings(settings) {
	return {
		global_prelaunch: settings.global_prelaunch !== "false",
		partner_code: settings.partner_code ?? "",
		support_email: settings.support_email ?? "",
		telegram_url: settings.telegram_url ?? "",
		whatsapp_url: settings.whatsapp_url ?? "",
		community_links: settings.community_links ?? "[]"
	};
}
function TabButton({ active, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `h-10 rounded-md px-4 text-sm capitalize ${active ? "bg-navy text-navy-foreground" : "bg-muted"}`,
		children: label
	});
}
async function uploadFile(file, signed) {
	const body = new FormData();
	body.set("file", file);
	body.set("api_key", signed.apiKey);
	body.set("folder", signed.folder);
	body.set("public_id", signed.publicId);
	body.set("resource_type", signed.resourceType);
	body.set("signature", signed.signature);
	body.set("tags", signed.tags);
	body.set("timestamp", String(signed.timestamp));
	const response = await fetch(signed.uploadUrl, {
		method: "POST",
		body
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || "Cloudinary upload failed.");
	}
	const payload = await response.json();
	if (!payload.secure_url) throw new Error("Cloudinary did not return a secure image URL.");
	return payload.secure_url;
}
function Admin() {
	const { user, isPending } = useCurrentUserState();
	const [tab, setTab] = (0, import_react.useState)("home");
	const [allowed, setAllowed] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		getMe().then((profile) => setAllowed(profile.role === "admin")).catch(() => setAllowed(false));
	}, [isPending, user]);
	if (isPending || allowed === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center",
		children: "Checking the desk…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!allowed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg px-4 py-24 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "This desk is locked."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted-foreground",
				children: "You need admin access."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "navy",
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account",
					children: "Back to account"
				})
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-5xl",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "home",
						label: "home",
						onClick: () => setTab("home")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "books",
						label: "books",
						onClick: () => setTab("books")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "users",
						label: "users",
						onClick: () => setTab("users")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "coupons",
						label: "coupons",
						onClick: () => setTab("coupons")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "sales",
						label: "sales",
						onClick: () => setTab("sales")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [
					tab === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomePanel, {}) : null,
					tab === "books" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BooksPanel, {}) : null,
					tab === "users" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersPanel, {}) : null,
					tab === "coupons" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouponsPanel, {}) : null,
					tab === "sales" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesPanel, {}) : null
				]
			})
		]
	}) });
}
function HomePanel() {
	const [data, setData] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		adminOverview().then((payload) => {
			setData(payload);
			setForm(normalizeSettings(payload.settings));
		}).catch((error) => toast.error(error instanceof Error ? error.message : "Could not load admin overview."));
	}, []);
	if (!data || !form) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Loading…" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 xl:grid-cols-4",
		children: [[
			["Readers", data.users],
			["Tagged", data.tagged],
			["Titles", data.books],
			["Sales", formatMoney(data.salesCents / 100)]
		].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-card p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.16em] uppercase text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-3xl",
				children: value
			})]
		}, String(label))), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "xl:col-span-4 rounded-xl border border-border bg-card p-5",
			onSubmit: async (event) => {
				event.preventDefault();
				const saves = [
					["global_prelaunch", String(form.global_prelaunch)],
					["partner_code", form.partner_code],
					["support_email", form.support_email],
					["telegram_url", form.telegram_url],
					["whatsapp_url", form.whatsapp_url],
					["community_links", form.community_links]
				];
				try {
					await Promise.all(saves.map(([key, value]) => adminSaveSetting({ data: {
						key,
						value
					} })));
					toast.success("Settings saved.");
				} catch (error) {
					toast.error(error instanceof Error ? error.message : "Could not save settings.");
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "rounded-lg border border-border bg-background p-4 text-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: form.global_prelaunch,
									onChange: (event) => setForm((current) => current ? {
										...current,
										global_prelaunch: event.target.checked
									} : current)
								}), "Global pre-launch coupon mode"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Partner code",
							value: form.partner_code,
							onChange: (value) => setForm((current) => current ? {
								...current,
								partner_code: value
							} : current)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Support email",
							value: form.support_email,
							onChange: (value) => setForm((current) => current ? {
								...current,
								support_email: value
							} : current)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Telegram link",
							value: form.telegram_url,
							onChange: (value) => setForm((current) => current ? {
								...current,
								telegram_url: value
							} : current)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "WhatsApp link",
							value: form.whatsapp_url,
							onChange: (value) => setForm((current) => current ? {
								...current,
								whatsapp_url: value
							} : current)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 block text-muted-foreground",
						children: "Community links JSON"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: form.community_links,
						onChange: (event) => setForm((current) => current ? {
							...current,
							community_links: event.target.value
						} : current),
						className: "min-h-40 w-full rounded-md border border-border bg-background px-3 py-2"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "navy",
					className: "mt-4",
					children: "Save settings"
				})
			]
		})]
	});
}
function BooksPanel() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [newBook, setNewBook] = (0, import_react.useState)(EMPTY_BOOK);
	const reload = async () => {
		const books = await adminBooks();
		setRows(books);
	};
	(0, import_react.useEffect)(() => {
		reload().catch((error) => toast.error(error instanceof Error ? error.message : "Could not load books."));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "rounded-xl border border-border bg-card p-5",
			onSubmit: async (event) => {
				event.preventDefault();
				try {
					await adminCreateBook({ data: newBook });
					setNewBook(EMPTY_BOOK);
					await reload();
					toast.success("Book created.");
				} catch (error) {
					toast.error(error instanceof Error ? error.message : "Could not create the book.");
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.16em] uppercase text-muted-foreground",
					children: "Create book"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Title",
							value: newBook.title,
							onChange: (value) => setNewBook((current) => ({
								...current,
								title: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Subtitle",
							value: newBook.subtitle,
							onChange: (value) => setNewBook((current) => ({
								...current,
								subtitle: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Slug",
							value: newBook.slug,
							onChange: (value) => setNewBook((current) => ({
								...current,
								slug: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Category",
							value: newBook.category,
							onChange: (value) => setNewBook((current) => ({
								...current,
								category: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Size",
							value: newBook.size,
							options: [
								"short",
								"medium",
								"full"
							],
							onChange: (value) => setNewBook((current) => ({
								...current,
								size: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Launch mode",
							value: newBook.launch_mode,
							options: ["prelaunch", "launch"],
							onChange: (value) => setNewBook((current) => ({
								...current,
								launch_mode: value
							}))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 block text-muted-foreground",
						children: "Blurb"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: newBook.blurb,
						onChange: (event) => setNewBook((current) => ({
							...current,
							blurb: event.target.value
						})),
						className: "min-h-28 w-full rounded-md border border-border bg-background px-3 py-2"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: newBook.published,
						onChange: (event) => setNewBook((current) => ({
							...current,
							published: event.target.checked
						}))
					}), "Published"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "navy",
					className: "mt-4",
					children: "Create book"
				})
			]
		}), rows.map((book) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookEditor, {
			book,
			onReload: reload
		}, book.id))]
	});
}
function BookEditor({ book, onReload }) {
	const [draft, setDraft] = (0, import_react.useState)(() => createBookDraft(book));
	const [pages, setPages] = (0, import_react.useState)(book.pages ?? []);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setDraft(createBookDraft(book));
		setPages(book.pages ?? []);
	}, [book]);
	const reorderedPageIds = (0, import_react.useMemo)(() => pages.map((page) => page.id), [pages]);
	async function saveBook() {
		setBusy(true);
		try {
			await adminUpdateBook({ data: {
				id: draft.id,
				title: draft.title,
				subtitle: draft.subtitle,
				slug: draft.slug,
				category: draft.category,
				size: draft.size,
				launch_mode: draft.launch_mode,
				blurb: draft.blurb,
				published: draft.published,
				sort_order: draft.sort_order,
				cover_url: draft.cover_url
			} });
			await onReload();
			toast.success(`Saved ${draft.title}.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not save the book.");
		} finally {
			setBusy(false);
		}
	}
	async function handleCoverUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		setBusy(true);
		try {
			const coverUrl = await uploadFile(file, await adminSignCloudinaryUpload({ data: {
				kind: "cover",
				bookSlug: draft.slug || draft.title,
				fileName: file.name
			} }));
			await adminSaveBookCover({ data: {
				id: draft.id,
				coverUrl
			} });
			setDraft((current) => ({
				...current,
				cover_url: coverUrl
			}));
			await onReload();
			toast.success("Cover updated.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Cover upload failed.");
		} finally {
			event.target.value = "";
			setBusy(false);
		}
	}
	async function handlePageUpload(event) {
		const files = Array.from(event.target.files ?? []);
		if (files.length === 0) return;
		setBusy(true);
		try {
			const urls = await Promise.all(files.map(async (file) => {
				return uploadFile(file, await adminSignCloudinaryUpload({ data: {
					kind: "page",
					bookSlug: draft.slug || draft.title,
					fileName: file.name
				} }));
			}));
			const nextPages = await adminCreateBookPages({ data: {
				bookId: draft.id,
				imageUrls: urls
			} });
			setPages(nextPages);
			await onReload();
			toast.success(`${files.length} page image${files.length > 1 ? "s" : ""} uploaded.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Page upload failed.");
		} finally {
			event.target.value = "";
			setBusy(false);
		}
	}
	async function movePage(pageId, direction) {
		const index = pages.findIndex((page) => page.id === pageId);
		const nextIndex = index + direction;
		if (index < 0 || nextIndex < 0 || nextIndex >= pages.length) return;
		const nextPages = [...pages];
		const [moved] = nextPages.splice(index, 1);
		nextPages.splice(nextIndex, 0, moved);
		setPages(nextPages);
		try {
			const refreshed = await adminReorderBookPages({ data: {
				bookId: draft.id,
				pageIds: nextPages.map((page) => page.id)
			} });
			setPages(refreshed);
		} catch (error) {
			setPages(book.pages ?? []);
			toast.error(error instanceof Error ? error.message : "Could not reorder pages.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "rounded-xl border border-border bg-card p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[220px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: draft.cover_url,
					alt: draft.title,
					className: "h-72 w-full rounded-xl object-cover shadow-[var(--shadow)]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 block text-muted-foreground",
						children: "Change cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "image/*",
						onChange: handleCoverUpload,
						disabled: busy
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						pages.length,
						" page image",
						pages.length === 1 ? "" : "s",
						" · ",
						formatMoney(book.online_price_cents / 100),
						" online"
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Title",
							value: draft.title,
							onChange: (value) => setDraft((current) => ({
								...current,
								title: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Subtitle",
							value: draft.subtitle,
							onChange: (value) => setDraft((current) => ({
								...current,
								subtitle: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Slug",
							value: draft.slug,
							onChange: (value) => setDraft((current) => ({
								...current,
								slug: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Category",
							value: draft.category,
							onChange: (value) => setDraft((current) => ({
								...current,
								category: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Sort order",
							value: String(draft.sort_order),
							onChange: (value) => setDraft((current) => ({
								...current,
								sort_order: Number.parseInt(value || "0", 10) || 0
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Size",
							value: draft.size,
							options: [
								"short",
								"medium",
								"full"
							],
							onChange: (value) => setDraft((current) => ({
								...current,
								size: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Launch mode",
							value: draft.launch_mode,
							options: ["prelaunch", "launch"],
							onChange: (value) => setDraft((current) => ({
								...current,
								launch_mode: value
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-end gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: draft.published,
								onChange: (event) => setDraft((current) => ({
									...current,
									published: event.target.checked
								}))
							}), "Published"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 block text-muted-foreground",
						children: "Blurb"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: draft.blurb,
						onChange: (event) => setDraft((current) => ({
							...current,
							blurb: event.target.value
						})),
						className: "min-h-32 w-full rounded-md border border-border bg-background px-3 py-2"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "navy",
							onClick: saveBook,
							disabled: busy,
							children: "Save book"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setDraft((current) => ({
								...current,
								launch_mode: current.launch_mode === "prelaunch" ? "launch" : "prelaunch"
							})),
							children: "Toggle launch mode"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: draft.published ? "outline" : "profit",
							onClick: () => setDraft((current) => ({
								...current,
								published: !current.published
							})),
							children: draft.published ? "Mark unpublished" : "Publish"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "loss",
							onClick: async () => {
								if (!window.confirm(`Delete ${draft.title}?`)) return;
								try {
									await adminDeleteBook({ data: { id: draft.id } });
									await onReload();
									toast.success("Book deleted.");
								} catch (error) {
									toast.error(error instanceof Error ? error.message : "Could not delete the book.");
								}
							},
							children: "Delete book"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-xl border border-border bg-background p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-[0.16em] uppercase text-muted-foreground",
								children: "Book pages"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Upload image pages, reorder them, or remove a page."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-2 block text-muted-foreground",
									children: "Upload page images"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/*",
									multiple: true,
									onChange: handlePageUpload,
									disabled: busy
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3",
							children: pages.map((page, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-card p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: page.image_url,
										alt: `Page ${page.page_number}`,
										className: "h-48 w-full rounded-md object-cover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm font-medium",
										children: ["Page ", page.page_number]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: index === 0,
												onClick: () => movePage(page.id, -1),
												children: "Move up"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: index === pages.length - 1,
												onClick: () => movePage(page.id, 1),
												children: "Move down"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "loss",
												onClick: async () => {
													try {
														const nextPages = await adminDeleteBookPage({ data: {
															pageId: page.id,
															bookId: draft.id
														} });
														setPages(nextPages);
														await onReload();
														toast.success("Page removed.");
													} catch (error) {
														toast.error(error instanceof Error ? error.message : "Could not remove the page.");
													}
												},
												children: "Delete"
											})
										]
									})
								]
							}, page.id))
						}),
						reorderedPageIds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: "No page images uploaded yet."
						}) : null
					]
				})
			] })]
		})
	});
}
function UsersPanel() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const reload = async () => {
		const users = await adminUsers();
		setRows(users);
	};
	(0, import_react.useEffect)(() => {
		reload().catch((error) => toast.error(error instanceof Error ? error.message : "Could not load users."));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-xl border border-border bg-card p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2",
						children: "Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Email" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "CR" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Role" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Tag" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border align-top",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3",
						children: user.full_name ?? "Unnamed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: user.email ?? "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: user.deriv_cr ?? "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: user.role }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: user.deriv_tagged ? "tagged" : "not tagged" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "space-x-2 whitespace-nowrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: async () => {
								await adminSetTagged({ data: {
									userId: user.user_id,
									tagged: !user.deriv_tagged
								} });
								await reload();
							},
							children: "Toggle tag"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: user.banned ? "profit" : "loss",
							onClick: async () => {
								await adminSetBan({ data: {
									userId: user.user_id,
									banned: !user.banned
								} });
								await reload();
							},
							children: user.banned ? "Unban" : "Ban"
						})]
					})
				]
			}, user.user_id)) })]
		})
	});
}
function CouponsPanel() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [books, setBooks] = (0, import_react.useState)([]);
	const [code, setCode] = (0, import_react.useState)("");
	const [uses, setUses] = (0, import_react.useState)("20");
	const [bookId, setBookId] = (0, import_react.useState)("");
	const reload = async () => {
		const [couponRows, bookRows] = await Promise.all([adminCoupons(), adminBooks()]);
		setRows(couponRows ?? []);
		setBooks(bookRows);
	};
	(0, import_react.useEffect)(() => {
		reload().catch((error) => toast.error(error instanceof Error ? error.message : "Could not load coupons."));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "rounded-xl border border-border bg-card p-5",
			onSubmit: async (event) => {
				event.preventDefault();
				try {
					await adminCreateCoupon({ data: {
						code,
						uses: Number.parseInt(uses || "1", 10) || 1,
						bookId: bookId || void 0
					} });
					setCode("");
					setUses("20");
					setBookId("");
					await reload();
					toast.success("Coupon created.");
				} catch (error) {
					toast.error(error instanceof Error ? error.message : "Could not create the coupon.");
				}
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Code",
						value: code,
						onChange: setCode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Uses",
						value: uses,
						onChange: setUses
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-2 block text-muted-foreground",
							children: "Book scope"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: bookId,
							onChange: (event) => setBookId(event.target.value),
							className: "h-11 w-full rounded-md border border-border bg-background px-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All books"
							}), books.map((book) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: book.id,
								children: book.title
							}, book.id))]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "navy",
				className: "mt-4",
				children: "Create coupon"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3 text-sm",
			children: rows.map((coupon) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-xl border border-border bg-card px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: coupon.code
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [
							coupon.kind,
							" · ",
							coupon.uses_remaining,
							" left"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-muted-foreground",
					children: [
						"Book: ",
						coupon.book_id ?? "all books",
						" · User: ",
						coupon.user_id ?? "unassigned"
					]
				})]
			}, coupon.id))
		})]
	});
}
function SalesPanel() {
	const [sales, setSales] = (0, import_react.useState)([]);
	const [logs, setLogs] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		Promise.all([adminSales(), adminLogs()]).then(([saleRows, logRows]) => {
			setSales(saleRows ?? []);
			setLogs(logRows ?? []);
		}).catch((error) => toast.error(error instanceof Error ? error.message : "Could not load sales."));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl",
			children: "Sales"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-3 space-y-2 text-sm",
			children: [sales.map((sale) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-border bg-card px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium",
					children: [
						sale.kind,
						" · ",
						formatMoney(sale.amount_cents / 100)
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground",
					children: [
						sale.provider,
						" · ",
						sale.status,
						" · ref ",
						sale.reference ?? "pending"
					]
				})]
			}, sale.id)), sales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-muted-foreground",
				children: "No sales yet."
			}) : null]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl",
			children: "Reading log"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-3 space-y-2 text-sm",
			children: [logs.map((log, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-border bg-card px-3 py-2",
				children: [
					log.user_id.slice(0, 8),
					" · book ",
					log.book_id,
					" · page ",
					log.page_index + 1
				]
			}, `${log.user_id}-${log.book_id}-${index}`)), logs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-muted-foreground",
				children: "No pages opened yet."
			}) : null]
		})] })]
	});
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-2 block text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value,
			onChange: (event) => onChange(event.target.value)
		})]
	});
}
function SelectField({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-2 block text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value,
			onChange: (event) => onChange(event.target.value),
			className: "h-11 w-full rounded-md border border-border bg-background px-3",
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: option,
				children: option
			}, option))
		})]
	});
}
//#endregion
export { Admin as component };

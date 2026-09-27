import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as deleteMyAccount, F as redeemCoupon, L as updateProfileName, M as linkDeriv, O as exportMyData, j as getMe, k as generateMemberCoupon } from "./router-DAbHp7-E.mjs";
import { g as useCurrentUserState, t as Button, u as RedirectToSignIn } from "./dist-DJDlxxL0.mjs";
import { t as Shell } from "./shell-DHDyTYq0.mjs";
import { t as Badge } from "./badge-Bd3zoPZi.mjs";
import { t as Input } from "./input-Cs_CjqnH.mjs";
import { t as Label } from "./label-DR9CMjK_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-B5WZTP8X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Account() {
	const { user, isPending } = useCurrentUserState();
	const [me, setMe] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [cr, setCr] = (0, import_react.useState)("");
	const [partner, setPartner] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		getMe().then((p) => {
			setMe(p);
			setName(p.full_name ?? "");
			setCr(p.deriv_cr ?? "");
		}).catch((e) => toast.error(e instanceof Error ? e.message : "Could not load account."));
	}, [isPending, user]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center",
		children: "Loading your desk…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
				children: "Account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl",
				children: "Your desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: user.primaryEmail
			}),
			me?.banned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 rounded-md border border-loss/30 bg-loss/10 p-4 text-loss",
				children: "This account has been suspended. Write to hello@slttradehub.online if you think that is a mistake."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 rounded-xl border border-border bg-card p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Name on the watermark"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Full name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "navy",
						onClick: async () => {
							try {
								await updateProfileName({ data: { fullName: name } });
								toast.success("Name saved.");
							} catch (e) {
								toast.error(e instanceof Error ? e.message : "Could not save.");
							}
						},
						children: "Save"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-xl border border-border bg-card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Deriv partnership"
						}), me?.deriv_tagged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "green",
							children: "Tagged"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "muted",
							children: "Not tagged"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Link your CR so we can check the official partner tag. If the Deriv API keys are not on this host yet, use the SLT partner code from the community."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "cr",
							children: "CR number"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "cr",
							value: cr,
							onChange: (e) => setCr(e.target.value),
							placeholder: "CR123456"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pc",
							children: "Partner code"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pc",
							value: partner,
							onChange: (e) => setPartner(e.target.value),
							placeholder: "SLT-PARTNER"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						variant: "navy",
						onClick: async () => {
							try {
								const res = await linkDeriv({ data: {
									cr,
									partnerCode: partner
								} });
								setMe((m) => m ? {
									...m,
									deriv_tagged: res.tagged,
									deriv_cr: res.cr
								} : m);
								toast.success(res.tagged ? "Tagged. You can generate a member coupon." : "CR saved. Not tagged yet — ask the desk or use the partner code.");
							} catch (e) {
								toast.error(e instanceof Error ? e.message : "Could not link Deriv.");
							}
						},
						children: "Link Deriv"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-xl border border-border bg-card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Coupons"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Pre-launch tagged members get a free coupon. After public launch, tagged members pay $5. Enter a code you already have below."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-3 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "profit",
								onClick: async () => {
									try {
										const res = await generateMemberCoupon();
										if ("needsPayment" in res && res.needsPayment) {
											toast.message("Public launch is on. Pay $5 from checkout to get a coupon.");
											return;
										}
										toast.success(`Coupon ${res.code}`);
									} catch (e) {
										toast.error(e instanceof Error ? e.message : "Could not create a coupon.");
									}
								},
								children: "Generate member coupon"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: code,
								onChange: (e) => setCode(e.target.value),
								placeholder: "Redeem a code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: async () => {
									try {
										await redeemCoupon({ data: { code } });
										toast.success("Coupon attached to this account.");
									} catch (e) {
										toast.error(e instanceof Error ? e.message : "That coupon did not work.");
									}
								},
								children: "Redeem"
							})
						]
					})
				]
			}),
			me?.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/admin",
				className: "mt-6 inline-block text-sm text-primary underline",
				children: "Open the admin desk"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 border-t border-border pt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Your data"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: async () => {
							const dump = await exportMyData();
							const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
							const url = URL.createObjectURL(blob);
							const a = document.createElement("a");
							a.href = url;
							a.download = "slt-tradehub-data.json";
							a.click();
						},
						children: "Download my data"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "loss",
						onClick: async () => {
							if (!window.confirm("Delete this account and reading history?")) return;
							await deleteMyAccount();
							window.location.href = "/";
						},
						children: "Delete account"
					})]
				})]
			})
		]
	}) });
}
//#endregion
export { Account as component };

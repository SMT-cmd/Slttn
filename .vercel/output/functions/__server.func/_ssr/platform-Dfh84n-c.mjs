import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { c as getSupabaseAdmin, i as checkDerivClientTags, n as authMiddleware, o as getDb, r as canCheckDerivTags, t as DERIV_PROVIDER_ID } from "./middleware-CkTXLDiO.mjs";
import { n as SITE, t as PRICING } from "./site-Bh5vnfwv.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/platform-Dfh84n-c.js
function safeSize(size) {
	return size === "short" || size === "medium" || size === "full" ? size : "medium";
}
function safeLaunchMode(mode) {
	return mode === "launch" || mode === "public" ? "launch" : "prelaunch";
}
function defaultCoverFor(slug) {
	return "/brand/trading-library-powered.png";
}
function normalizeCatalogBook(row) {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		subtitle: row.subtitle ?? "",
		category: row.category,
		size: safeSize(row.size),
		launch_mode: safeLaunchMode(row.launch_mode),
		cover_url: row.cover_url || defaultCoverFor(row.slug),
		blurb: row.blurb ?? "",
		published: Boolean(row.published),
		sort_order: row.sort_order ?? 0,
		created_at: row.created_at,
		updated_at: row.updated_at
	};
}
function normalizeCatalogPage(row) {
	return {
		id: row.id,
		book_id: row.book_id,
		page_number: row.page_number,
		image_url: row.image_url,
		created_at: row.created_at
	};
}
function onlineCents(size) {
	return PRICING.online[size] * 100;
}
async function listCatalogBooks(includeUnpublished = false) {
	let query = getDb().from("books").select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
	if (!includeUnpublished) query = query.eq("published", true);
	const { data, error } = await query;
	if (error) throw new Error(error.message);
	return (data ?? []).map((row) => normalizeCatalogBook(row));
}
async function getCatalogBookBySlug(slug, includeUnpublished = false) {
	let query = getDb().from("books").select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at").eq("slug", slug).limit(1).maybeSingle();
	if (!includeUnpublished) query = query.eq("published", true);
	const { data, error } = await query;
	if (error) throw new Error(error.message);
	return data ? normalizeCatalogBook(data) : null;
}
async function getCatalogBookPages(bookId) {
	const { data, error } = await getDb().from("book_pages").select("id, book_id, page_number, image_url, created_at").eq("book_id", bookId).order("page_number", { ascending: true });
	if (error) throw new Error(error.message);
	return (data ?? []).map((row) => normalizeCatalogPage(row));
}
function readServerEnv(name) {
	const value = typeof process !== "undefined" ? process.env[name]?.trim() : void 0;
	if (!value) throw new Error(`${name} is not configured.`);
	return value;
}
function slugifySegment(value) {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function createSignedCloudinaryUpload(input) {
	if (typeof window !== "undefined") throw new Error("createSignedCloudinaryUpload() is server-only.");
	const cloudName = readServerEnv("CLOUDINARY_CLOUD_NAME");
	const apiKey = readServerEnv("CLOUDINARY_API_KEY");
	const apiSecret = readServerEnv("CLOUDINARY_API_SECRET");
	const safeSlug = slugifySegment(input.bookSlug);
	const safeFile = slugifySegment(input.fileName ?? `${input.kind}-${Date.now()}`);
	const folder = `slt-trade-hub/${input.kind === "cover" ? "covers" : "pages"}/${safeSlug}`;
	const publicId = `${safeSlug}-${safeFile}-${Date.now()}`;
	const tags = [
		`slt-trade-hub`,
		input.kind,
		safeSlug
	].join(",");
	const timestamp = Math.floor(Date.now() / 1e3);
	const payload = `folder=${folder}&public_id=${publicId}&tags=${tags}&timestamp=${timestamp}${apiSecret}`;
	return {
		apiKey,
		cloudName,
		folder,
		publicId,
		resourceType: "image",
		signature: createHash("sha1").update(payload).digest("hex"),
		tags,
		timestamp,
		uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
	};
}
var PREVIEW_PAGES = 3;
var DEFAULT_SETTINGS = {
	global_prelaunch: "true",
	partner_code: "SLT-PARTNER",
	support_email: SITE.email,
	telegram_url: SITE.telegram,
	whatsapp_url: SITE.whatsapp,
	community_links: JSON.stringify([{
		label: "Telegram",
		url: SITE.telegram
	}, {
		label: "WhatsApp",
		url: SITE.whatsapp
	}], null, 2)
};
function normalizeLaunchMode(mode) {
	if (mode === "launch" || mode === "public") return "launch";
	return "prelaunch";
}
function uiLaunchMode(mode) {
	return normalizeLaunchMode(mode) === "launch" ? "public" : "prelaunch";
}
function slugify(value) {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}
function randomCode(prefix) {
	return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
function requireNumber(value, fallback = 0) {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function normalizeProfile(record) {
	const tagged = Boolean(record.is_tagged ?? record.deriv_tagged);
	return {
		user_id: record.user_id,
		full_name: record.full_name,
		email: record.email,
		deriv_cr: record.deriv_cr,
		deriv_tagged: tagged,
		is_tagged: tagged,
		deriv_linked_at: record.deriv_linked_at,
		role: record.role ?? "member",
		banned: Boolean(record.banned),
		tos_accepted_at: record.tos_accepted_at,
		age_confirmed_at: record.age_confirmed_at,
		created_at: record.created_at
	};
}
function toPageRow(page) {
	return {
		id: page.id,
		book_id: page.book_id,
		page_number: page.page_number,
		image_url: page.image_url,
		created_at: page.created_at
	};
}
function toBookRow(book, pageCount = 0, pages) {
	return {
		id: book.id,
		slug: book.slug,
		title: book.title,
		subtitle: book.subtitle,
		author: SITE.author,
		category: book.category,
		description: book.blurb,
		cover_url: book.cover_url,
		series_no: String(book.sort_order + 1),
		size: book.size,
		launch_mode: uiLaunchMode(book.launch_mode),
		online_price_cents: onlineCents(book.size),
		download_prelaunch_cents: Math.round(PRICING.downloadPrelaunch * 100),
		download_public_cents: Math.round(PRICING.downloadPublic * 100),
		archived: !book.published,
		published: book.published,
		sort_order: book.sort_order,
		created_at: book.created_at,
		updated_at: book.updated_at,
		page_count: pageCount,
		pages: pages?.map((page) => toPageRow(page))
	};
}
function assertSupabase(result) {
	if (result.error) throw new Error(result.error.message);
	return result.data;
}
async function seedDefaultSettings(db) {
	const rows = assertSupabase(await db.from("site_settings").select("key, value"));
	const existing = new Set((rows ?? []).map((row) => row.key));
	const missing = Object.entries(DEFAULT_SETTINGS).filter(([key]) => !existing.has(key)).map(([key, value]) => ({
		key,
		value
	}));
	if (missing.length > 0) assertSupabase(await db.from("site_settings").upsert(missing, { onConflict: "key" }));
}
async function getSettingsMap(db) {
	await seedDefaultSettings(db);
	const rows = assertSupabase(await db.from("site_settings").select("key, value"));
	const map = { ...DEFAULT_SETTINGS };
	for (const row of rows ?? []) map[row.key] = row.value;
	return map;
}
async function getSetting(db, key, fallback = "") {
	return (await getSettingsMap(db))[key] ?? fallback;
}
async function hitRate(db, key, max, windowMs = 36e5) {
	const rows = assertSupabase(await db.from("rate_limits").select("key, hits, window_started_at").eq("key", key).limit(1));
	const now = Date.now();
	const current = rows?.[0];
	if (!current) {
		assertSupabase(await db.from("rate_limits").upsert({
			key,
			hits: 1,
			window_started_at: new Date(now).toISOString()
		}));
		return;
	}
	if (now - new Date(current.window_started_at).getTime() > windowMs) {
		assertSupabase(await db.from("rate_limits").update({
			hits: 1,
			window_started_at: new Date(now).toISOString()
		}).eq("key", key));
		return;
	}
	if (current.hits >= max) throw new Error("Please wait a little before trying that again.");
	assertSupabase(await db.from("rate_limits").update({ hits: current.hits + 1 }).eq("key", key));
}
async function getAuthUser(db, userId) {
	return assertSupabase(await db.from("user").select("id, name, email").eq("id", userId).limit(1))?.[0] ?? {
		id: userId,
		name: null,
		email: null
	};
}
async function syncDerivFromOAuth(db, profile) {
	const linked = assertSupabase(await db.from("account").select("providerId, accountId").eq("userId", profile.user_id).eq("providerId", DERIV_PROVIDER_ID).limit(1))?.[0];
	if (!linked) return normalizeProfile(profile);
	let tagged = Boolean(profile.is_tagged ?? profile.deriv_tagged);
	if (canCheckDerivTags()) try {
		tagged = (await checkDerivClientTags([linked.accountId])).get(linked.accountId) ?? false;
	} catch {
		tagged = Boolean(profile.is_tagged ?? profile.deriv_tagged);
	}
	if (profile.deriv_cr !== linked.accountId || profile.deriv_client_id !== linked.accountId || tagged !== Boolean(profile.is_tagged ?? profile.deriv_tagged)) return normalizeProfile(assertSupabase(await db.from("profiles").update({
		deriv_cr: linked.accountId,
		deriv_client_id: linked.accountId,
		deriv_linked_at: profile.deriv_linked_at ?? (/* @__PURE__ */ new Date()).toISOString(),
		deriv_tagged: tagged,
		is_tagged: tagged
	}).eq("user_id", profile.user_id).select("*").limit(1).single()));
	return normalizeProfile(profile);
}
async function ensureProfile(db, userId) {
	const authUser = await getAuthUser(db, userId);
	const existing = assertSupabase(await db.from("profiles").select("*").eq("user_id", userId).limit(1));
	if (existing?.[0]) {
		const current = existing[0];
		const updates = {};
		if (authUser.email && authUser.email !== current.email) updates.email = authUser.email;
		if (authUser.name && !current.full_name) updates.full_name = authUser.name;
		if (Object.keys(updates).length > 0) return syncDerivFromOAuth(db, assertSupabase(await db.from("profiles").update(updates).eq("user_id", userId).select("*").limit(1).single()));
		return syncDerivFromOAuth(db, current);
	}
	const admins = assertSupabase(await db.from("profiles").select("user_id").eq("role", "admin"));
	return syncDerivFromOAuth(db, assertSupabase(await db.from("profiles").insert({
		user_id: userId,
		full_name: authUser.name,
		email: authUser.email,
		role: (admins?.length ?? 0) === 0 ? "admin" : "member"
	}).select("*").limit(1).single()));
}
async function requireAdmin(db, userId) {
	const profile = await ensureProfile(db, userId);
	if (profile.role !== "admin") throw new Error("You need admin access for this page.");
	return profile;
}
async function loadBooksWithPages(includeUnpublished = false) {
	const books = await listCatalogBooks(includeUnpublished);
	return (await Promise.all(books.map(async (book) => {
		const pages = await getCatalogBookPages(book.id);
		return toBookRow(book, pages.length, pages);
	}))).sort((left, right) => left.sort_order - right.sort_order);
}
async function accessForBook(db, profile, book) {
	await refreshPendingPurchases(db, profile.user_id);
	if (profile.banned) return {
		canRead: false,
		canDownload: false,
		via: "none"
	};
	if (profile.role === "admin") return {
		canRead: true,
		canDownload: true,
		via: "admin"
	};
	if ((assertSupabase(await db.from("subscriptions").select("id, status, expires_at").eq("user_id", profile.user_id).eq("status", "active").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()))?.length ?? 0) > 0) return {
		canRead: true,
		canDownload: false,
		via: "subscription"
	};
	const purchases = assertSupabase(await db.from("purchases").select("id, kind, status, book_id").eq("user_id", profile.user_id).eq("status", "paid"));
	if ((purchases ?? []).some((purchase) => (purchase.kind === "download" || purchase.kind === "online") && (purchase.book_id === book.id || purchase.book_id === null))) return {
		canRead: true,
		canDownload: (purchases ?? []).some((purchase) => purchase.kind === "download" && (purchase.book_id === book.id || purchase.book_id === null)),
		via: "purchase"
	};
	const coupons = assertSupabase(await db.from("coupons").select("id, user_id, book_id, uses_remaining, expires_at").eq("user_id", profile.user_id).gt("uses_remaining", 0));
	const now = Date.now();
	if ((coupons ?? []).find((coupon) => {
		const expiresAt = coupon.expires_at ? new Date(coupon.expires_at).getTime() : null;
		return (expiresAt === null || expiresAt > now) && (coupon.book_id === null || coupon.book_id === book.id);
	})) return {
		canRead: true,
		canDownload: false,
		via: "coupon"
	};
	return {
		canRead: false,
		canDownload: false,
		via: "none"
	};
}
async function getPublicBook(slug) {
	const book = await getCatalogBookBySlug(slug);
	if (!book) return null;
	const pages = await getCatalogBookPages(book.id);
	return toBookRow(book, pages.length, pages);
}
function checkoutBaseUrl() {
	return process.env.BETTER_AUTH_URL?.trim() || SITE.url;
}
async function createStripeCheckout({ amount, description, email, metadata, purchaseId }) {
	const secret = process.env.STRIPE_SECRET_KEY?.trim();
	if (!secret) return null;
	const params = new URLSearchParams();
	params.set("mode", "payment");
	params.set("success_url", `${checkoutBaseUrl()}/account?purchase=${purchaseId}&status=success`);
	params.set("cancel_url", `${checkoutBaseUrl()}/checkout?status=cancelled`);
	params.set("customer_email", email);
	params.set("line_items[0][quantity]", "1");
	params.set("line_items[0][price_data][currency]", "usd");
	params.set("line_items[0][price_data][unit_amount]", String(amount));
	params.set("line_items[0][price_data][product_data][name]", description);
	Object.entries(metadata).forEach(([key, value]) => {
		params.set(`metadata[${key}]`, value);
	});
	const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secret}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: params.toString()
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || "Stripe checkout could not be initialized.");
	}
	return await response.json();
}
async function createPaystackCheckout({ amount, description, email, metadata }) {
	const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
	if (!secret) return null;
	const response = await fetch("https://api.paystack.co/transaction/initialize", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secret}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			email,
			amount,
			callback_url: `${checkoutBaseUrl()}/account?provider=paystack`,
			metadata: {
				...metadata,
				description
			}
		})
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || "Paystack checkout could not be initialized.");
	}
	const payload = await response.json();
	return {
		authorization_url: payload.data?.authorization_url ?? null,
		reference: payload.data?.reference ?? null
	};
}
async function verifyStripeCheckout(reference) {
	const secret = process.env.STRIPE_SECRET_KEY?.trim();
	if (!secret || !reference) return false;
	const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` } });
	if (!response.ok) return false;
	const payload = await response.json();
	return payload.status === "complete" || payload.payment_status === "paid";
}
async function verifyPaystackCheckout(reference) {
	const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
	if (!secret || !reference) return false;
	const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` } });
	if (!response.ok) return false;
	return (await response.json()).data?.status === "success";
}
async function ensureSubscriptionForPurchase(db, purchase) {
	if (purchase.kind !== "sub3" && purchase.kind !== "sub6" && purchase.kind !== "subscription") return;
	if (assertSupabase(await db.from("subscriptions").select("id").eq("user_id", purchase.user_id).eq("status", "active").order("expires_at", { ascending: false }).limit(1))?.[0]) return;
	const plan = purchase.kind === "sub6" ? "sub6" : "sub3";
	const days = plan === "sub6" ? 180 : 90;
	assertSupabase(await db.from("subscriptions").insert({
		user_id: purchase.user_id,
		plan,
		status: "active",
		expires_at: new Date(Date.now() + days * 864e5).toISOString()
	}));
}
async function refreshPendingPurchases(db, userId) {
	const pending = assertSupabase(await db.from("purchases").select("id, user_id, book_id, kind, amount_cents, provider, status, reference, gateway_url, created_at").eq("user_id", userId).eq("status", "pending").in("provider", ["stripe", "paystack"]).order("created_at", { ascending: false }).limit(20));
	for (const purchase of pending ?? []) {
		if (!purchase.reference) continue;
		if (!(purchase.provider === "stripe" ? await verifyStripeCheckout(purchase.reference) : await verifyPaystackCheckout(purchase.reference))) continue;
		assertSupabase(await db.from("purchases").update({ status: "paid" }).eq("id", purchase.id));
		await ensureSubscriptionForPurchase(db, purchase);
	}
}
var listBooks_createServerFn_handler = createServerRpc({
	id: "431adad02939f861c034d67637e7b2c3aaae4ef8fe82002a60f44254a28e679e",
	name: "listBooks",
	filename: "src/lib/server/platform.ts"
}, (opts) => listBooks.__executeServer(opts));
var listBooks = createServerFn({ method: "GET" }).handler(listBooks_createServerFn_handler, async () => {
	return loadBooksWithPages(false);
});
var getBook_createServerFn_handler = createServerRpc({
	id: "73586ac73c79080f2ae95cb9d1e9a67e6ec56c12bcf746c26bd642ace4b1a75d",
	name: "getBook",
	filename: "src/lib/server/platform.ts"
}, (opts) => getBook.__executeServer(opts));
var getBook = createServerFn({ method: "GET" }).validator(object({ slug: string() })).handler(getBook_createServerFn_handler, async ({ data }) => {
	return getPublicBook(data.slug);
});
var getMe_createServerFn_handler = createServerRpc({
	id: "fd1d6e62a1e273faf817d786c31ed5f141c550b282114593fe886b4ddc2631d8",
	name: "getMe",
	filename: "src/lib/server/platform.ts"
}, (opts) => getMe.__executeServer(opts));
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMe_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await refreshPendingPurchases(db, context.userId);
	return ensureProfile(db, context.userId);
});
var updateProfileName_createServerFn_handler = createServerRpc({
	id: "931fbaffd6198eaac0e89154b90c6dfa79d66cabd5cb75c82fd93dd8b07e022f",
	name: "updateProfileName",
	filename: "src/lib/server/platform.ts"
}, (opts) => updateProfileName.__executeServer(opts));
var updateProfileName = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ fullName: string().min(2).max(80) })).handler(updateProfileName_createServerFn_handler, async ({ context, data }) => {
	assertSupabase(await getSupabaseAdmin().from("profiles").update({ full_name: data.fullName.trim() }).eq("user_id", context.userId));
	return { ok: true };
});
var confirmAge_createServerFn_handler = createServerRpc({
	id: "5b165c3c83dcb09ee648b0c3072327046423041d862fc3ca5b1f7f7597d4d573",
	name: "confirmAge",
	filename: "src/lib/server/platform.ts"
}, (opts) => confirmAge.__executeServer(opts));
var confirmAge = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(confirmAge_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await ensureProfile(db, context.userId);
	assertSupabase(await db.from("profiles").update({ age_confirmed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", context.userId));
	return { ok: true };
});
var acceptTos_createServerFn_handler = createServerRpc({
	id: "ac84d119572a559a03f5c2c24fcd4706c00de30d8c621790fa0b36b7f59bb29b",
	name: "acceptTos",
	filename: "src/lib/server/platform.ts"
}, (opts) => acceptTos.__executeServer(opts));
var acceptTos = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(acceptTos_createServerFn_handler, async ({ context }) => {
	assertSupabase(await getSupabaseAdmin().from("profiles").update({ tos_accepted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", context.userId));
	return { ok: true };
});
var linkDeriv_createServerFn_handler = createServerRpc({
	id: "3fef606d0e87112a769b7c3a68684bdfd004ca30bc1d5e033159b61b7371e8ef",
	name: "linkDeriv",
	filename: "src/lib/server/platform.ts"
}, (opts) => linkDeriv.__executeServer(opts));
var linkDeriv = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	cr: string().min(2).max(64),
	partnerCode: string().max(80).optional()
})).handler(linkDeriv_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await hitRate(db, `deriv:${context.userId}`, 8);
	if ((await ensureProfile(db, context.userId)).banned) throw new Error("This account has been suspended.");
	const identifier = data.cr.trim().toUpperCase();
	let tagged = false;
	if (canCheckDerivTags()) try {
		tagged = (await checkDerivClientTags([identifier])).get(identifier) ?? false;
	} catch {
		tagged = false;
	}
	if (!tagged) {
		const expected = (await getSetting(db, "partner_code", "SLT-PARTNER")).trim().toUpperCase();
		tagged = expected.length > 0 && expected === (data.partnerCode ?? "").trim().toUpperCase();
	}
	const updated = assertSupabase(await db.from("profiles").update({
		deriv_cr: identifier,
		deriv_client_id: identifier,
		deriv_tagged: tagged,
		is_tagged: tagged,
		deriv_linked_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("user_id", context.userId).select("*").limit(1).single());
	return {
		tagged,
		cr: updated.deriv_cr ?? identifier
	};
});
var generateMemberCoupon_createServerFn_handler = createServerRpc({
	id: "d18154b9192d9cd5105ef25c6a2c56ba14caf7b5aeb3bb017d0ab91e95f4530e",
	name: "generateMemberCoupon",
	filename: "src/lib/server/platform.ts"
}, (opts) => generateMemberCoupon.__executeServer(opts));
var generateMemberCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(generateMemberCoupon_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await hitRate(db, `coupon:${context.userId}`, 6);
	const profile = await ensureProfile(db, context.userId);
	if (profile.banned) throw new Error("This account has been suspended.");
	if (!profile.deriv_tagged) throw new Error("Member coupons are for tagged SLT partnership accounts. Link a tagged Deriv account first.");
	const existing = assertSupabase(await db.from("coupons").select("id, code, user_id, book_id, kind, uses_remaining, paid_cents, created_at, expires_at").eq("user_id", context.userId).gt("uses_remaining", 0).in("kind", ["tagged_free", "tagged_paid"]).order("created_at", { ascending: false }).limit(1));
	if (existing?.[0]) return {
		code: existing[0].code,
		created: false
	};
	const globalPre = await getSetting(db, "global_prelaunch", "true") === "true";
	if (!globalPre) {
		if (!assertSupabase(await db.from("purchases").select("id").eq("user_id", context.userId).eq("kind", "coupon5").eq("status", "paid").limit(1))?.[0]) return {
			needsPayment: true,
			amount: PRICING.taggedCouponPublic
		};
	}
	const code = randomCode("SLT");
	assertSupabase(await db.from("coupons").insert({
		code,
		user_id: context.userId,
		kind: globalPre ? "tagged_free" : "tagged_paid",
		paid_cents: globalPre ? 0 : Math.round(PRICING.taggedCouponPublic * 100),
		uses_remaining: 40
	}));
	return {
		code,
		created: true
	};
});
var redeemCoupon_createServerFn_handler = createServerRpc({
	id: "c775325625dca866a254cdbaf435819668583ab4d8859d88d82b07f63af40dda",
	name: "redeemCoupon",
	filename: "src/lib/server/platform.ts"
}, (opts) => redeemCoupon.__executeServer(opts));
var redeemCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string().min(3).max(32) })).handler(redeemCoupon_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await hitRate(db, `redeem:${context.userId}`, 10);
	const found = assertSupabase(await db.from("coupons").select("id, code, user_id, book_id, kind, uses_remaining, paid_cents, created_at, expires_at").eq("code", data.code.trim().toUpperCase()).limit(1))?.[0];
	if (!found || requireNumber(found.uses_remaining) <= 0) throw new Error("That coupon is not valid, or it has already been used.");
	if (found.user_id && found.user_id !== context.userId) throw new Error("That coupon is already attached to another account.");
	assertSupabase(await db.from("coupons").update({ user_id: context.userId }).eq("id", found.id));
	return { ok: true };
});
var startCheckout_createServerFn_handler = createServerRpc({
	id: "245401eb6c064a28621e7b695633b5a8be104584b21c9871c0dd6f09776ab607",
	name: "startCheckout",
	filename: "src/lib/server/platform.ts"
}, (opts) => startCheckout.__executeServer(opts));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	bookSlug: string().optional(),
	kind: _enum([
		"online",
		"download",
		"coupon5",
		"sub3",
		"sub6"
	]),
	provider: _enum(["stripe", "paystack"])
})).handler(startCheckout_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	const profile = await ensureProfile(db, context.userId);
	if (profile.banned) throw new Error("This account has been suspended.");
	let amount = 0;
	let book = null;
	let purchaseKind = data.kind;
	if (data.kind === "coupon5") amount = Math.round(PRICING.taggedCouponPublic * 100);
	else if (data.kind === "sub3") amount = Math.round(PRICING.subQuarterly * 100);
	else if (data.kind === "sub6") amount = Math.round(PRICING.subBiannual * 100);
	else {
		if (!data.bookSlug) throw new Error("Choose a book first.");
		book = await getPublicBook(data.bookSlug);
		if (!book) throw new Error("We could not find that book.");
		amount = data.kind === "download" ? book.launch_mode !== "prelaunch" ? book.download_public_cents : book.download_prelaunch_cents : book.online_price_cents;
	}
	const inserted = assertSupabase(await db.from("purchases").insert({
		user_id: context.userId,
		book_id: book?.id ?? null,
		kind: purchaseKind,
		amount_cents: amount,
		provider: data.provider,
		status: profile.role === "admin" ? "paid" : "pending"
	}).select("id, user_id, book_id, kind, amount_cents, provider, status, reference, gateway_url, created_at").limit(1).single());
	if (profile.role === "admin") {
		if (purchaseKind === "sub3" || purchaseKind === "sub6") {
			const days = purchaseKind === "sub6" ? 180 : 90;
			assertSupabase(await db.from("subscriptions").insert({
				user_id: context.userId,
				plan: purchaseKind,
				status: "active",
				expires_at: new Date(Date.now() + days * 864e5).toISOString()
			}));
		}
		return {
			status: "granted",
			message: "Access granted for this desk copy."
		};
	}
	const metadata = {
		purchase_id: inserted.id,
		user_id: context.userId,
		kind: purchaseKind,
		book_slug: book?.slug ?? ""
	};
	const email = profile.email ?? (await getAuthUser(db, context.userId)).email ?? "";
	if (!email) throw new Error("Add an email address to your account before starting payment checkout.");
	const description = data.kind === "sub3" || data.kind === "sub6" ? data.kind === "sub6" ? "SLT Trade Hub · 6-Month Library Access" : "SLT Trade Hub · 3-Month Library Access" : purchaseKind === "coupon5" ? "SLT Trade Hub · Tagged Coupon" : `${book?.title ?? "Book"} · ${purchaseKind === "download" ? "Download" : "Online access"}`;
	if (data.provider === "stripe") {
		const session = await createStripeCheckout({
			amount,
			description,
			email,
			metadata,
			purchaseId: inserted.id
		});
		if (session?.url) {
			assertSupabase(await db.from("purchases").update({
				reference: session.id,
				gateway_url: session.url
			}).eq("id", inserted.id));
			return {
				status: "redirect",
				url: session.url,
				message: "Stripe checkout is ready."
			};
		}
	}
	if (data.provider === "paystack") {
		const session = await createPaystackCheckout({
			amount,
			description,
			email,
			metadata
		});
		if (session?.authorization_url) {
			assertSupabase(await db.from("purchases").update({
				reference: session.reference,
				gateway_url: session.authorization_url
			}).eq("id", inserted.id));
			return {
				status: "redirect",
				url: session.authorization_url,
				message: "Paystack checkout is ready."
			};
		}
	}
	return {
		status: "offline",
		amount,
		message: "Payment keys are not configured yet. The purchase intent has been recorded, but checkout is offline until Stripe and Paystack secrets are added."
	};
});
var readerPayload_createServerFn_handler = createServerRpc({
	id: "fc2533132ae950be65c04fca33089b9e44e4abc7f88f33bb402dc42ae19c3270",
	name: "readerPayload",
	filename: "src/lib/server/platform.ts"
}, (opts) => readerPayload.__executeServer(opts));
var readerPayload = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ slug: string() })).handler(readerPayload_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	const profile = await ensureProfile(db, context.userId);
	if (profile.banned) throw new Error("This account has been suspended.");
	const book = await getPublicBook(data.slug);
	if (!book) throw new Error("That book is not in the library.");
	const pages = book.pages ?? [];
	const access = await accessForBook(db, profile, book);
	return {
		book,
		profile,
		access,
		watermark: `${profile.full_name || profile.email || "Reader"} · ${profile.deriv_cr || profile.email || context.userId}`,
		pages: access.canRead ? pages : pages.slice(0, PREVIEW_PAGES),
		lockedFrom: access.canRead ? null : Math.min(PREVIEW_PAGES, pages.length),
		totalPages: pages.length
	};
});
var logPage_createServerFn_handler = createServerRpc({
	id: "87e61a00e51e9c6e5879f9116cc0a16f5719a488a636508cbbb35eb8acd4d0c6",
	name: "logPage",
	filename: "src/lib/server/platform.ts"
}, (opts) => logPage.__executeServer(opts));
var logPage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	slug: string(),
	pageIndex: number().int().min(0)
})).handler(logPage_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	const book = await getPublicBook(data.slug);
	if (!book) return { ok: false };
	assertSupabase(await db.from("reading_logs").insert({
		user_id: context.userId,
		book_id: book.id,
		page_index: data.pageIndex
	}));
	return { ok: true };
});
var myLibrary_createServerFn_handler = createServerRpc({
	id: "7c3905a63665241dbf6619880dab43013fd8100470b4334a53ce324f03bd5c94",
	name: "myLibrary",
	filename: "src/lib/server/platform.ts"
}, (opts) => myLibrary.__executeServer(opts));
var myLibrary = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(myLibrary_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await refreshPendingPurchases(db, context.userId);
	return {
		profile: await ensureProfile(db, context.userId),
		coupons: assertSupabase(await db.from("coupons").select("code, kind, uses_remaining, created_at").eq("user_id", context.userId).order("created_at", { ascending: false })),
		purchases: assertSupabase(await db.from("purchases").select("kind, amount_cents, created_at, book_id").eq("user_id", context.userId).order("created_at", { ascending: false }))
	};
});
var deleteMyAccount_createServerFn_handler = createServerRpc({
	id: "7a827671e42db560e9c6f02abafc536bd540aaf406705c3d575904efbff74913",
	name: "deleteMyAccount",
	filename: "src/lib/server/platform.ts"
}, (opts) => deleteMyAccount.__executeServer(opts));
var deleteMyAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(deleteMyAccount_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	assertSupabase(await db.from("reading_logs").delete().eq("user_id", context.userId));
	assertSupabase(await db.from("purchases").delete().eq("user_id", context.userId));
	assertSupabase(await db.from("coupons").delete().eq("user_id", context.userId));
	assertSupabase(await db.from("subscriptions").delete().eq("user_id", context.userId));
	assertSupabase(await db.from("profiles").delete().eq("user_id", context.userId));
	return { ok: true };
});
var exportMyData_createServerFn_handler = createServerRpc({
	id: "22e9214950effb7f61d1e7d59b6613320d4ab9b8b3287a00c68bcd4dc3ce87bc",
	name: "exportMyData",
	filename: "src/lib/server/platform.ts"
}, (opts) => exportMyData.__executeServer(opts));
var exportMyData = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(exportMyData_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	return {
		profile: await ensureProfile(db, context.userId),
		purchases: assertSupabase(await db.from("purchases").select("id, kind, amount_cents, provider, status, created_at").eq("user_id", context.userId).order("created_at", { ascending: false })),
		coupons: assertSupabase(await db.from("coupons").select("code, kind, uses_remaining, created_at").eq("user_id", context.userId).order("created_at", { ascending: false }))
	};
});
var adminOverview_createServerFn_handler = createServerRpc({
	id: "fbb2973f7518273fbca810f2df82887d1ce40bbce31b33f413334bccfaaaa7f1",
	name: "adminOverview",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminOverview.__executeServer(opts));
var adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminOverview_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	const users = assertSupabase(await db.from("profiles").select("user_id"));
	const tagged = assertSupabase(await db.from("profiles").select("user_id").or("deriv_tagged.eq.true,is_tagged.eq.true"));
	const paidRows = assertSupabase(await db.from("purchases").select("amount_cents").eq("status", "paid"));
	const books = assertSupabase(await db.from("books").select("id").eq("published", true));
	return {
		users: users?.length ?? 0,
		tagged: tagged?.length ?? 0,
		salesCount: paidRows?.length ?? 0,
		salesCents: (paidRows ?? []).reduce((sum, row) => sum + requireNumber(row.amount_cents), 0),
		books: books?.length ?? 0,
		settings: await getSettingsMap(db)
	};
});
var adminUsers_createServerFn_handler = createServerRpc({
	id: "404b6fc97be7a0f2f48392c73e39e9f383c9101af64e6edd7692620966cf8711",
	name: "adminUsers",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminUsers.__executeServer(opts));
var adminUsers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminUsers_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	return (assertSupabase(await db.from("profiles").select("*").order("created_at", { ascending: false })) ?? []).map((row) => normalizeProfile(row));
});
var adminSetBan_createServerFn_handler = createServerRpc({
	id: "cb01c1f2f5caadc2abac63d08c77e51a26b82b065e61ccfaefd2cd71e8fc1410",
	name: "adminSetBan",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminSetBan.__executeServer(opts));
var adminSetBan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	banned: boolean()
})).handler(adminSetBan_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	assertSupabase(await db.from("profiles").update({ banned: data.banned }).eq("user_id", data.userId));
	return { ok: true };
});
var adminSetTagged_createServerFn_handler = createServerRpc({
	id: "485595352bf67270fa93735d59b828f8dd4f18c120724ad1db4cdca5493b74ec",
	name: "adminSetTagged",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminSetTagged.__executeServer(opts));
var adminSetTagged = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	tagged: boolean()
})).handler(adminSetTagged_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	assertSupabase(await db.from("profiles").update({
		deriv_tagged: data.tagged,
		is_tagged: data.tagged
	}).eq("user_id", data.userId));
	return { ok: true };
});
var adminBooks_createServerFn_handler = createServerRpc({
	id: "a0f275ec79df219f892e3b16bdd14df13f585c9c26c346cb9a28c0038b19437c",
	name: "adminBooks",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminBooks.__executeServer(opts));
var adminBooks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminBooks_createServerFn_handler, async ({ context }) => {
	await requireAdmin(getSupabaseAdmin(), context.userId);
	return loadBooksWithPages(true);
});
var adminCreateBook_createServerFn_handler = createServerRpc({
	id: "c863ffe5b334437e9fdd831f2c9b449ebed26df1784aa6e149b1c224045e370b",
	name: "adminCreateBook",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminCreateBook.__executeServer(opts));
var adminCreateBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	title: string().min(2).max(160),
	subtitle: string().max(160).default(""),
	slug: string().max(160).optional(),
	category: string().min(2).max(80),
	size: _enum([
		"short",
		"medium",
		"full"
	]).default("medium"),
	launch_mode: _enum([
		"prelaunch",
		"launch",
		"public"
	]).default("prelaunch"),
	blurb: string().max(5e3).default(""),
	published: boolean().default(true)
})).handler(adminCreateBook_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	const sortRows = assertSupabase(await db.from("books").select("sort_order").order("sort_order", { ascending: false }).limit(1));
	return toBookRow(assertSupabase(await db.from("books").insert({
		slug: slugify(data.slug || data.title),
		title: data.title.trim(),
		subtitle: data.subtitle.trim(),
		category: data.category.trim(),
		size: data.size,
		launch_mode: normalizeLaunchMode(data.launch_mode),
		cover_url: "/brand/trading-library-powered.png",
		blurb: data.blurb.trim(),
		published: data.published,
		sort_order: requireNumber(sortRows?.[0]?.sort_order) + 1
	}).select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at").limit(1).single()), 0, []);
});
var adminUpdateBook_createServerFn_handler = createServerRpc({
	id: "bdef7d8b5aa00ee5ca532368415f4f515079abcc8f2541d3a977d00ef2c5e809",
	name: "adminUpdateBook",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminUpdateBook.__executeServer(opts));
var adminUpdateBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	title: string().max(160).optional(),
	subtitle: string().max(160).optional(),
	slug: string().max(160).optional(),
	blurb: string().max(5e3).optional(),
	description: string().max(5e3).optional(),
	category: string().max(80).optional(),
	size: _enum([
		"short",
		"medium",
		"full"
	]).optional(),
	launch_mode: _enum([
		"prelaunch",
		"launch",
		"public"
	]).optional(),
	published: boolean().optional(),
	sort_order: number().int().min(0).optional(),
	cover_url: string().url().optional(),
	archived: boolean().optional()
})).handler(adminUpdateBook_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	const updates = {};
	if (data.title !== void 0) updates.title = data.title.trim();
	if (data.subtitle !== void 0) updates.subtitle = data.subtitle.trim();
	if (data.slug !== void 0) updates.slug = slugify(data.slug);
	if (data.blurb !== void 0 || data.description !== void 0) updates.blurb = (data.blurb ?? data.description ?? "").trim();
	if (data.category !== void 0) updates.category = data.category.trim();
	if (data.size !== void 0) updates.size = data.size;
	if (data.launch_mode !== void 0) updates.launch_mode = normalizeLaunchMode(data.launch_mode);
	if (data.published !== void 0) updates.published = data.published;
	if (data.archived !== void 0) updates.published = !data.archived;
	if (data.sort_order !== void 0) updates.sort_order = data.sort_order;
	if (data.cover_url !== void 0) updates.cover_url = data.cover_url;
	const updated = assertSupabase(await db.from("books").update(updates).eq("id", data.id).select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at").limit(1).single());
	const pages = await getCatalogBookPages(updated.id);
	return toBookRow(updated, pages.length, pages);
});
var adminDeleteBook_createServerFn_handler = createServerRpc({
	id: "bfb90ca6aae4fea3353da6eede48d85b3254f6f9c83e2c1866d2efa5d8629727",
	name: "adminDeleteBook",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminDeleteBook.__executeServer(opts));
var adminDeleteBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(adminDeleteBook_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	assertSupabase(await db.from("book_pages").delete().eq("book_id", data.id));
	assertSupabase(await db.from("books").delete().eq("id", data.id));
	return { ok: true };
});
var adminSignCloudinaryUpload_createServerFn_handler = createServerRpc({
	id: "43c54d2e6552c10a90169e779940861f182097dcfce2aed36e525a5679e3e60e",
	name: "adminSignCloudinaryUpload",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminSignCloudinaryUpload.__executeServer(opts));
var adminSignCloudinaryUpload = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	kind: _enum(["cover", "page"]),
	bookSlug: string().min(1),
	fileName: string().optional()
})).handler(adminSignCloudinaryUpload_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(getSupabaseAdmin(), context.userId);
	return createSignedCloudinaryUpload(data);
});
var adminSaveBookCover_createServerFn_handler = createServerRpc({
	id: "32ab9119064bda4fcb4847571245ecc5e77b86e7bdb74b97c43df4ab62e85097",
	name: "adminSaveBookCover",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminSaveBookCover.__executeServer(opts));
var adminSaveBookCover = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	coverUrl: string().url()
})).handler(adminSaveBookCover_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	assertSupabase(await db.from("books").update({ cover_url: data.coverUrl }).eq("id", data.id));
	return { ok: true };
});
var adminCreateBookPages_createServerFn_handler = createServerRpc({
	id: "f3501b4c7cf3a88a6e3430c02b5baed3fb03f8dc1f6b0b104a95add35cd7fc18",
	name: "adminCreateBookPages",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminCreateBookPages.__executeServer(opts));
var adminCreateBookPages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	bookId: string(),
	imageUrls: array(string().url()).min(1)
})).handler(adminCreateBookPages_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	let nextNumber = requireNumber(assertSupabase(await db.from("book_pages").select("id, book_id, page_number, image_url, created_at").eq("book_id", data.bookId).order("page_number", { ascending: false }).limit(1))?.[0]?.page_number, 0) + 1;
	const inserts = data.imageUrls.map((imageUrl) => ({
		book_id: data.bookId,
		page_number: nextNumber++,
		image_url: imageUrl
	}));
	assertSupabase(await db.from("book_pages").insert(inserts));
	return getCatalogBookPages(data.bookId);
});
var adminDeleteBookPage_createServerFn_handler = createServerRpc({
	id: "1f36f9c475d9786bd94c597ac66218fe6af4e44ea96ac73d947f52b9450d1434",
	name: "adminDeleteBookPage",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminDeleteBookPage.__executeServer(opts));
var adminDeleteBookPage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	pageId: string(),
	bookId: string()
})).handler(adminDeleteBookPage_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	assertSupabase(await db.from("book_pages").delete().eq("id", data.pageId));
	const pages = await getCatalogBookPages(data.bookId);
	await Promise.all(pages.map(async (page, index) => assertSupabase(await db.from("book_pages").update({ page_number: index + 1 }).eq("id", page.id))));
	return getCatalogBookPages(data.bookId);
});
var adminReorderBookPages_createServerFn_handler = createServerRpc({
	id: "df967009e3e1b1d934bc0b95d1e44d3c87bf8439bcd6a803e9305bfce69a0663",
	name: "adminReorderBookPages",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminReorderBookPages.__executeServer(opts));
var adminReorderBookPages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	bookId: string(),
	pageIds: array(string()).min(1)
})).handler(adminReorderBookPages_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	await Promise.all(data.pageIds.map(async (pageId, index) => assertSupabase(await db.from("book_pages").update({ page_number: index + 1 }).eq("id", pageId).eq("book_id", data.bookId))));
	return getCatalogBookPages(data.bookId);
});
var adminCreateCoupon_createServerFn_handler = createServerRpc({
	id: "176472fc9de20cc9e6ba85c59961d999537c9877f6462b278651c9db9cde34c1",
	name: "adminCreateCoupon",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminCreateCoupon.__executeServer(opts));
var adminCreateCoupon = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	code: string().min(4).max(20),
	uses: number().int().min(1).max(500),
	bookId: string().optional()
})).handler(adminCreateCoupon_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	const code = data.code.trim().toUpperCase();
	assertSupabase(await db.from("coupons").insert({
		code,
		kind: "promo",
		uses_remaining: data.uses,
		book_id: data.bookId ?? null
	}));
	return {
		ok: true,
		code
	};
});
var adminCoupons_createServerFn_handler = createServerRpc({
	id: "0d23e03059175d54501826d235dae1507f777acfe757ff62fab824ddb4e4df2c",
	name: "adminCoupons",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminCoupons.__executeServer(opts));
var adminCoupons = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminCoupons_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	return assertSupabase(await db.from("coupons").select("id, code, user_id, book_id, kind, uses_remaining, paid_cents, created_at, expires_at").order("created_at", { ascending: false }));
});
var adminSales_createServerFn_handler = createServerRpc({
	id: "04e5639db739b0839cfebd67de896a0d2fe694e2ebcefb1c2072bc050ddd3700",
	name: "adminSales",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminSales.__executeServer(opts));
var adminSales = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminSales_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	return assertSupabase(await db.from("purchases").select("id, user_id, book_id, kind, amount_cents, provider, status, reference, gateway_url, created_at").order("created_at", { ascending: false }));
});
var adminLogs_createServerFn_handler = createServerRpc({
	id: "035e846639f5cc827b39f0318f6007ce3803368cda37522808c9cebd04661413",
	name: "adminLogs",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminLogs.__executeServer(opts));
var adminLogs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminLogs_createServerFn_handler, async ({ context }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	return assertSupabase(await db.from("reading_logs").select("user_id, book_id, page_index, created_at").order("created_at", { ascending: false }).limit(200));
});
var publicSettings_createServerFn_handler = createServerRpc({
	id: "9de6774a931d71f0fafcfda4e6a53d03b0ea05f7e6632f125e5c2174f7c9b913",
	name: "publicSettings",
	filename: "src/lib/server/platform.ts"
}, (opts) => publicSettings.__executeServer(opts));
var publicSettings = createServerFn({ method: "GET" }).handler(publicSettings_createServerFn_handler, async () => {
	return getSettingsMap(getSupabaseAdmin());
});
var adminSaveSetting_createServerFn_handler = createServerRpc({
	id: "7788db9edffbaa146725cc19bacf940f5b5f11fb617fa862649667ac5b61092a",
	name: "adminSaveSetting",
	filename: "src/lib/server/platform.ts"
}, (opts) => adminSaveSetting.__executeServer(opts));
var adminSaveSetting = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	key: string(),
	value: string()
})).handler(adminSaveSetting_createServerFn_handler, async ({ context, data }) => {
	const db = getSupabaseAdmin();
	await requireAdmin(db, context.userId);
	assertSupabase(await db.from("site_settings").upsert({
		key: data.key,
		value: data.value
	}, { onConflict: "key" }));
	return { ok: true };
});
//#endregion
export { acceptTos_createServerFn_handler, adminBooks_createServerFn_handler, adminCoupons_createServerFn_handler, adminCreateBookPages_createServerFn_handler, adminCreateBook_createServerFn_handler, adminCreateCoupon_createServerFn_handler, adminDeleteBookPage_createServerFn_handler, adminDeleteBook_createServerFn_handler, adminLogs_createServerFn_handler, adminOverview_createServerFn_handler, adminReorderBookPages_createServerFn_handler, adminSales_createServerFn_handler, adminSaveBookCover_createServerFn_handler, adminSaveSetting_createServerFn_handler, adminSetBan_createServerFn_handler, adminSetTagged_createServerFn_handler, adminSignCloudinaryUpload_createServerFn_handler, adminUpdateBook_createServerFn_handler, adminUsers_createServerFn_handler, confirmAge_createServerFn_handler, deleteMyAccount_createServerFn_handler, exportMyData_createServerFn_handler, generateMemberCoupon_createServerFn_handler, getBook_createServerFn_handler, getMe_createServerFn_handler, linkDeriv_createServerFn_handler, listBooks_createServerFn_handler, logPage_createServerFn_handler, myLibrary_createServerFn_handler, publicSettings_createServerFn_handler, readerPayload_createServerFn_handler, redeemCoupon_createServerFn_handler, startCheckout_createServerFn_handler, updateProfileName_createServerFn_handler };

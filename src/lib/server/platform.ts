import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  getCatalogBookBySlug,
  getCatalogBookPages,
  listCatalogBooks,
  onlineCents,
  type CatalogBook,
  type CatalogPage,
} from "@/lib/catalog";
import { createSignedCloudinaryUpload } from "@/lib/cloudinary";
import {
  DERIV_PROVIDER_ID,
  canCheckDerivTags,
  checkDerivClientTags,
} from "@/lib/deriv";
import { PRICING, SITE } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase";

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;
type LaunchModeValue = "prelaunch" | "public" | "launch";

type AuthUserRow = {
  id: string;
  name: string | null;
  email: string | null;
};

type ProfileRecord = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  deriv_cr: string | null;
  deriv_client_id: string | null;
  deriv_tagged: boolean | null;
  is_tagged: boolean | null;
  deriv_linked_at: string | null;
  role: string | null;
  banned: boolean | null;
  tos_accepted_at: string | null;
  age_confirmed_at: string | null;
  created_at: string | null;
};

type AccountRecord = {
  providerId: string;
  accountId: string;
};

type SettingRecord = {
  key: string;
  value: string;
};

type CouponRecord = {
  id: string;
  code: string;
  user_id: string | null;
  book_id: string | null;
  kind: string;
  uses_remaining: number | null;
  paid_cents: number | null;
  created_at: string;
  expires_at: string | null;
};

type PurchaseRecord = {
  id: string;
  user_id: string;
  book_id: string | null;
  kind: string;
  amount_cents: number;
  provider: string;
  status: string;
  reference: string | null;
  gateway_url: string | null;
  created_at: string;
};

type SubscriptionRecord = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  expires_at: string;
};

type ReadingLogRecord = {
  user_id: string;
  book_id: string;
  page_index: number;
  created_at: string;
};

export type Profile = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  deriv_cr: string | null;
  deriv_tagged: boolean;
  is_tagged: boolean;
  deriv_linked_at: string | null;
  role: string;
  banned: boolean;
  tos_accepted_at: string | null;
  age_confirmed_at: string | null;
  created_at: string | null;
};

export type BookPageRow = {
  id: string;
  book_id: string;
  page_number: number;
  image_url: string;
  created_at: string;
};

export type BookRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  description: string;
  cover_url: string;
  series_no: string;
  size: string;
  launch_mode: LaunchModeValue;
  online_price_cents: number;
  download_prelaunch_cents: number;
  download_public_cents: number;
  archived: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  page_count: number;
  pages?: BookPageRow[];
};

const PREVIEW_PAGES = 3;
const DEFAULT_SETTINGS: Record<string, string> = {
  global_prelaunch: "true",
  partner_code: "SLT-PARTNER",
  support_email: SITE.email,
  telegram_url: SITE.telegram,
  whatsapp_url: SITE.whatsapp,
  community_links: JSON.stringify(
    [
      { label: "Telegram", url: SITE.telegram },
      { label: "WhatsApp", url: SITE.whatsapp },
    ],
    null,
    2,
  ),
};

function normalizeLaunchMode(mode: string | null | undefined): LaunchModeValue {
  if (mode === "launch") return "launch";
  if (mode === "public") return "public";
  return "prelaunch";
}

function uiLaunchMode(mode: string | null | undefined): LaunchModeValue {
  const normalized = normalizeLaunchMode(mode);
  return normalized === "launch" ? "public" : normalized;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function randomCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function requireString(value: string | null | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function requireNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeProfile(record: ProfileRecord): Profile {
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
    created_at: record.created_at,
  };
}

function toPageRow(page: CatalogPage): BookPageRow {
  return {
    id: page.id,
    book_id: page.book_id,
    page_number: page.page_number,
    image_url: page.image_url,
    created_at: page.created_at,
  };
}

function toBookRow(book: CatalogBook, pageCount = 0, pages?: CatalogPage[]): BookRow {
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
    pages: pages?.map((page) => toPageRow(page)),
  };
}

function assertSupabase<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

async function seedDefaultSettings(db: SupabaseAdmin) {
  const rows = assertSupabase(
    await db.from("site_settings").select("key, value"),
  ) as SettingRecord[] | null;
  const existing = new Set((rows ?? []).map((row) => row.key));
  const missing = Object.entries(DEFAULT_SETTINGS)
    .filter(([key]) => !existing.has(key))
    .map(([key, value]) => ({ key, value }));
  if (missing.length > 0) {
    assertSupabase(
      await db.from("site_settings").upsert(missing, { onConflict: "key" }),
    );
  }
}

async function getSettingsMap(db: SupabaseAdmin) {
  await seedDefaultSettings(db);
  const rows = assertSupabase(
    await db.from("site_settings").select("key, value"),
  ) as SettingRecord[] | null;
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows ?? []) {
    map[row.key] = row.value;
  }
  return map;
}

async function getSetting(db: SupabaseAdmin, key: string, fallback = "") {
  const settings = await getSettingsMap(db);
  return settings[key] ?? fallback;
}

async function hitRate(db: SupabaseAdmin, key: string, max: number, windowMs = 60 * 60 * 1000) {
  const rows = assertSupabase(
    await db
      .from("rate_limits")
      .select("key, hits, window_started_at")
      .eq("key", key)
      .limit(1),
  ) as Array<{ key: string; hits: number; window_started_at: string }> | null;
  const now = Date.now();
  const current = rows?.[0];
  if (!current) {
    assertSupabase(
      await db.from("rate_limits").upsert({
        key,
        hits: 1,
        window_started_at: new Date(now).toISOString(),
      }),
    );
    return;
  }
  const started = new Date(current.window_started_at).getTime();
  if (now - started > windowMs) {
    assertSupabase(
      await db
        .from("rate_limits")
        .update({ hits: 1, window_started_at: new Date(now).toISOString() })
        .eq("key", key),
    );
    return;
  }
  if (current.hits >= max) {
    throw new Error("Please wait a little before trying that again.");
  }
  assertSupabase(
    await db
      .from("rate_limits")
      .update({ hits: current.hits + 1 })
      .eq("key", key),
  );
}

async function getAuthUser(db: SupabaseAdmin, userId: string) {
  const rows = assertSupabase(
    await db.from("user").select("id, name, email").eq("id", userId).limit(1),
  ) as AuthUserRow[] | null;
  return rows?.[0] ?? { id: userId, name: null, email: null };
}

async function syncDerivFromOAuth(db: SupabaseAdmin, profile: ProfileRecord) {
  const linkedAccounts = assertSupabase(
    await db
      .from("account")
      .select("providerId, accountId")
      .eq("userId", profile.user_id)
      .eq("providerId", DERIV_PROVIDER_ID)
      .limit(1),
  ) as AccountRecord[] | null;
  const linked = linkedAccounts?.[0];
  if (!linked) return normalizeProfile(profile);

  let tagged = Boolean(profile.is_tagged ?? profile.deriv_tagged);
  if (canCheckDerivTags()) {
    try {
      const result = await checkDerivClientTags([linked.accountId]);
      tagged = result.get(linked.accountId) ?? false;
    } catch {
      tagged = Boolean(profile.is_tagged ?? profile.deriv_tagged);
    }
  }

  if (
    profile.deriv_client_id !== linked.accountId ||
    tagged !== Boolean(profile.is_tagged ?? profile.deriv_tagged)
  ) {
    const updated = assertSupabase(
      await db
        .from("profiles")
        .update({
          deriv_client_id: linked.accountId,
          deriv_linked_at: profile.deriv_linked_at ?? new Date().toISOString(),
          deriv_tagged: tagged,
          is_tagged: tagged,
        })
        .eq("user_id", profile.user_id)
        .select("*")
        .limit(1)
        .single(),
    ) as ProfileRecord;
    return normalizeProfile(updated);
  }

  return normalizeProfile(profile);
}

async function ensureProfile(db: SupabaseAdmin, userId: string) {
  const authUser = await getAuthUser(db, userId);
  const existing = assertSupabase(
    await db.from("profiles").select("*").eq("user_id", userId).limit(1),
  ) as ProfileRecord[] | null;

  if (existing?.[0]) {
    const current = existing[0];
    const updates: Record<string, string | null> = {};
    if (authUser.email && authUser.email !== current.email) updates.email = authUser.email;
    if (authUser.name && !current.full_name) updates.full_name = authUser.name;
    if (Object.keys(updates).length > 0) {
      const refreshed = assertSupabase(
        await db
          .from("profiles")
          .update(updates)
          .eq("user_id", userId)
          .select("*")
          .limit(1)
          .single(),
      ) as ProfileRecord;
      return syncDerivFromOAuth(db, refreshed);
    }
    return syncDerivFromOAuth(db, current);
  }

  const admins = assertSupabase(
    await db.from("profiles").select("user_id").eq("role", "admin"),
  ) as Array<{ user_id: string }> | null;
  const inserted = assertSupabase(
    await db
      .from("profiles")
      .insert({
        user_id: userId,
        full_name: authUser.name,
        email: authUser.email,
        role: (admins?.length ?? 0) === 0 ? "admin" : "member",
      })
      .select("*")
      .limit(1)
      .single(),
  ) as ProfileRecord;
  return syncDerivFromOAuth(db, inserted);
}

async function requireAdmin(db: SupabaseAdmin, userId: string) {
  const profile = await ensureProfile(db, userId);
  if (profile.role !== "admin") {
    throw new Error("You need admin access for this page.");
  }
  return profile;
}

async function loadBooksWithPages(includeUnpublished = false) {
  const books = await listCatalogBooks(includeUnpublished);
  const rows = await Promise.all(
    books.map(async (book) => {
      const pages = await getCatalogBookPages(book.id);
      return toBookRow(book, pages.length, pages);
    }),
  );
  return rows.sort((left, right) => left.sort_order - right.sort_order);
}

async function accessForBook(db: SupabaseAdmin, profile: Profile, book: BookRow) {
  if (profile.banned) return { canRead: false, canDownload: false, via: "none" as const };
  if (profile.role === "admin") return { canRead: true, canDownload: true, via: "admin" as const };

  const subscriptions = assertSupabase(
    await db
      .from("subscriptions")
      .select("id, status, expires_at")
      .eq("user_id", profile.user_id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString()),
  ) as SubscriptionRecord[] | null;
  if ((subscriptions?.length ?? 0) > 0) {
    return { canRead: true, canDownload: false, via: "subscription" as const };
  }

  const purchases = assertSupabase(
    await db
      .from("purchases")
      .select("id, kind, status, book_id")
      .eq("user_id", profile.user_id)
      .eq("status", "paid"),
  ) as Array<{ id: string; kind: string; status: string; book_id: string | null }> | null;
  if (
    (purchases ?? []).some(
      (purchase) =>
        (purchase.kind === "download" || purchase.kind === "online") &&
        (purchase.book_id === book.id || purchase.book_id === null),
    )
  ) {
    const canDownload = (purchases ?? []).some(
      (purchase) => purchase.kind === "download" && (purchase.book_id === book.id || purchase.book_id === null),
    );
    return { canRead: true, canDownload, via: "purchase" as const };
  }

  const coupons = assertSupabase(
    await db
      .from("coupons")
      .select("id, user_id, book_id, uses_remaining, expires_at")
      .eq("user_id", profile.user_id)
      .gt("uses_remaining", 0),
  ) as Array<{
    id: string;
    user_id: string | null;
    book_id: string | null;
    uses_remaining: number;
    expires_at: string | null;
  }> | null;
  const now = Date.now();
  const activeCoupon = (coupons ?? []).find((coupon) => {
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at).getTime() : null;
    const unexpired = expiresAt === null || expiresAt > now;
    return unexpired && (coupon.book_id === null || coupon.book_id === book.id);
  });
  if (activeCoupon) {
    return { canRead: true, canDownload: false, via: "coupon" as const };
  }

  return { canRead: false, canDownload: false, via: "none" as const };
}

async function getPublicBook(slug: string) {
  const book = await getCatalogBookBySlug(slug);
  if (!book) return null;
  const pages = await getCatalogBookPages(book.id);
  return toBookRow(book, pages.length, pages);
}

function checkoutBaseUrl() {
  return process.env.BETTER_AUTH_URL?.trim() || SITE.url;
}

async function createStripeCheckout({
  amount,
  description,
  email,
  metadata,
  purchaseId,
}: {
  amount: number;
  description: string;
  email: string;
  metadata: Record<string, string>;
  purchaseId: string;
}) {
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
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Stripe checkout could not be initialized.");
  }

  return (await response.json()) as { id: string; url: string | null };
}

async function createPaystackCheckout({
  amount,
  description,
  email,
  metadata,
}: {
  amount: number;
  description: string;
  email: string;
  metadata: Record<string, string>;
}) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) return null;

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      callback_url: `${checkoutBaseUrl()}/account?provider=paystack`,
      metadata: { ...metadata, description },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Paystack checkout could not be initialized.");
  }

  const payload = (await response.json()) as {
    data?: { authorization_url?: string; reference?: string };
  };
  return {
    authorization_url: payload.data?.authorization_url ?? null,
    reference: payload.data?.reference ?? null,
  };
}

export const listBooks = createServerFn({ method: "GET" }).handler(async () => {
  return loadBooksWithPages(false);
});

export const getBook = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    return getPublicBook(data.slug);
  });

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    return ensureProfile(db, context.userId);
  });

export const updateProfileName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ fullName: z.string().min(2).max(80) }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    assertSupabase(
      await db.from("profiles").update({ full_name: data.fullName.trim() }).eq("user_id", context.userId),
    );
    return { ok: true };
  });

export const confirmAge = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await ensureProfile(db, context.userId);
    assertSupabase(
      await db
        .from("profiles")
        .update({ age_confirmed_at: new Date().toISOString() })
        .eq("user_id", context.userId),
    );
    return { ok: true };
  });

export const acceptTos = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    assertSupabase(
      await db
        .from("profiles")
        .update({ tos_accepted_at: new Date().toISOString() })
        .eq("user_id", context.userId),
    );
    return { ok: true };
  });

export const linkDeriv = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      cr: z.string().min(2).max(64),
      partnerCode: z.string().max(80).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await hitRate(db, `deriv:${context.userId}`, 8);
    const profile = await ensureProfile(db, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");

    const identifier = data.cr.trim().toUpperCase();
    let tagged = false;
    if (canCheckDerivTags()) {
      try {
        const matches = await checkDerivClientTags([identifier]);
        tagged = matches.get(identifier) ?? false;
      } catch {
        tagged = false;
      }
    }
    if (!tagged) {
      const expected = (await getSetting(db, "partner_code", "SLT-PARTNER")).trim().toUpperCase();
      tagged = expected.length > 0 && expected === (data.partnerCode ?? "").trim().toUpperCase();
    }

    const updated = assertSupabase(
      await db
        .from("profiles")
        .update({
          deriv_cr: identifier,
          deriv_client_id: identifier,
          deriv_tagged: tagged,
          is_tagged: tagged,
          deriv_linked_at: new Date().toISOString(),
        })
        .eq("user_id", context.userId)
        .select("*")
        .limit(1)
        .single(),
    ) as ProfileRecord;

    return { tagged, cr: updated.deriv_cr ?? identifier };
  });

export const generateMemberCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await hitRate(db, `coupon:${context.userId}`, 6);
    const profile = await ensureProfile(db, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");
    if (!profile.deriv_tagged) {
      throw new Error("Member coupons are for tagged SLT partnership accounts. Link a tagged Deriv account first.");
    }

    const existing = assertSupabase(
      await db
        .from("coupons")
        .select("id, code, user_id, book_id, kind, uses_remaining, paid_cents, created_at, expires_at")
        .eq("user_id", context.userId)
        .gt("uses_remaining", 0)
        .in("kind", ["tagged_free", "tagged_paid"])
        .order("created_at", { ascending: false })
        .limit(1),
    ) as CouponRecord[] | null;
    if (existing?.[0]) {
      return { code: existing[0].code, created: false };
    }

    const globalPre = (await getSetting(db, "global_prelaunch", "true")) === "true";
    if (!globalPre) {
      const paid = assertSupabase(
        await db
          .from("purchases")
          .select("id")
          .eq("user_id", context.userId)
          .eq("kind", "coupon5")
          .eq("status", "paid")
          .limit(1),
      ) as Array<{ id: string }> | null;
      if (!paid?.[0]) {
        return { needsPayment: true as const, amount: PRICING.taggedCouponPublic };
      }
    }

    const code = randomCode("SLT");
    assertSupabase(
      await db.from("coupons").insert({
        code,
        user_id: context.userId,
        kind: globalPre ? "tagged_free" : "tagged_paid",
        paid_cents: globalPre ? 0 : Math.round(PRICING.taggedCouponPublic * 100),
        uses_remaining: 40,
      }),
    );
    return { code, created: true };
  });

export const redeemCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string().min(3).max(32) }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await hitRate(db, `redeem:${context.userId}`, 10);
    const rows = assertSupabase(
      await db
        .from("coupons")
        .select("id, code, user_id, book_id, kind, uses_remaining, paid_cents, created_at, expires_at")
        .eq("code", data.code.trim().toUpperCase())
        .limit(1),
    ) as CouponRecord[] | null;
    const found = rows?.[0];
    if (!found || requireNumber(found.uses_remaining) <= 0) {
      throw new Error("That coupon is not valid, or it has already been used.");
    }
    if (found.user_id && found.user_id !== context.userId) {
      throw new Error("That coupon is already attached to another account.");
    }
    assertSupabase(
      await db.from("coupons").update({ user_id: context.userId }).eq("id", found.id),
    );
    return { ok: true };
  });

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      bookSlug: z.string().optional(),
      kind: z.enum(["online", "download", "coupon5", "sub3", "sub6"]),
      provider: z.enum(["stripe", "paystack"]),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    const profile = await ensureProfile(db, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");

    let amount = 0;
    let book: BookRow | null = null;
    let purchaseKind = data.kind;
    if (data.kind === "coupon5") amount = Math.round(PRICING.taggedCouponPublic * 100);
    else if (data.kind === "sub3") {
      amount = Math.round(PRICING.subQuarterly * 100);
      purchaseKind = "subscription";
    } else if (data.kind === "sub6") {
      amount = Math.round(PRICING.subBiannual * 100);
      purchaseKind = "subscription";
    } else {
      if (!data.bookSlug) throw new Error("Choose a book first.");
      book = await getPublicBook(data.bookSlug);
      if (!book) throw new Error("We could not find that book.");
      amount =
        data.kind === "download"
          ? book.launch_mode === "public"
            ? book.download_public_cents
            : book.download_prelaunch_cents
          : book.online_price_cents;
    }

    const inserted = assertSupabase(
      await db
        .from("purchases")
        .insert({
          user_id: context.userId,
          book_id: book?.id ?? null,
          kind: purchaseKind,
          amount_cents: amount,
          provider: data.provider,
          status: profile.role === "admin" ? "paid" : "pending",
        })
        .select("id, user_id, book_id, kind, amount_cents, provider, status, reference, gateway_url, created_at")
        .limit(1)
        .single(),
    ) as PurchaseRecord;

    if (profile.role === "admin") {
      if (purchaseKind === "subscription") {
        const days = data.kind === "sub6" ? 180 : 90;
        assertSupabase(
          await db.from("subscriptions").insert({
            user_id: context.userId,
            plan: data.kind,
            status: "active",
            expires_at: new Date(Date.now() + days * 86400000).toISOString(),
          }),
        );
      }
      return { status: "granted" as const, message: "Access granted for this desk copy." };
    }

    const metadata = {
      purchase_id: inserted.id,
      user_id: context.userId,
      kind: purchaseKind,
      book_slug: book?.slug ?? "",
    };
    const email = profile.email ?? (await getAuthUser(db, context.userId)).email ?? "";
    const description =
      purchaseKind === "subscription"
        ? data.kind === "sub6"
          ? "SLT Trade Hub · 6-Month Library Access"
          : "SLT Trade Hub · 3-Month Library Access"
        : purchaseKind === "coupon5"
          ? "SLT Trade Hub · Tagged Coupon"
          : `${book?.title ?? "Book"} · ${purchaseKind === "download" ? "Download" : "Online access"}`;

    if (data.provider === "stripe") {
      const session = await createStripeCheckout({
        amount,
        description,
        email,
        metadata,
        purchaseId: inserted.id,
      });
      if (session?.url) {
        assertSupabase(
          await db
            .from("purchases")
            .update({
              reference: session.id,
              gateway_url: session.url,
            })
            .eq("id", inserted.id),
        );
        return {
          status: "redirect" as const,
          url: session.url,
          message: "Stripe checkout is ready.",
        };
      }
    }

    if (data.provider === "paystack") {
      const session = await createPaystackCheckout({
        amount,
        description,
        email,
        metadata,
      });
      if (session?.authorization_url) {
        assertSupabase(
          await db
            .from("purchases")
            .update({
              reference: session.reference,
              gateway_url: session.authorization_url,
            })
            .eq("id", inserted.id),
        );
        return {
          status: "redirect" as const,
          url: session.authorization_url,
          message: "Paystack checkout is ready.",
        };
      }
    }

    return {
      status: "offline" as const,
      amount,
      message:
        "Payment keys are not configured yet. The purchase intent has been recorded, but checkout is offline until Stripe and Paystack secrets are added.",
    };
  });

export const readerPayload = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    const profile = await ensureProfile(db, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");
    const book = await getPublicBook(data.slug);
    if (!book) throw new Error("That book is not in the library.");
    const pages = book.pages ?? [];
    const access = await accessForBook(db, profile, book);
    const watermark = `${profile.full_name || profile.email || "Reader"} · ${profile.deriv_cr || profile.email || context.userId}`;
    return {
      book,
      profile,
      access,
      watermark,
      pages: access.canRead ? pages : pages.slice(0, PREVIEW_PAGES),
      lockedFrom: access.canRead ? null : Math.min(PREVIEW_PAGES, pages.length),
      totalPages: pages.length,
    };
  });

export const logPage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ slug: z.string(), pageIndex: z.number().int().min(0) }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    const book = await getPublicBook(data.slug);
    if (!book) return { ok: false };
    assertSupabase(
      await db.from("reading_logs").insert({
        user_id: context.userId,
        book_id: book.id,
        page_index: data.pageIndex,
      }),
    );
    return { ok: true };
  });

export const myLibrary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    const profile = await ensureProfile(db, context.userId);
    const coupons = assertSupabase(
      await db
        .from("coupons")
        .select("code, kind, uses_remaining, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false }),
    );
    const purchases = assertSupabase(
      await db
        .from("purchases")
        .select("kind, amount_cents, created_at, book_id")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false }),
    );
    return { profile, coupons, purchases };
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    assertSupabase(await db.from("reading_logs").delete().eq("user_id", context.userId));
    assertSupabase(await db.from("purchases").delete().eq("user_id", context.userId));
    assertSupabase(await db.from("coupons").delete().eq("user_id", context.userId));
    assertSupabase(await db.from("subscriptions").delete().eq("user_id", context.userId));
    assertSupabase(await db.from("profiles").delete().eq("user_id", context.userId));
    return { ok: true };
  });

export const exportMyData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    const profile = await ensureProfile(db, context.userId);
    const purchases = assertSupabase(
      await db
        .from("purchases")
        .select("id, kind, amount_cents, provider, status, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false }),
    );
    const coupons = assertSupabase(
      await db
        .from("coupons")
        .select("code, kind, uses_remaining, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false }),
    );
    return { profile, purchases, coupons };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const users = assertSupabase(await db.from("profiles").select("user_id")) as
      | Array<{ user_id: string }>
      | null;
    const tagged = assertSupabase(
      await db.from("profiles").select("user_id").or("deriv_tagged.eq.true,is_tagged.eq.true"),
    ) as Array<{ user_id: string }> | null;
    const paidRows = assertSupabase(
      await db.from("purchases").select("amount_cents").eq("status", "paid"),
    ) as Array<{ amount_cents: number }> | null;
    const books = assertSupabase(
      await db.from("books").select("id").eq("published", true),
    ) as Array<{ id: string }> | null;
    return {
      users: users?.length ?? 0,
      tagged: tagged?.length ?? 0,
      salesCount: paidRows?.length ?? 0,
      salesCents: (paidRows ?? []).reduce((sum, row) => sum + requireNumber(row.amount_cents), 0),
      books: books?.length ?? 0,
      settings: await getSettingsMap(db),
    };
  });

export const adminUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const rows = assertSupabase(
      await db.from("profiles").select("*").order("created_at", { ascending: false }),
    ) as ProfileRecord[] | null;
    return (rows ?? []).map((row) => normalizeProfile(row));
  });

export const adminSetBan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), banned: z.boolean() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(
      await db.from("profiles").update({ banned: data.banned }).eq("user_id", data.userId),
    );
    return { ok: true };
  });

export const adminSetTagged = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), tagged: z.boolean() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(
      await db
        .from("profiles")
        .update({ deriv_tagged: data.tagged, is_tagged: data.tagged })
        .eq("user_id", data.userId),
    );
    return { ok: true };
  });

export const adminBooks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    return loadBooksWithPages(true);
  });

export const adminCreateBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      title: z.string().min(2).max(160),
      subtitle: z.string().max(160).default(""),
      slug: z.string().max(160).optional(),
      category: z.string().min(2).max(80),
      size: z.enum(["short", "medium", "full"]).default("medium"),
      launch_mode: z.enum(["prelaunch", "launch", "public"]).default("prelaunch"),
      blurb: z.string().max(5000).default(""),
      published: z.boolean().default(true),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const sortRows = assertSupabase(
      await db.from("books").select("sort_order").order("sort_order", { ascending: false }).limit(1),
    ) as Array<{ sort_order: number | null }> | null;
    const inserted = assertSupabase(
      await db
        .from("books")
        .insert({
          slug: slugify(data.slug || data.title),
          title: data.title.trim(),
          subtitle: data.subtitle.trim(),
          category: data.category.trim(),
          size: data.size,
          launch_mode: data.launch_mode === "launch" ? "public" : data.launch_mode,
          cover_url: "/brand/trading-library-powered.png",
          blurb: data.blurb.trim(),
          published: data.published,
          sort_order: requireNumber(sortRows?.[0]?.sort_order) + 1,
        })
        .select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at")
        .limit(1)
        .single(),
    ) as CatalogBook;
    return toBookRow(inserted, 0, []);
  });

export const adminUpdateBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string(),
      title: z.string().max(160).optional(),
      subtitle: z.string().max(160).optional(),
      slug: z.string().max(160).optional(),
      blurb: z.string().max(5000).optional(),
      description: z.string().max(5000).optional(),
      category: z.string().max(80).optional(),
      size: z.enum(["short", "medium", "full"]).optional(),
      launch_mode: z.enum(["prelaunch", "launch", "public"]).optional(),
      published: z.boolean().optional(),
      sort_order: z.number().int().min(0).optional(),
      cover_url: z.string().url().optional(),
      archived: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const updates: Record<string, string | number | boolean> = {};
    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.subtitle !== undefined) updates.subtitle = data.subtitle.trim();
    if (data.slug !== undefined) updates.slug = slugify(data.slug);
    if (data.blurb !== undefined || data.description !== undefined) {
      updates.blurb = (data.blurb ?? data.description ?? "").trim();
    }
    if (data.category !== undefined) updates.category = data.category.trim();
    if (data.size !== undefined) updates.size = data.size;
    if (data.launch_mode !== undefined) {
      updates.launch_mode = data.launch_mode === "launch" ? "public" : data.launch_mode;
    }
    if (data.published !== undefined) updates.published = data.published;
    if (data.archived !== undefined) updates.published = !data.archived;
    if (data.sort_order !== undefined) updates.sort_order = data.sort_order;
    if (data.cover_url !== undefined) updates.cover_url = data.cover_url;

    const updated = assertSupabase(
      await db
        .from("books")
        .update(updates)
        .eq("id", data.id)
        .select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at")
        .limit(1)
        .single(),
    ) as CatalogBook;
    const pages = await getCatalogBookPages(updated.id);
    return toBookRow(updated, pages.length, pages);
  });

export const adminDeleteBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(await db.from("book_pages").delete().eq("book_id", data.id));
    assertSupabase(await db.from("books").delete().eq("id", data.id));
    return { ok: true };
  });

export const adminSignCloudinaryUpload = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      kind: z.enum(["cover", "page"]),
      bookSlug: z.string().min(1),
      fileName: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    return createSignedCloudinaryUpload(data);
  });

export const adminSaveBookCover = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), coverUrl: z.string().url() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(
      await db.from("books").update({ cover_url: data.coverUrl }).eq("id", data.id),
    );
    return { ok: true };
  });

export const adminCreateBookPages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      bookId: z.string(),
      imageUrls: z.array(z.string().url()).min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const currentPages = assertSupabase(
      await db
        .from("book_pages")
        .select("id, book_id, page_number, image_url, created_at")
        .eq("book_id", data.bookId)
        .order("page_number", { ascending: false })
        .limit(1),
    ) as CatalogPage[] | null;
    let nextNumber = requireNumber(currentPages?.[0]?.page_number, 0) + 1;
    const inserts = data.imageUrls.map((imageUrl) => ({
      book_id: data.bookId,
      page_number: nextNumber++,
      image_url: imageUrl,
    }));
    assertSupabase(await db.from("book_pages").insert(inserts));
    return getCatalogBookPages(data.bookId);
  });

export const adminDeleteBookPage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ pageId: z.string(), bookId: z.string() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(await db.from("book_pages").delete().eq("id", data.pageId));
    const pages = await getCatalogBookPages(data.bookId);
    await Promise.all(
      pages.map((page, index) =>
        assertSupabase(
          db.from("book_pages").update({ page_number: index + 1 }).eq("id", page.id),
        ),
      ),
    );
    return getCatalogBookPages(data.bookId);
  });

export const adminReorderBookPages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      bookId: z.string(),
      pageIds: z.array(z.string()).min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    await Promise.all(
      data.pageIds.map((pageId, index) =>
        assertSupabase(
          db
            .from("book_pages")
            .update({ page_number: index + 1 })
            .eq("id", pageId)
            .eq("book_id", data.bookId),
        ),
      ),
    );
    return getCatalogBookPages(data.bookId);
  });

export const adminCreateCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      code: z.string().min(4).max(20),
      uses: z.number().int().min(1).max(500),
      bookId: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const code = data.code.trim().toUpperCase();
    assertSupabase(
      await db.from("coupons").insert({
        code,
        kind: "promo",
        uses_remaining: data.uses,
        book_id: data.bookId ?? null,
      }),
    );
    return { ok: true, code };
  });

export const adminCoupons = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    return assertSupabase(
      await db
        .from("coupons")
        .select("id, code, user_id, book_id, kind, uses_remaining, paid_cents, created_at, expires_at")
        .order("created_at", { ascending: false }),
    ) as CouponRecord[] | null;
  });

export const adminSales = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    return assertSupabase(
      await db
        .from("purchases")
        .select("id, user_id, book_id, kind, amount_cents, provider, status, reference, gateway_url, created_at")
        .order("created_at", { ascending: false }),
    ) as PurchaseRecord[] | null;
  });

export const adminLogs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    return assertSupabase(
      await db
        .from("reading_logs")
        .select("user_id, book_id, page_index, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ) as ReadingLogRecord[] | null;
  });

export const publicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const db = getSupabaseAdmin();
  return getSettingsMap(db);
});

export const adminSaveSetting = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ key: z.string(), value: z.string() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(
      await db.from("site_settings").upsert({ key: data.key, value: data.value }, { onConflict: "key" }),
    );
    return { ok: true };
  });

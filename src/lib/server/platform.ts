import { createServerFn } from "@tanstack/react-start";
import { createHash, randomUUID } from "node:crypto";
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
import { isAllowlistedAdminEmail } from "@/lib/admin/access";
import { PRICING, SITE } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  derivLoginIdFromSyntheticEmail,
  safeDerivDisplayName,
} from "@/lib/auth/deriv-identity";
import {
  DEFAULT_PRELAUNCH_POPUP,
  normalizePrelaunchPopup,
  validatePopupUrl,
} from "@/lib/prelaunch-popup";

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;
type LaunchModeValue = "prelaunch" | "launch" | "public";

type AuthUserRow = {
  id: string;
  name: string | null;
  email: string | null;
};

type ProfileRecord = {
  id?: string | null;
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
  value: string | boolean | CommunityLinkSetting[] | null;
};

type CommunityLinkSetting = {
  label: string;
  url: string;
};

type SettingValue = string | boolean | CommunityLinkSetting[];

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

export type AnonymousMessageRow = {
  id: string;
  public_id: string;
  message: string;
  context: string | null;
  status: "new" | "read" | "archived";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

const PREVIEW_PAGES = 3;
const DEFAULT_SETTINGS: Record<string, SettingValue> = {
  global_prelaunch: true,
  partner_code: "SLT-PARTNER",
  support_email: SITE.email,
  telegram_url: SITE.telegram,
  whatsapp_url: SITE.whatsapp,
  community_links: [
    { label: "Telegram", url: SITE.telegram },
    { label: "WhatsApp", url: SITE.whatsapp },
  ],
  prelaunch_popup: JSON.stringify(DEFAULT_PRELAUNCH_POPUP),
};

function normalizeLaunchMode(mode: string | null | undefined): LaunchModeValue {
  if (mode === "launch" || mode === "public") return "launch";
  return "prelaunch";
}

function uiLaunchMode(mode: string | null | undefined): LaunchModeValue {
  return normalizeLaunchMode(mode) === "launch" ? "public" : "prelaunch";
}

function slugify(value: string) {
  const next = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return next || "book";
}

function randomCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function anonymousAuthorHash(authorKey: string) {
  return createHash("sha256").update(`slt-anonymous:${authorKey.trim()}`).digest("hex");
}

function requireNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

function isCommunityLinkSetting(value: unknown): value is CommunityLinkSetting {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.label === "string" && typeof record.url === "string";
}

function isSettingValue(value: unknown): value is SettingValue {
  if (typeof value === "string" || typeof value === "boolean") return true;
  return Array.isArray(value) && value.every((entry) => isCommunityLinkSetting(entry));
}

function settingToString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === null || value === undefined) return fallback;
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

function parseSettingInput(key: string, value: string) {
  if (key === "prelaunch_popup") {
    let parsed: unknown;
    try { parsed = JSON.parse(value); } catch { throw new Error("Popup settings are not valid."); }
    const popup = normalizePrelaunchPopup(parsed);
    if (!popup.title.trim() || !popup.message.trim() || !popup.primaryLabel.trim() || !popup.secondaryLabel.trim()) {
      throw new Error("Popup title, message, and button labels are required.");
    }
    if (!validatePopupUrl(popup.primaryUrl, true)) throw new Error("The Telegram destination must be a valid link.");
    if (!validatePopupUrl(popup.whatsappUrl, true)) throw new Error("The WhatsApp destination must be a valid link.");
    if (popup.flyerUrl && !validatePopupUrl(popup.flyerUrl, true)) throw new Error("The flyer must use a valid uploaded or site image link.");
    if (popup.enabled && !popup.flyerUrl) throw new Error("Upload the final flyer before enabling the popup.");
    if (popup.startsAt && popup.endsAt && Date.parse(popup.startsAt) >= Date.parse(popup.endsAt)) {
      throw new Error("The popup end date must be after its start date.");
    }
    return JSON.stringify(popup);
  }
  if (key === "global_prelaunch") {
    return value === "true";
  }
  if (key === "community_links") {
    const parsed = (() => {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error("Community links must be a valid list.");
      }
    })();
    if (!Array.isArray(parsed)) {
      throw new Error("Community links must be a valid list.");
    }
    return parsed.map((entry, index) => {
      if (!entry || typeof entry !== "object") {
        throw new Error(`Community link ${index + 1} is missing its name or link.`);
      }
      const record = entry as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label.trim() : "";
      const url = typeof record.url === "string" ? record.url.trim() : "";
      if (!label || !url) {
        throw new Error(`Community link ${index + 1} is missing its name or link.`);
      }
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") throw new Error("unsupported protocol");
      } catch {
        throw new Error(`Community link ${index + 1} needs a valid http(s) link.`);
      }
      return { label, url } satisfies CommunityLinkSetting;
    });
  }
  return value;
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
    // Keep database/schema details in server logs. Raw Postgres messages can
    // expose implementation details and should never become page copy.
    console.error("[data] Supabase request failed:", result.error.message);
    throw new Error("We couldn't complete that request right now. Please try again.");
  }
  return result.data;
}

function asSingleRow<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

async function seedDefaultSettings(db: SupabaseAdmin) {
  const rows = assertSupabase(
    await db.from("settings").select("key, value"),
  ) as SettingRecord[] | null;
  const existing = new Set((rows ?? []).map((row) => row.key));
  const missing = Object.entries(DEFAULT_SETTINGS)
    .filter(([key]) => !existing.has(key))
    .map(([key, value]) => ({ key, value: value as SettingValue }));
  if (missing.length > 0) {
    assertSupabase(
      await db.from("settings").upsert(missing, { onConflict: "key" }),
    );
  }
}

async function getSettingsMap(db: SupabaseAdmin) {
  await seedDefaultSettings(db);
  const rows = assertSupabase(
    await db.from("settings").select("key, value"),
  ) as SettingRecord[] | null;
  const map: Record<string, SettingValue> = { ...DEFAULT_SETTINGS };
  for (const row of rows ?? []) {
    if (isSettingValue(row.value)) {
      map[row.key] = row.value;
    }
  }
  return map;
}

async function getSetting(db: SupabaseAdmin, key: string, fallback = "") {
  const settings = await getSettingsMap(db);
  return settingToString(settings[key], fallback);
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

async function syncProfileFromAuthUser(
  db: SupabaseAdmin,
  authUser: AuthUserRow,
  profile: ProfileRecord,
) {
  const updates: Record<string, string | null> = {};
  if (authUser.email && authUser.email !== profile.email) updates.email = authUser.email;
  const safeName = safeDerivDisplayName(authUser.name);
  if ((safeName && !profile.full_name) || (profile.full_name && !safeDerivDisplayName(profile.full_name))) {
    updates.full_name = safeName || null;
  }
  if (Object.keys(updates).length > 0) {
    const refreshed = assertSupabase(
      await db
        .from("profiles")
        .update(updates)
        .eq("user_id", profile.user_id)
        .select("*")
        .limit(1)
        .single(),
    ) as ProfileRecord | null;
    return syncDerivFromOAuth(db, refreshed?.user_id ? refreshed : profile);
  }
  return syncDerivFromOAuth(db, profile);
}

async function syncProfileIdentityFromAuthUser(
  db: SupabaseAdmin,
  authUser: AuthUserRow,
  profile: ProfileRecord,
) {
  const updates: Record<string, string | null> = {};
  if (authUser.email && authUser.email !== profile.email) updates.email = authUser.email;
  const safeName = safeDerivDisplayName(authUser.name);
  if ((safeName && !profile.full_name) || (profile.full_name && !safeDerivDisplayName(profile.full_name))) {
    updates.full_name = safeName || null;
  }
  if (Object.keys(updates).length === 0) {
    return normalizeProfile(profile);
  }

  const refreshed = assertSupabase(
    await db
      .from("profiles")
      .update(updates)
      .eq("user_id", profile.user_id)
      .select("*")
      .limit(1)
      .single(),
  ) as ProfileRecord | null;
  return normalizeProfile(refreshed?.user_id ? refreshed : profile);
}

async function resolveProfileForSession(
  db: SupabaseAdmin,
  userId: string,
  options?: { syncDeriv?: boolean },
) {
  const shouldSyncDeriv = options?.syncDeriv ?? true;
  const authUser = await getAuthUser(db, userId);
  const existing = assertSupabase(
    await db.from("profiles").select("*").eq("user_id", userId).limit(1),
  ) as ProfileRecord[] | null;

  if (existing?.[0]) {
    return shouldSyncDeriv
      ? syncProfileFromAuthUser(db, authUser, existing[0])
      : syncProfileIdentityFromAuthUser(db, authUser, existing[0]);
  }

  if (!authUser.email) {
    return null;
  }

  const normalizedEmail = normalizeEmail(authUser.email);
  if (!normalizedEmail) {
    return null;
  }

  const fallback = assertSupabase(
    await db.from("profiles").select("*").filter("email", "ilike", normalizedEmail).limit(1),
  ) as ProfileRecord[] | null;
  const matched = fallback?.[0];
  if (!matched) {
    return null;
  }

  const adopted = matched.user_id === userId
    ? matched
    : (assertSupabase(
        await db
          .from("profiles")
          .update({ user_id: userId })
          .eq("user_id", matched.user_id)
          .select("*")
          .limit(1)
          .single(),
      ) as ProfileRecord);

  return shouldSyncDeriv
    ? syncProfileFromAuthUser(db, authUser, adopted)
    : syncProfileIdentityFromAuthUser(db, authUser, adopted);
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

  const authUser = await getAuthUser(db, profile.user_id);
  const emailLoginId = derivLoginIdFromSyntheticEmail(authUser.email);
  const linkedLoginId = /^CR\d+$/i.test(linked.accountId)
    ? linked.accountId.toUpperCase()
    : null;
  const savedLoginId = /^CR\d+$/i.test(profile.deriv_cr ?? "")
    ? profile.deriv_cr!.toUpperCase()
    : null;
  const customerLoginId = emailLoginId ?? linkedLoginId ?? savedLoginId;
  const tagLookupId = customerLoginId ?? linked.accountId;

  let tagged = Boolean(profile.is_tagged ?? profile.deriv_tagged);
  if (canCheckDerivTags()) {
    try {
      const result = await checkDerivClientTags([tagLookupId]);
      tagged = result.get(tagLookupId) ?? false;
    } catch {
      tagged = Boolean(profile.is_tagged ?? profile.deriv_tagged);
    }
  }

  if (
    profile.deriv_cr !== customerLoginId ||
    profile.deriv_client_id !== linked.accountId ||
    tagged !== Boolean(profile.is_tagged ?? profile.deriv_tagged)
  ) {
    const updated = assertSupabase(
      await db
        .from("profiles")
        .update({
          deriv_cr: customerLoginId,
          deriv_client_id: linked.accountId,
          deriv_linked_at: profile.deriv_linked_at ?? new Date().toISOString(),
          deriv_tagged: tagged,
          is_tagged: tagged,
        })
        .eq("user_id", profile.user_id)
        .select("*")
        .limit(1)
        .single(),
    ) as ProfileRecord | null;
    return normalizeProfile(updated?.user_id ? updated : profile);
  }

  return normalizeProfile(profile);
}

async function ensureProfile(db: SupabaseAdmin, userId: string) {
  const existing = await resolveProfileForSession(db, userId, { syncDeriv: true });
  if (existing) {
    return existing;
  }

  const authUser = await getAuthUser(db, userId);
  const admins = assertSupabase(
    await db.from("profiles").select("user_id").eq("role", "admin"),
  ) as Array<{ user_id: string }> | null;
  const inserted = assertSupabase(
    await db
      .from("profiles")
      .insert({
        id: userId,
        user_id: userId,
        full_name: safeDerivDisplayName(authUser.name) || null,
        email: authUser.email,
        role: (admins?.length ?? 0) === 0 ? "admin" : "member",
      })
      .select("*")
      .limit(1)
      .single(),
  ) as ProfileRecord | null;
  if (!inserted?.user_id) {
    const recovered = assertSupabase(
      await db.from("profiles").select("*").eq("user_id", userId).limit(1),
    ) as ProfileRecord[] | null;
    if (!recovered?.[0]) throw new Error("Your reader profile could not be prepared. Please sign out and sign in again.");
    return syncDerivFromOAuth(db, recovered[0]);
  }
  return syncDerivFromOAuth(db, inserted);
}

function isMissingPurchaseAmountColumn(error: { message: string } | null) {
  if (!error) return false;
  return /amount_cents/i.test(error.message) && /does not exist|column/i.test(error.message);
}

function isMissingCouponOptionalColumns(error: { message: string } | null) {
  if (!error) return false;
  return /(paid_cents|expires_at)/i.test(error.message) && /does not exist|column/i.test(error.message);
}

async function ensureAllowlistedAdminProfile(
  db: SupabaseAdmin,
  userId: string,
  authUser: AuthUserRow,
  profile: Profile | null,
) {
  if (profile?.role === "admin") return profile;

  if (profile) {
    const updated = assertSupabase(
      await db
        .from("profiles")
        .update({ role: "admin" })
        .eq("user_id", userId)
        .select("*")
        .limit(1)
        .single(),
    ) as ProfileRecord;
    return normalizeProfile(updated);
  }

  const inserted = assertSupabase(
    await db
      .from("profiles")
      .insert({
        id: userId,
        user_id: userId,
        full_name: authUser.name,
        email: authUser.email,
        role: "admin",
      })
      .select("*")
      .limit(1)
      .single(),
  ) as ProfileRecord;
  return normalizeProfile(inserted);
}

async function loadCouponsForAdmin(db: SupabaseAdmin) {
  const fullResult = await db
    .from("coupons")
    .select("id, code, user_id, book_id, kind, uses_remaining, paid_cents, created_at, expires_at")
    .order("created_at", { ascending: false });
  if (!isMissingCouponOptionalColumns(fullResult.error)) {
    return assertSupabase(fullResult) as CouponRecord[] | null;
  }

  const fallback = assertSupabase(
    await db
      .from("coupons")
      .select("id, code, user_id, book_id, kind, uses_remaining, created_at")
      .order("created_at", { ascending: false }),
  ) as Array<Omit<CouponRecord, "paid_cents" | "expires_at">> | null;
  return (fallback ?? []).map((row) => ({
    ...row,
    paid_cents: null,
    expires_at: null,
  }));
}

async function loadPurchasesForAdmin(db: SupabaseAdmin) {
  const fullResult = await db
    .from("purchases")
    .select("id, user_id, book_id, kind, amount_cents, provider, status, reference, gateway_url, created_at")
    .order("created_at", { ascending: false });
  if (!isMissingPurchaseAmountColumn(fullResult.error)) {
    return assertSupabase(fullResult) as PurchaseRecord[] | null;
  }

  const fallback = assertSupabase(
    await db
      .from("purchases")
      .select("id, user_id, book_id, kind, provider, status, reference, gateway_url, created_at")
      .order("created_at", { ascending: false }),
  ) as Array<Omit<PurchaseRecord, "amount_cents">> | null;
  return (fallback ?? []).map((row) => ({
    ...row,
    amount_cents: 0,
  }));
}

async function getLatestReadingProgress(db: SupabaseAdmin, userId: string, bookId: string) {
  const rows = assertSupabase(
    await db
      .from("reading_logs")
      .select("user_id, book_id, page_index, created_at")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .order("created_at", { ascending: false })
      .limit(1),
  ) as ReadingLogRecord[] | null;
  return rows?.[0] ?? null;
}

async function resolveAdminAccess(db: SupabaseAdmin, userId: string) {
  const authUser = await getAuthUser(db, userId);
  const sessionEmail = authUser.email?.trim() ?? null;
  const profile = await resolveProfileForSession(db, userId, { syncDeriv: false });
  const resolvedRole = profile?.role ?? null;

  if (resolvedRole === "admin") {
    return {
      allowed: true,
      message: null,
      profile,
      role: resolvedRole,
    };
  }

  if (isAllowlistedAdminEmail(sessionEmail)) {
    const ensuredProfile = await ensureAllowlistedAdminProfile(db, userId, authUser, profile);
    return {
      allowed: true,
      message: null,
      profile: ensuredProfile,
      role: ensuredProfile.role,
    };
  }

  if (!sessionEmail) {
    return {
      allowed: false,
      message: "We found your session, but this account email could not be verified for admin access.",
      profile,
      role: resolvedRole,
    };
  }

  return {
    allowed: false,
    message: "This signed-in email is not allowed to open the admin desk.",
    profile,
    role: resolvedRole,
  };
}

async function requireAdmin(db: SupabaseAdmin, userId: string) {
  const access = await resolveAdminAccess(db, userId);
  if (!access.allowed) {
    throw new Error(access.message ?? "This account does not have admin access.");
  }
  return access.profile;
}

async function loadBooksWithPages(includeUnpublished = false) {
  const books = await listCatalogBooks(includeUnpublished);
  const rows = await Promise.all(
    books.map(async (book: CatalogBook) => {
      const pages = await getCatalogBookPages(book.id);
      return toBookRow(book, pages.length, pages);
    }),
  );
  return rows.sort((left: BookRow, right: BookRow) => left.sort_order - right.sort_order);
}

async function accessForBook(db: SupabaseAdmin, profile: Profile, book: BookRow) {
  await refreshPendingPurchases(db, profile.user_id);
  if (profile.banned) return { canRead: false, canDownload: false, via: "none" as const };
  if (profile.role === "admin") return { canRead: true, canDownload: true, via: "admin" as const };
  // A current partner verification grants online reading across the library.
  // Downloads remain a separate paid entitlement.
  if (profile.deriv_tagged) return { canRead: true, canDownload: false, via: "partner" as const };

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

async function verifyStripeCheckout(reference: string) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret || !reference) return false;

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!response.ok) return false;

  const payload = (await response.json()) as {
    status?: string;
    payment_status?: string;
  };
  return payload.status === "complete" || payload.payment_status === "paid";
}

async function verifyPaystackCheckout(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret || !reference) return false;

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!response.ok) return false;

  const payload = (await response.json()) as {
    data?: { status?: string };
  };
  return payload.data?.status === "success";
}

async function ensureSubscriptionForPurchase(
  db: SupabaseAdmin,
  purchase: Pick<PurchaseRecord, "id" | "user_id" | "kind" | "reference">,
) {
  if (purchase.kind !== "sub3" && purchase.kind !== "sub6" && purchase.kind !== "subscription") return;

  const existing = assertSupabase(
    await db
      .from("subscriptions")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("status", "active")
      .order("expires_at", { ascending: false })
      .limit(1),
  ) as Array<{ id: string }> | null;
  if (existing?.[0]) return;

  const plan = purchase.kind === "sub6" ? "sub6" : "sub3";
  const days = plan === "sub6" ? 180 : 90;
  assertSupabase(
    await db.from("subscriptions").insert({
      user_id: purchase.user_id,
      plan,
      status: "active",
      expires_at: new Date(Date.now() + days * 86400000).toISOString(),
    }),
  );
}

async function refreshPendingPurchases(db: SupabaseAdmin, userId: string) {
  const pending = assertSupabase(
    await db
      .from("purchases")
      .select("id, user_id, book_id, kind, amount_cents, provider, status, reference, gateway_url, created_at")
      .eq("user_id", userId)
      .eq("status", "pending")
      .in("provider", ["stripe", "paystack"])
      .order("created_at", { ascending: false })
      .limit(20),
  ) as PurchaseRecord[] | null;

  for (const purchase of pending ?? []) {
    if (!purchase.reference) continue;
    const paid =
      purchase.provider === "stripe"
        ? await verifyStripeCheckout(purchase.reference)
        : await verifyPaystackCheckout(purchase.reference);
    if (!paid) continue;

    assertSupabase(
      await db.from("purchases").update({ status: "paid" }).eq("id", purchase.id),
    );
    await ensureSubscriptionForPurchase(db, purchase);
  }
}

export const listBooks = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await loadBooksWithPages(false);
  } catch (error) {
    console.error("[catalog] Could not load the public shelf:", error);
    // Keep the marketing homepage usable during a temporary catalog outage.
    return [];
  }
});

export const getBook = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    try {
      return await getPublicBook(data.slug);
    } catch (error) {
      console.error("[catalog] Could not load a public book:", error);
      return null;
    }
  });

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await refreshPendingPurchases(db, context.userId);
    const profile = await ensureProfile(db, context.userId);
    if (profile.deriv_tagged) await ensureTaggedMemberCoupon(db, profile.user_id);
    return profile;
  });

export const adminAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    return resolveAdminAccess(db, context.userId);
  });

export const authUiConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    derivEnabled: Boolean(process.env.DERIV_APP_ID?.trim()),
    googleEnabled: Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
    ),
  };
});

export const updateProfileName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ fullName: z.string().min(2).max(80) }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await ensureProfile(db, context.userId);
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
    await ensureProfile(db, context.userId);
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
      cr: z.string().regex(/^(?:CR|VRTC)\d+$/i, "Enter a valid Deriv CR or VRTC login ID."),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await hitRate(db, `deriv:${context.userId}`, 8);
    const profile = await ensureProfile(db, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");

    const identifier = data.cr.trim().toUpperCase();
    if (!canCheckDerivTags()) {
      throw new Error("Partner verification is temporarily unavailable. The Deriv partner token with application_read access must be configured.");
    }
    let tagged: boolean;
    try {
      const matches = await checkDerivClientTags([identifier]);
      tagged = matches.get(identifier) ?? false;
    } catch {
      throw new Error("Deriv could not verify the partnership right now. Your existing access has not been changed; please try again shortly.");
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

    if (tagged) await ensureTaggedMemberCoupon(db, context.userId);
    return { tagged, cr: updated.deriv_cr ?? identifier };
  });

async function ensureTaggedMemberCoupon(db: SupabaseAdmin, userId: string) {
  const existing = assertSupabase(
    await db.from("coupons").select("id, code").eq("user_id", userId).gt("uses_remaining", 0)
      .in("kind", ["tagged_free", "tagged_paid"]).limit(1),
  ) as Array<{ id: string; code: string }> | null;
  if (existing?.[0]) return existing[0];
  const code = randomCode("SLT");
  const inserted = assertSupabase(
    await db.from("coupons").insert({ code, user_id: userId, kind: "tagged_free", paid_cents: 0, uses_remaining: 999 })
      .select("id, code").limit(1).single(),
  ) as { id: string; code: string };
  return inserted;
}

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
    const purchaseKind = data.kind;
    if (data.kind === "coupon5") amount = Math.round(PRICING.taggedCouponPublic * 100);
    else if (data.kind === "sub3") {
      amount = Math.round(PRICING.subQuarterly * 100);
    } else if (data.kind === "sub6") {
      amount = Math.round(PRICING.subBiannual * 100);
    } else {
      if (!data.bookSlug) throw new Error("Choose a book first.");
      book = await getPublicBook(data.bookSlug);
      if (!book) throw new Error("We could not find that book.");
      amount =
        data.kind === "download"
          ? book.launch_mode !== "prelaunch"
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
      if (purchaseKind === "sub3" || purchaseKind === "sub6") {
        const days = purchaseKind === "sub6" ? 180 : 90;
        assertSupabase(
          await db.from("subscriptions").insert({
            user_id: context.userId,
            plan: purchaseKind,
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
    if (!email) {
      throw new Error("Add an email address to your account before starting payment checkout.");
    }
    const description =
      data.kind === "sub3" || data.kind === "sub6"
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
    const visiblePages = access.canRead ? pages : pages.slice(0, PREVIEW_PAGES);
    const progress = await getLatestReadingProgress(db, context.userId, book.id);
    const maxResumeIndex = Math.max(visiblePages.length - 1, 0);
    const resumePageIndex = progress
      ? Math.max(0, Math.min(progress.page_index, maxResumeIndex))
      : 0;
    const watermark = `${profile.full_name || profile.email || "Reader"} · ${profile.deriv_cr || profile.email || context.userId}`;
    return {
      book,
      profile,
      access,
      watermark,
      pages: visiblePages,
      lockedFrom: access.canRead ? null : Math.min(PREVIEW_PAGES, pages.length),
      totalPages: pages.length,
      resumePageIndex,
    };
  });

export const logPage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ slug: z.string(), pageIndex: z.number().int().min(0) }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await ensureProfile(db, context.userId);
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
    await refreshPendingPurchases(db, context.userId);
    const profile = await ensureProfile(db, context.userId);
    const coupons = assertSupabase(
      await db
        .from("coupons")
        .select("code, kind, uses_remaining, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false }),
    ) as Array<{ code: string; kind: string; uses_remaining: number | null; created_at: string }> | null;
    const purchases = assertSupabase(
      await db
        .from("purchases")
        .select("kind, amount_cents, created_at, book_id")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false }),
    ) as Array<{ kind: string; amount_cents: number; created_at: string; book_id: string | null }> | null;
    const books = await loadBooksWithPages(false);
    const shelf = await Promise.all(books.map(async (book) => ({
      id: book.id,
      slug: book.slug,
      title: book.title,
      cover_url: book.cover_url,
      access: await accessForBook(db, profile, book),
    })));
    return { profile, coupons, purchases, shelf: shelf.filter((item) => item.access.canRead || item.access.canDownload) };
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
    ) as Array<{
      id: string;
      kind: string;
      amount_cents: number;
      provider: string;
      status: string;
      created_at: string;
    }> | null;
    const coupons = assertSupabase(
      await db
        .from("coupons")
        .select("code, kind, uses_remaining, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false }),
    ) as Array<{ code: string; kind: string; uses_remaining: number | null; created_at: string }> | null;
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
    const paidRowsResult = await db.from("purchases").select("amount_cents").eq("status", "paid");
    const paidRows = isMissingPurchaseAmountColumn(paidRowsResult.error)
      ? null
      : (assertSupabase(paidRowsResult) as Array<{ amount_cents: number }> | null);
    const salesCount = paidRows ? paidRows.length : 0;
    const salesCents = paidRows
      ? paidRows.reduce((sum, row) => sum + requireNumber(row.amount_cents), 0)
      : 0;
    const books = assertSupabase(await db.from("books").select("id")) as
      | Array<{ id: string }>
      | null;
    return {
      users: users?.length ?? 0,
      tagged: tagged?.length ?? 0,
      salesCount,
      salesCents,
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
          slug: slugify(data.slug || [data.title, data.subtitle].filter(Boolean).join(" ")),
          title: data.title.trim(),
          subtitle: data.subtitle.trim(),
          category: data.category.trim(),
          size: data.size,
          launch_mode: normalizeLaunchMode(data.launch_mode),
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
      sort_order: z.preprocess(
        (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
        z.number().int().min(0).optional(),
      ),
      cover_url: z
        .string()
        .min(1)
        .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), {
          message: "Cover image link is not valid.",
        })
        .optional(),
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
      updates.launch_mode = normalizeLaunchMode(data.launch_mode);
    }
    if (data.published !== undefined) updates.published = data.published;
    if (data.archived !== undefined) updates.published = !data.archived;
    if (data.sort_order !== undefined) updates.sort_order = data.sort_order;
    if (data.cover_url !== undefined) updates.cover_url = data.cover_url;

    const existingBook = asSingleRow(
      assertSupabase(
        await db.from("books").select("id").eq("id", data.id).limit(1),
      ) as Array<{ id: string }> | { id: string } | null,
    );
    if (!existingBook) {
      throw new Error("We could not find that book to save.");
    }

    const updateResult = await db
      .from("books")
      .update(updates)
      .eq("id", data.id)
      .select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at")
      .limit(1);

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }

    const updatedRow =
      asSingleRow(updateResult.data as CatalogBook[] | Omit<CatalogBook, "updated_at"> | null) ??
      asSingleRow(
        assertSupabase(
          await db
            .from("books")
            .select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at")
            .eq("id", data.id)
            .limit(1),
        ) as Array<CatalogBook> | CatalogBook | null,
      );

    if (!updatedRow) {
      throw new Error("We could not find that book to save.");
    }

    const updated = updatedRow as Omit<CatalogBook, "updated_at"> & { updated_at?: string };
    const pages = await getCatalogBookPages(data.id);
    return toBookRow(
      {
        ...updated,
        updated_at: updated.updated_at ?? updated.created_at,
      },
      pages.length,
      pages,
    );
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
      kind: z.enum(["cover", "page", "popup"]),
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
    try {
      assertSupabase(await db.from("book_pages").insert(inserts));
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message
          ? `Could not save uploaded page images. ${error.message}`
          : "Could not save uploaded page images.",
      );
    }
    const pages = await getCatalogBookPages(data.bookId);
    return pages.map((page) => toPageRow(page));
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
      pages.map(async (page: CatalogPage, index: number) =>
        assertSupabase(
          await db.from("book_pages").update({ page_number: index + 1 }).eq("id", page.id),
        ),
      ),
    );
    const nextPages = await getCatalogBookPages(data.bookId);
    return nextPages.map((page) => toPageRow(page));
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
      data.pageIds.map(async (pageId, index) =>
        assertSupabase(
          await db
            .from("book_pages")
            .update({ page_number: index + 1 })
            .eq("id", pageId)
            .eq("book_id", data.bookId),
        ),
      ),
    );
    const pages = await getCatalogBookPages(data.bookId);
    return pages.map((page) => toPageRow(page));
  });

export const adminReplaceBookPage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      pageId: z.string(),
      bookId: z.string(),
      imageUrl: z.string().url(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(
      await db
        .from("book_pages")
        .update({ image_url: data.imageUrl })
        .eq("id", data.pageId)
        .eq("book_id", data.bookId),
    );
    const pages = await getCatalogBookPages(data.bookId);
    return pages.map((page) => toPageRow(page));
  });

function toCloudinaryPrintUrl(url: string) {
  const marker = "/image/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const after = url.slice(at + marker.length);
  const rest = /^(?:[a-z0-9_,.:-]+\/)+v\d+\//i.test(after)
    ? after.replace(/^[^/]+\//, "")
    : after;
  return `${url.slice(0, at + marker.length)}f_jpg,q_90/${rest}`;
}

/** Admin-only asset list for offline PDF download. Never exposed publicly. */
export const adminBookDownloadBundle = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ bookId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const books = await loadBooksWithPages(true);
    const book = books.find((row) => row.id === data.bookId);
    if (!book) throw new Error("Book not found.");
    const pages = (await getCatalogBookPages(data.bookId)) ?? [];
    const ordered = [...pages]
      .filter((page) => Boolean(page?.image_url) && typeof page.page_number === "number")
      .sort((a, b) => a.page_number - b.page_number)
      .map((page) => {
        const imageUrl = String(page.image_url);
        return {
          page_number: page.page_number,
          image_url: toCloudinaryPrintUrl(imageUrl),
        };
      });
    if (ordered.length === 0) {
      throw new Error("This book has no page images to download yet.");
    }
    const cover = book.cover_url ? String(book.cover_url) : "";
    return {
      id: book.id,
      title: book.title ?? "",
      subtitle: book.subtitle ?? "",
      slug: book.slug ?? "book",
      cover_url: cover ? toCloudinaryPrintUrl(cover) : "",
      pages: ordered,
    };
  });

export const adminCreateCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      code: z.string().max(32).optional(),
      kind: z.string().min(2).max(40).default("promo"),
      usesRemaining: z.number().int().min(1).max(500),
      bookId: z.string().optional(),
      userId: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const code = (data.code?.trim() || randomCode("SLT")).toUpperCase();
    assertSupabase(
      await db.from("coupons").insert({
        code,
        kind: data.kind.trim(),
        uses_remaining: data.usesRemaining,
        book_id: data.bookId ?? null,
        user_id: data.userId ?? null,
      }),
    );
    return { ok: true, code };
  });

export const adminCoupons = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    return loadCouponsForAdmin(db);
  });

export const adminDeleteCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(await db.from("coupons").delete().eq("id", data.id));
    return { ok: true };
  });

export const adminSales = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    return loadPurchasesForAdmin(db);
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

export const publicPrelaunchPopup = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = getSupabaseAdmin();
    const settings = await getSettingsMap(db);
    const raw = settingToString(settings.prelaunch_popup, JSON.stringify(DEFAULT_PRELAUNCH_POPUP));
    const popup = normalizePrelaunchPopup(JSON.parse(raw));
    const communityLinks = Array.isArray(settings.community_links) ? settings.community_links : [];
    const telegram = communityLinks.find((link) => /hq|telegram/i.test(link.label) && validatePopupUrl(link.url))?.url
      ?? (typeof settings.telegram_url === "string" && validatePopupUrl(settings.telegram_url) ? settings.telegram_url : popup.primaryUrl);
    const whatsapp = communityLinks.find((link) => /whatsapp/i.test(link.label) && validatePopupUrl(link.url))?.url
      ?? (typeof settings.whatsapp_url === "string" && validatePopupUrl(settings.whatsapp_url) ? settings.whatsapp_url : popup.whatsappUrl);
    return { ...popup, primaryUrl: telegram, whatsappUrl: whatsapp };
  } catch (error) {
    console.error("[prelaunch-popup] Could not load popup settings.", error);
    return { ...DEFAULT_PRELAUNCH_POPUP, enabled: false };
  }
});

const anonymousSubmissionSchema = z.object({
  authorKey: z.string().uuid(),
  message: z.string().trim().min(10, "Write at least 10 characters.").max(3000),
  context: z.string().trim().max(120).optional(),
});

export const submitAnonymousMessage = createServerFn({ method: "POST" })
  .validator(anonymousSubmissionSchema)
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const authorKeyHash = anonymousAuthorHash(data.authorKey);
    await hitRate(db, `anonymous:${authorKeyHash}`, 5, 60 * 60 * 1000);
    const publicId = `ANON-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
    const inserted = assertSupabase(
      await db.from("anonymous_messages").insert({
        id: randomUUID(),
        public_id: publicId,
        author_key_hash: authorKeyHash,
        message: data.message,
        context: data.context || null,
      }).select("public_id, status, created_at").limit(1).single(),
    ) as Pick<AnonymousMessageRow, "public_id" | "status" | "created_at">;
    return inserted;
  });

export const myAnonymousMessages = createServerFn({ method: "POST" })
  .validator(z.object({ authorKey: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getSupabaseAdmin();
    const rows = assertSupabase(
      await db.from("anonymous_messages")
        .select("public_id, message, context, status, created_at, updated_at")
        .eq("author_key_hash", anonymousAuthorHash(data.authorKey))
        .order("created_at", { ascending: false }).limit(50),
    ) as Array<Omit<AnonymousMessageRow, "id" | "author_key_hash" | "admin_note">> | null;
    return rows ?? [];
  });

export const adminAnonymousMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    const rows = assertSupabase(
      await db.from("anonymous_messages")
        .select("id, public_id, message, context, status, admin_note, created_at, updated_at")
        .order("created_at", { ascending: false }).limit(300),
    ) as AnonymousMessageRow[] | null;
    return rows ?? [];
  });

export const adminUpdateAnonymousMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({
    id: z.string().uuid(),
    status: z.enum(["new", "read", "archived"]),
    adminNote: z.string().trim().max(1000),
  }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(await db.from("anonymous_messages").update({
      status: data.status,
      admin_note: data.adminNote || null,
      updated_at: new Date().toISOString(),
    }).eq("id", data.id));
    return { ok: true };
  });

export const adminSaveSetting = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ key: z.string(), value: z.string() }))
  .handler(async ({ context, data }) => {
    const db = getSupabaseAdmin();
    await requireAdmin(db, context.userId);
    assertSupabase(
      await db
        .from("settings")
        .upsert({ key: data.key, value: parseSettingInput(data.key, data.value) }, { onConflict: "key" }),
    );
    return { ok: true };
  });

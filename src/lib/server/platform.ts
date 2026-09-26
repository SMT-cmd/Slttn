import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { CATALOG, onlineCents, type BookPage } from "@/lib/catalog";
import { PRICING } from "@/lib/site";

export type Profile = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  deriv_cr: string | null;
  deriv_tagged: boolean;
  deriv_linked_at: string | null;
  role: string;
  banned: boolean;
  tos_accepted_at: string | null;
  age_confirmed_at: string | null;
};

export type BookRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  description: string;
  cover_url: string;
  series_no: string;
  size: string;
  launch_mode: string;
  online_price_cents: number;
  download_prelaunch_cents: number;
  download_public_cents: number;
  archived: boolean;
  created_at: string;
};

const PREVIEW_PAGES = 3;

async function ensureSeed(sql: Sql) {
  const counted = await sql<{ c: number }>`select count(*)::int as c from books`;
  if ((counted[0]?.c ?? 0) > 0) return;
  for (const book of CATALOG) {
    const inserted = await sql<{ id: number }>`
      insert into books (
        slug, title, subtitle, author, category, description, cover_url,
        series_no, size, launch_mode, online_price_cents
      ) values (
        ${book.slug}, ${book.title}, ${book.subtitle}, ${"O.J. Alonge"},
        ${book.category}, ${book.blurb}, ${book.coverUrl}, ${book.seriesNo},
        ${book.size}, ${book.launchMode}, ${onlineCents(book.size)}
      ) returning id
    `;
    const id = inserted[0]!.id;
    for (let i = 0; i < book.pages.length; i++) {
      const p = book.pages[i]!;
      await sql`
        insert into book_pages (
          book_id, page_index, heading, body, note_tone, note_title, note_text, bullets
        ) values (
          ${id}, ${i}, ${p.heading}, ${p.body.join("\n\n")},
          ${p.note?.tone ?? null}, ${p.note?.title ?? null}, ${p.note?.text ?? null},
          ${p.bullets ? p.bullets.join("\n") : null}
        )
      `;
    }
  }
  await sql`insert into site_settings (key, value) values ('global_prelaunch', 'true') on conflict (key) do nothing`;
  await sql`insert into site_settings (key, value) values ('partner_code', 'SLT-PARTNER') on conflict (key) do nothing`;
  await sql`insert into site_settings (key, value) values ('support_email', 'hello@slttradehub.online') on conflict (key) do nothing`;
  await sql`insert into site_settings (key, value) values ('telegram_url', 'https://t.me/slttradehub') on conflict (key) do nothing`;
  await sql`insert into site_settings (key, value) values ('whatsapp_url', 'https://chat.whatsapp.com/slttradehub') on conflict (key) do nothing`;
}

async function setting(sql: Sql, key: string, fallback = "") {
  const rows = await sql<{ value: string }>`select value from site_settings where key = ${key}`;
  return rows[0]?.value ?? fallback;
}

async function hitRate(sql: Sql, key: string, max: number, windowMs = 60 * 60 * 1000) {
  const rows = await sql<{ hits: number; window_started_at: string }>`
    select hits, window_started_at from rate_limits where key = ${key}
  `;
  const now = Date.now();
  if (!rows[0]) {
    await sql`insert into rate_limits (key, hits, window_started_at) values (${key}, 1, now())`;
    return;
  }
  const started = new Date(rows[0].window_started_at).getTime();
  if (now - started > windowMs) {
    await sql`update rate_limits set hits = 1, window_started_at = now() where key = ${key}`;
    return;
  }
  if (rows[0].hits >= max) {
    throw new Error("Please wait a little before trying that again.");
  }
  await sql`update rate_limits set hits = hits + 1 where key = ${key}`;
}

async function ensureProfile(
  sql: Sql,
  user: { id: string; email?: string | null; name?: string | null },
) {
  const existing = await sql<Profile>`select * from profiles where user_id = ${user.id}`;
  if (existing[0]) {
    await sql`update profiles set last_seen_at = now(), email = coalesce(${user.email ?? null}, email), full_name = coalesce(full_name, ${user.name ?? null}) where user_id = ${user.id}`;
    return (await sql<Profile>`select * from profiles where user_id = ${user.id}`)[0]!;
  }
  const admins = await sql<{ c: number }>`select count(*)::int as c from profiles where role = 'admin'`;
  const role = (admins[0]?.c ?? 0) === 0 ? "admin" : "member";
  await sql`
    insert into profiles (user_id, full_name, email, role)
    values (${user.id}, ${user.name ?? null}, ${user.email ?? null}, ${role})
  `;
  return (await sql<Profile>`select * from profiles where user_id = ${user.id}`)[0]!;
}

async function loadMe(sql: Sql, userId: string, email?: string | null, name?: string | null) {
  return ensureProfile(sql, { id: userId, email, name });
}

function parsePages(rows: Array<{
  page_index: number;
  heading: string;
  body: string;
  note_tone: string | null;
  note_title: string | null;
  note_text: string | null;
  bullets: string | null;
}>): BookPage[] {
  return rows
    .sort((a, b) => a.page_index - b.page_index)
    .map((r) => ({
      heading: r.heading,
      body: r.body.split("\n\n"),
      note:
        r.note_tone && r.note_title && r.note_text
          ? {
              tone: r.note_tone as "navy" | "green" | "red",
              title: r.note_title,
              text: r.note_text,
            }
          : undefined,
      bullets: r.bullets ? r.bullets.split("\n") : undefined,
    }));
}

async function hasAccess(sql: Sql, userId: string, book: BookRow, profile: Profile) {
  if (profile.banned) return { canRead: false, canDownload: false, via: "none" as const };
  if (profile.role === "admin") return { canRead: true, canDownload: true, via: "admin" as const };

  const subs = await sql<{ id: number }>`
    select id from subscriptions
    where user_id = ${userId} and status = 'active' and expires_at > now()
  `;
  if (subs[0]) return { canRead: true, canDownload: false, via: "subscription" as const };

  const purchased = await sql<{ kind: string }>`
    select kind from purchases
    where user_id = ${userId} and status = 'paid' and (book_id = ${book.id} or book_id is null)
  `;
  if (purchased.some((p) => p.kind === "download")) {
    return { canRead: true, canDownload: true, via: "purchase" as const };
  }
  if (purchased.some((p) => p.kind === "online" || p.kind === "subscription")) {
    return { canRead: true, canDownload: false, via: "purchase" as const };
  }

  const coupons = await sql<{ id: number; book_id: number | null }>`
    select id, book_id from coupons
    where user_id = ${userId}
      and uses_remaining > 0
      and (expires_at is null or expires_at > now())
      and (book_id is null or book_id = ${book.id})
  `;
  if (coupons[0]) return { canRead: true, canDownload: false, via: "coupon" as const };

  return { canRead: false, canDownload: false, via: "none" as const };
}

export const listBooks = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeed(sql);
  return sql<BookRow>`
    select * from books where archived = false order by created_at desc
  `;
});

export const getBook = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const rows = await sql<BookRow>`select * from books where slug = ${data.slug} and archived = false`;
    return rows[0] ?? null;
  });

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const profile = await loadMe(sql, context.userId);
    return profile;
  });

export const updateProfileName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ fullName: z.string().min(2).max(80) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update profiles set full_name = ${data.fullName} where user_id = ${context.userId}`;
    return { ok: true };
  });

export const confirmAge = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await loadMe(sql, context.userId);
    await sql`update profiles set age_confirmed_at = now() where user_id = ${context.userId}`;
    return { ok: true };
  });

export const acceptTos = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update profiles set tos_accepted_at = now() where user_id = ${context.userId}`;
    return { ok: true };
  });

export const linkDeriv = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      cr: z.string().min(4).max(24),
      partnerCode: z.string().max(40).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await hitRate(sql, `deriv:${context.userId}`, 8);
    const cr = data.cr.trim().toUpperCase();
    if (!/^CR[A-Z0-9]{5,}$/.test(cr)) {
      throw new Error("That CR number does not look right. It should look like CR followed by digits.");
    }
    const profile = await loadMe(sql, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");

    let tagged = false;
    const token = process.env.DERIV_API_TOKEN;
    const appId = process.env.DERIV_APP_ID;
    if (token && appId) {
      try {
        const res = await fetch("https://api.deriv.com/partners/client-tags/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cr, app_id: appId }),
        });
        if (res.ok) {
          const json = (await res.json()) as { tagged?: boolean };
          tagged = Boolean(json.tagged);
        }
      } catch {
        tagged = false;
      }
    } else {
      const expected = (await setting(sql, "partner_code", "SLT-PARTNER")).toUpperCase();
      tagged = (data.partnerCode ?? "").trim().toUpperCase() === expected;
    }

    await sql`
      update profiles
      set deriv_cr = ${cr}, deriv_tagged = ${tagged}, deriv_linked_at = now()
      where user_id = ${context.userId}
    `;
    return { tagged, cr };
  });

export const generateMemberCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await hitRate(sql, `coupon:${context.userId}`, 6);
    const profile = await loadMe(sql, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");
    if (!profile.deriv_tagged) {
      throw new Error("Member coupons are for tagged SLT partnership accounts. Link a tagged Deriv CR first.");
    }
    const existing = await sql<{ code: string }>`
      select code from coupons
      where user_id = ${context.userId} and kind in ('tagged_free', 'tagged_paid') and uses_remaining > 0
      order by id desc limit 1
    `;
    if (existing[0]) return { code: existing[0].code, created: false };

    const globalPre = (await setting(sql, "global_prelaunch", "true")) === "true";
    if (!globalPre) {
      const paid = await sql<{ id: number }>`
        select id from purchases
        where user_id = ${context.userId} and kind = 'coupon5' and status = 'paid'
        limit 1
      `;
      if (!paid[0]) {
        return { needsPayment: true as const, amount: PRICING.taggedCouponPublic };
      }
    }
    const code = `SLT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await sql`
      insert into coupons (code, user_id, kind, paid_cents, uses_remaining)
      values (${code}, ${context.userId}, ${globalPre ? "tagged_free" : "tagged_paid"}, ${globalPre ? 0 : 500}, 40)
    `;
    return { code, created: true };
  });

export const redeemCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string().min(3).max(24) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await hitRate(sql, `redeem:${context.userId}`, 10);
    const code = data.code.trim().toUpperCase();
    const found = await sql<{
      id: number;
      user_id: string | null;
      uses_remaining: number;
    }>`select id, user_id, uses_remaining from coupons where code = ${code}`;
    if (!found[0] || found[0].uses_remaining <= 0) {
      throw new Error("That coupon is not valid, or it has already been used.");
    }
    if (found[0].user_id && found[0].user_id !== context.userId) {
      throw new Error("That coupon is already attached to another account.");
    }
    await sql`update coupons set user_id = ${context.userId} where id = ${found[0].id}`;
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
    const sql = await getSql();
    const profile = await loadMe(sql, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");

    let amount = 0;
    let bookId: number | null = null;
    if (data.kind === "coupon5") amount = PRICING.taggedCouponPublic * 100;
    else if (data.kind === "sub3") amount = Math.round(PRICING.subQuarterly * 100);
    else if (data.kind === "sub6") amount = Math.round(PRICING.subBiannual * 100);
    else {
      if (!data.bookSlug) throw new Error("Choose a book first.");
      const book = (await sql<BookRow>`select * from books where slug = ${data.bookSlug}`)[0];
      if (!book) throw new Error("We could not find that book.");
      bookId = book.id;
      amount =
        data.kind === "download"
          ? book.launch_mode === "public"
            ? book.download_public_cents
            : book.download_prelaunch_cents
          : book.online_price_cents;
    }

    const stripe = process.env.STRIPE_SECRET_KEY;
    const paystack = process.env.PAYSTACK_SECRET_KEY;
    if (data.provider === "stripe" && stripe) {
      return {
        status: "redirect" as const,
        message: "Stripe checkout will open once this account is fully connected.",
      };
    }
    if (data.provider === "paystack" && paystack) {
      return {
        status: "redirect" as const,
        message: "Paystack checkout will open once this account is fully connected.",
      };
    }

    if (profile.role === "admin") {
      await sql`
        insert into purchases (user_id, book_id, kind, amount_cents, provider, status)
        values (${context.userId}, ${bookId}, ${data.kind === "sub3" || data.kind === "sub6" ? "subscription" : data.kind}, ${amount}, ${"complimentary"}, ${"paid"})
      `;
      if (data.kind === "sub3" || data.kind === "sub6") {
        const days = data.kind === "sub3" ? 90 : 180;
        const expires = new Date(Date.now() + days * 86400000).toISOString();
        await sql`
          insert into subscriptions (user_id, plan, status, expires_at)
          values (${context.userId}, ${data.kind}, 'active', ${expires})
        `;
      }
      return { status: "granted" as const, message: "Access granted for this desk copy." };
    }

    return {
      status: "offline" as const,
      amount,
      message:
        "Card checkout goes live when Stripe and Paystack keys are added in hosting. Tagged members can still generate a pre-launch coupon from their account.",
    };
  });

export const readerPayload = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const profile = await loadMe(sql, context.userId);
    if (profile.banned) throw new Error("This account has been suspended.");
    const book = (await sql<BookRow>`select * from books where slug = ${data.slug}`)[0];
    if (!book) throw new Error("That book is not in the library.");
    const pages = await sql<{
      page_index: number;
      heading: string;
      body: string;
      note_tone: string | null;
      note_title: string | null;
      note_text: string | null;
      bullets: string | null;
    }>`select * from book_pages where book_id = ${book.id} order by page_index`;
    const access = await hasAccess(sql, context.userId, book, profile);
    const parsed = parsePages(pages);
    const watermark = `${profile.full_name || profile.email || "Reader"} · ${profile.deriv_cr || profile.email || context.userId} · slttradehub.online`;
    if (!access.canRead) {
      return {
        book,
        profile,
        access,
        watermark,
        pages: parsed.slice(0, PREVIEW_PAGES),
        lockedFrom: PREVIEW_PAGES,
        totalPages: parsed.length,
      };
    }
    return {
      book,
      profile,
      access,
      watermark,
      pages: parsed,
      lockedFrom: null as number | null,
      totalPages: parsed.length,
    };
  });

export const logPage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ slug: z.string(), pageIndex: z.number().int().min(0) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const book = (await sql<{ id: number }>`select id from books where slug = ${data.slug}`)[0];
    if (!book) return { ok: false };
    await sql`
      insert into reading_logs (user_id, book_id, page_index)
      values (${context.userId}, ${book.id}, ${data.pageIndex})
    `;
    return { ok: true };
  });

export const myLibrary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await loadMe(sql, context.userId);
    const coupons = await sql<{ code: string; kind: string; uses_remaining: number }>`
      select code, kind, uses_remaining from coupons where user_id = ${context.userId} order by id desc
    `;
    const purchases = await sql<{ kind: string; amount_cents: number; created_at: string; book_id: number | null }>`
      select kind, amount_cents, created_at, book_id from purchases where user_id = ${context.userId} order by id desc
    `;
    return { profile, coupons, purchases };
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`delete from reading_logs where user_id = ${context.userId}`;
    await sql`delete from purchases where user_id = ${context.userId}`;
    await sql`delete from coupons where user_id = ${context.userId}`;
    await sql`delete from subscriptions where user_id = ${context.userId}`;
    await sql`delete from profiles where user_id = ${context.userId}`;
    return { ok: true };
  });

export const exportMyData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await loadMe(sql, context.userId);
    const purchases = await sql<{
      id: number;
      kind: string;
      amount_cents: number;
      provider: string;
      status: string;
      created_at: string;
    }>`select id, kind, amount_cents, provider, status, created_at from purchases where user_id = ${context.userId}`;
    const coupons = await sql<{
      code: string;
      kind: string;
      uses_remaining: number;
      created_at: string;
    }>`select code, kind, uses_remaining, created_at from coupons where user_id = ${context.userId}`;
    return { profile, purchases, coupons };
  });

async function requireAdmin(sql: Sql, userId: string) {
  const profile = await loadMe(sql, userId);
  if (profile.role !== "admin") throw new Error("You need admin access for this page.");
  return profile;
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const users = await sql<{ c: number }>`select count(*)::int as c from profiles`;
    const tagged = await sql<{ c: number }>`select count(*)::int as c from profiles where deriv_tagged = true`;
    const sales = await sql<{ c: number; s: number }>`select count(*)::int as c, coalesce(sum(amount_cents),0)::int as s from purchases where status = 'paid'`;
    const books = await sql<{ c: number }>`select count(*)::int as c from books where archived = false`;
    return {
      users: users[0]?.c ?? 0,
      tagged: tagged[0]?.c ?? 0,
      salesCount: sales[0]?.c ?? 0,
      salesCents: sales[0]?.s ?? 0,
      books: books[0]?.c ?? 0,
    };
  });

export const adminUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    return sql<Profile & { created_at: string }>`
      select * from profiles order by created_at desc
    `;
  });

export const adminSetBan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), banned: z.boolean() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`update profiles set banned = ${data.banned} where user_id = ${data.userId}`;
    return { ok: true };
  });

export const adminSetTagged = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), tagged: z.boolean() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`update profiles set deriv_tagged = ${data.tagged} where user_id = ${data.userId}`;
    return { ok: true };
  });

export const adminBooks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await ensureSeed(sql);
    return sql<BookRow>`select * from books order by id`;
  });

export const adminUpdateBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      launch_mode: z.enum(["prelaunch", "public"]).optional(),
      online_price_cents: z.number().optional(),
      archived: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const current = (await sql<BookRow>`select * from books where id = ${data.id}`)[0];
    if (!current) throw new Error("Book not found.");
    await sql`
      update books set
        title = ${data.title ?? current.title},
        description = ${data.description ?? current.description},
        category = ${data.category ?? current.category},
        launch_mode = ${data.launch_mode ?? current.launch_mode},
        online_price_cents = ${data.online_price_cents ?? current.online_price_cents},
        archived = ${data.archived ?? current.archived}
      where id = ${data.id}
    `;
    return { ok: true };
  });

export const adminCreateCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      code: z.string().min(4).max(20),
      uses: z.number().int().min(1).max(500),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const code = data.code.trim().toUpperCase();
    await sql`
      insert into coupons (code, kind, uses_remaining) values (${code}, ${"promo"}, ${data.uses})
    `;
    return { ok: true, code };
  });

export const adminCoupons = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    return sql<{
      id: number;
      code: string;
      user_id: string | null;
      kind: string;
      uses_remaining: number;
      created_at: string;
    }>`select id, code, user_id, kind, uses_remaining, created_at from coupons order by id desc`;
  });

export const adminSales = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    return sql<{
      id: number;
      user_id: string;
      kind: string;
      amount_cents: number;
      provider: string;
      status: string;
      created_at: string;
    }>`select id, user_id, kind, amount_cents, provider, status, created_at from purchases order by id desc`;
  });

export const adminLogs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    return sql<{
      user_id: string;
      book_id: number;
      page_index: number;
      created_at: string;
    }>`select user_id, book_id, page_index, created_at from reading_logs order by id desc limit 200`;
  });

export const publicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeed(sql);
  const rows = await sql<{ key: string; value: string }>`select key, value from site_settings`;
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
});

export const adminSaveSetting = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ key: z.string(), value: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`
      insert into site_settings (key, value) values (${data.key}, ${data.value})
      on conflict (key) do update set value = ${data.value}
    `;
    return { ok: true };
  });

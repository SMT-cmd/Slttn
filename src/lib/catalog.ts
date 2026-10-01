import { getDb } from "./db";
import { PRICING, SITE, type BookCategory, type BookSize } from "./site";

export type CatalogLaunchMode = "prelaunch" | "launch";

export type CatalogPage = {
  id: string;
  book_id: string;
  page_number: number;
  image_url: string;
  created_at: string;
};

export type CatalogBook = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: BookCategory | string;
  size: BookSize;
  launch_mode: CatalogLaunchMode;
  cover_url: string;
  blurb: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type CatalogBookRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  size: BookSize | string;
  launch_mode: CatalogLaunchMode | "public" | string;
  cover_url: string | null;
  blurb: string | null;
  published: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

type CatalogPageRecord = {
  id: string;
  book_id: string;
  page_number: number;
  image_url: string;
  created_at: string;
};

function safeSize(size: string | null | undefined): BookSize {
  return size === "short" || size === "medium" || size === "full" ? size : "medium";
}

function safeLaunchMode(mode: string | null | undefined): CatalogLaunchMode {
  return mode === "launch" || mode === "public" ? "launch" : "prelaunch";
}

export function defaultCoverFor(slug: string) {
  void slug;
  return "/brand/trading-library-powered.png";
}

export function normalizeCatalogBook(row: CatalogBookRecord): CatalogBook {
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
    updated_at: row.updated_at,
  };
}

export function normalizeCatalogPage(row: CatalogPageRecord): CatalogPage {
  return {
    id: row.id,
    book_id: row.book_id,
    page_number: row.page_number,
    image_url: row.image_url,
    created_at: row.created_at,
  };
}

export function onlineCents(size: BookSize) {
  return PRICING.online[size] * 100;
}

export function authorName() {
  return SITE.author;
}

export async function listCatalogBooks(includeUnpublished = false) {
  const db = getDb();
  let query = db
    .from("books")
    .select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (!includeUnpublished) {
    query = query.eq("published", true);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as CatalogBookRecord[];
  return rows.map((row) => normalizeCatalogBook(row));
}

export async function getCatalogBookBySlug(slug: string, includeUnpublished = false) {
  const db = getDb();
  const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  // Apply all filters before resolving the row so public shelf lookups are reliable.
  let query = db
    .from("books")
    .select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at")
    .eq("slug", cleanSlug)
    .limit(1);
  if (!includeUnpublished) {
    query = query.eq("published", true);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    // Fallback: case-insensitive match on slug for older rows
    const all = await db
      .from("books")
      .select("id, slug, title, subtitle, category, size, launch_mode, cover_url, blurb, published, sort_order, created_at, updated_at")
      .limit(200);
    if (all.error) throw new Error(all.error.message);
    const rows = (all.data ?? []) as CatalogBookRecord[];
    const match = rows.find((row) => row.slug?.toLowerCase() === cleanSlug);
    if (!match) return null;
    if (!includeUnpublished && !match.published) return null;
    return normalizeCatalogBook(match);
  }
  return normalizeCatalogBook(data as CatalogBookRecord);
}

export async function getCatalogBookPages(bookId: string) {
  const db = getDb();
  const { data, error } = await db
    .from("book_pages")
    .select("id, book_id, page_number, image_url, created_at")
    .eq("book_id", bookId)
    .order("page_number", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as CatalogPageRecord[];
  return rows.map((row) => normalizeCatalogPage(row));
}

export async function getCatalogSnapshot(includeUnpublished = false) {
  return listCatalogBooks(includeUnpublished);
}

export const CATALOG = {
  list: listCatalogBooks,
  getBySlug: getCatalogBookBySlug,
  getPages: getCatalogBookPages,
  snapshot: getCatalogSnapshot,
};

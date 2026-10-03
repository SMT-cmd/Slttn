import { listCatalogBooks } from "@/lib/catalog";
import { SITE } from "@/lib/site";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
};

const MARKETING_ROUTES = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.7 },
  { path: "/pricing", changefreq: "weekly", priority: 0.8 },
  { path: "/community", changefreq: "weekly", priority: 0.8 },
  { path: "/faq", changefreq: "monthly", priority: 0.6 },
  { path: "/contact", changefreq: "monthly", priority: 0.6 },
  { path: "/support", changefreq: "monthly", priority: 0.5 },
  { path: "/privacy", changefreq: "monthly", priority: 0.4 },
  { path: "/terms", changefreq: "monthly", priority: 0.4 },
  { path: "/cookies", changefreq: "monthly", priority: 0.3 },
  { path: "/copyright", changefreq: "monthly", priority: 0.3 },
  { path: "/disclaimer", changefreq: "monthly", priority: 0.3 },
  { path: "/refund", changefreq: "monthly", priority: 0.3 },
] as const satisfies ReadonlyArray<{
  path: string;
  changefreq: SitemapEntry["changefreq"];
  priority: number;
}>;

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeLastmod(value?: string) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
}

function renderEntry(entry: SitemapEntry) {
  const lines = [`  <url>`, `    <loc>${xmlEscape(entry.loc)}</loc>`];

  if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (typeof entry.priority === "number") {
    lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
  }

  lines.push("  </url>");
  return lines.join("\n");
}

export async function renderSitemapXml() {
  // Crawlers should still receive the two public site roots and all marketing pages
  // if the catalog database is temporarily unavailable.
  const books = await listCatalogBooks(false).catch(() => []);

  const entries: SitemapEntry[] = [
    ...MARKETING_ROUTES.map((route) => ({
      loc: `${SITE.url}${route.path}`,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    {
      loc: SITE.libraryUrl,
      changefreq: "weekly",
      priority: 0.9,
    },
    ...books.map((book) => ({
      loc: `${SITE.libraryUrl}/${book.slug}`,
      lastmod: normalizeLastmod(book.updated_at ?? book.created_at),
      changefreq: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const body = entries.map(renderEntry).join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    body,
    `</urlset>`,
    ``,
  ].join("\n");
}

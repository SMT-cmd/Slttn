import { createFileRoute } from "@tanstack/react-router";
import { listCatalogBooks } from "@/lib/catalog";

const LIBRARY_ORIGIN = "https://library.slttradehub.trade";

export const Route = createFileRoute("/api/portfolio-books")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // The portfolio receives only metadata already approved for the public shelf.
          // Never expose page images, user records, unpublished drafts, or entitlement data.
          const books = (await listCatalogBooks(false))
            .filter((book) => book.published && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.slug))
            .sort((a, b) => a.sort_order - b.sort_order)
            .slice(0, 24)
            .map((book) => ({
              slug: book.slug,
              title: book.title,
              subtitle: book.subtitle,
              category: book.category,
              description: book.blurb,
              cover_url: book.cover_url.startsWith("/")
                ? LIBRARY_ORIGIN + book.cover_url
                : book.cover_url.startsWith("https://") ? book.cover_url : "",
              url: LIBRARY_ORIGIN + "/" + encodeURIComponent(book.slug),
            }));
          return Response.json(
            { version: 1, books },
            { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600", "X-Content-Type-Options": "nosniff", "Access-Control-Allow-Origin": "*" } },
          );
        } catch (error) {
          console.error("[portfolio-books] Could not load public catalogue", error);
          return Response.json({ error: "Public catalogue temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
        }
      },
    },
  },
});

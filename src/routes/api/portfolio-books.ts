import { createFileRoute } from "@tanstack/react-router";
import { listCatalogBooks } from "@/lib/catalog";
import { serializePortfolioBooks } from "@/lib/portfolio-feed";

export const Route = createFileRoute("/api/portfolio-books")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // The portfolio receives only metadata already approved for the public shelf.
          // Never expose page images, user records, unpublished drafts, or entitlement data.
          const books = serializePortfolioBooks(await listCatalogBooks(false));
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

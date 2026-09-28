import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { listBooks } from "@/lib/server/platform";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/library/")({
  loader: () => listBooks(),
  head: () => ({
    meta: [
      { title: SITE.libraryTitle },
      { name: "description", content: SITE.libraryDescription },
    ],
  }),
  component: Library,
});

type LibraryBooks = Awaited<ReturnType<typeof listBooks>>;

export function LibraryCatalogContent({ books }: { books: LibraryBooks }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const categories = useMemo(
    () => ["All", ...new Set(books.map((book) => book.category).filter(Boolean))],
    [books],
  );
  const filtered = useMemo(() => {
    return books.filter((b) => {
      const hay = `${b.title} ${b.subtitle} ${b.description} ${b.category}`.toLowerCase();
      const okQ = !q || hay.includes(q.toLowerCase());
      const okC = cat === "All" || b.category === cat;
      return okQ && okC;
    });
  }, [books, q, cat]);

  return (
    <Shell library>
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
            The Trading Library
          </p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">
            Trading books for synthetic indices traders.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Browse the shelf, filter by market, and open any title to view reading access,
            pricing, and member options.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by title, topic, or market"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`h-10 rounded-md px-3 text-sm ${cat === c ? "bg-navy text-navy-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No title matches that search yet. Try another keyword or category.
          </p>
        ) : (
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BookCard key={b.slug} book={b} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Library() {
  const books = Route.useLoaderData() as LibraryBooks;
  return <LibraryCatalogContent books={books} />;
}

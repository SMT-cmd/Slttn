import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { listBooks } from "@/lib/server/platform";
import { CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/library/")({
  loader: () => listBooks(),
  component: Library,
});

function Library() {
  const books = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
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
      <div className="bg-[var(--hero-wash)]">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
            The Trading Library
          </p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">Newest on the shelf</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Default order is newest first. Filter by desk, or search a title. Click a cover
            to see pricing — or open the reader if your coupon is already active.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search the library"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...CATEGORIES].map((c) => (
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
            Nothing on that shelf yet. Try another filter.
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

import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";
import type { BookRow } from "@/lib/server/platform";
import { libraryBookHref, useSiteContext } from "@/lib/site-context";

export function BookCard({ book }: { book: BookRow }) {
  const price = book.online_price_cents / 100;
  const siteContext = useSiteContext();
  return (
    <a href={libraryBookHref(book.slug, siteContext)} className="group block">
      <div className="book-3d overflow-hidden rounded-sm bg-card">
        <img
          src={book.cover_url}
          alt={book.title}
          className="aspect-[2/3] w-full object-cover"
        />
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex items-center gap-2">
          <Badge tone="muted">{book.category}</Badge>
          {book.launch_mode === "prelaunch" ? <Badge tone="green">Pre-launch</Badge> : null}
        </div>
        <h3 className="font-display text-2xl leading-tight group-hover:text-primary">
          {book.title}{" "}
          <span className="text-profit">{book.subtitle}</span>
        </h3>
        <p className="text-sm text-muted-foreground">From {formatMoney(price)} to read online</p>
      </div>
    </a>
  );
}

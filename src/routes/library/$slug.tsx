import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBook } from "@/lib/server/platform";
import { formatMoney } from "@/lib/utils";
import { PRICING } from "@/lib/site";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/library/$slug")({
  loader: ({ params }) => getBook({ data: { slug: params.slug } }),
  component: BookPage,
});

function BookPage() {
  const book = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  if (!book) {
    return (
      <Shell library>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-display text-4xl">That title is not on the shelf.</h1>
          <Button asChild variant="navy" className="mt-6">
            <Link to="/library">Back to the library</Link>
          </Button>
        </div>
      </Shell>
    );
  }
  const online = book.online_price_cents / 100;
  const launched = book.launch_mode === "launch";
  const dl =
    launched
      ? book.download_public_cents / 100
      : book.download_prelaunch_cents / 100;

  function goRead() {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    navigate({ to: "/library/read/$slug", params: { slug: book.slug } });
  }

  return (
    <Shell library>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <img
          src={book.cover_url}
          alt=""
          className="book-3d mx-auto w-full max-w-sm"
        />
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{book.category}</Badge>
            <Badge tone={launched ? "navy" : "green"}>
              {launched ? "Launch" : "Pre-launch"}
            </Badge>
            <Badge tone="muted">Series {book.series_no}</Badge>
            <Badge tone="muted">{book.page_count} image pages</Badge>
          </div>
          <h1 className="mt-4 font-display text-5xl">
            {book.title} <span className="text-profit">{book.subtitle}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {book.author} · {book.size === "short" ? "Short handbook" : book.size === "full" ? "Full guide" : "Medium book"}
          </p>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{book.description}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Online reading</p>
              <p className="mt-2 font-display text-3xl">{formatMoney(online)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tagged members with a valid coupon read immediately. First {3} pages are a
                sample for everyone who is signed in.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Download</p>
              <p className="mt-2 font-display text-3xl">{formatMoney(dl)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Always paid — {formatMoney(PRICING.downloadPrelaunch)} in pre-launch,{" "}
                {formatMoney(PRICING.downloadPublic)} after launch. Never free.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="navy" size="lg" onClick={goRead} disabled={isPending}>
              Open the reader
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/checkout" search={{ slug: book.slug }}>
                See payment options
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Every uploaded page image is watermarked with your name and CR or email in the
            reader. Sample access shows only the opening pages until the title is unlocked.
          </p>
        </div>
      </div>
    </Shell>
  );
}

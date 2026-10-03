import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBook, type BookRow } from "@/lib/server/platform";
import {
  libraryHomeHref,
  libraryReaderHref,
  marketingHref,
  useSiteContext,
} from "@/lib/site-context";
import { bookPageDescription, bookPageTitle, PRICING, SITE } from "@/lib/site";
import { formatMoney } from "@/lib/utils";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/library/$slug")({
  loader: ({ params }) => getBook({ data: { slug: params.slug } }),
  head: ({ loaderData }) =>
    getBookPageHead(loaderData, {
      shareUrl: loaderData ? `${SITE.libraryUrl}/${loaderData.slug}` : SITE.libraryUrl,
      canonicalUrl: loaderData ? `${SITE.libraryUrl}/${loaderData.slug}` : SITE.libraryUrl,
    }),
  component: BookPage,
});

export function BookPage() {
  // Shared by /$slug and /library/$slug — must not bind to one Route id
  const book = useLoaderData({ strict: false }) as BookRow | null | undefined;
  const { user, isPending } = useCurrentUserState();
  const siteContext = useSiteContext();

  if (!book) {
    return (
      <Shell library>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-display text-4xl">That title is not on the shelf.</h1>
          <Button asChild variant="navy" className="mt-6">
            <a href={libraryHomeHref(siteContext)}>Back to the library</a>
          </Button>
        </div>
      </Shell>
    );
  }
  const online = book.online_price_cents / 100;
  const launched = book.launch_mode !== "prelaunch";
  const dl =
    launched
      ? book.download_public_cents / 100
      : book.download_prelaunch_cents / 100;

  function goRead() {
    if (!book) return;

    // Always use an absolute reader URL so OAuth callback can return across main/library hosts.
    const readerUrl = libraryReaderHref(book.slug, siteContext);
    const absoluteReader =
      readerUrl.startsWith("http://") || readerUrl.startsWith("https://")
        ? readerUrl
        : `${siteContext.origin}${readerUrl.startsWith("/") ? readerUrl : `/${readerUrl}`}`;
    if (!user) {
      // Prefer same-host login; session cookies are shared on .slttradehub.trade in production.
      const loginBase = siteContext.isLibraryHost
        ? "/login"
        : marketingHref("/login", siteContext);
      window.location.assign(`${loginBase}?next=${encodeURIComponent(absoluteReader)}`);
      return;
    }

    window.location.assign(absoluteReader);
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
              <a href={`${marketingHref("/checkout", siteContext)}?slug=${encodeURIComponent(book.slug)}`}>
                See payment options
              </a>
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

type BookHeadOptions = {
  canonicalUrl?: string;
  noIndex?: boolean;
  shareUrl?: string;
};

export function getBookPageHead(
  book: BookRow | null | undefined,
  options: BookHeadOptions = {},
) {
  if (!book) {
    return {
      meta: [
        { title: "Book Not Found | The Trading Library" },
        { name: "description", content: "The requested title is not currently available." },
      ],
    };
  }

  const title = bookPageTitle(book.title, book.subtitle);
  const description = bookPageDescription(book.description);
  const shareUrl = options.shareUrl ?? `${SITE.libraryUrl}/${book.slug}`;
  const canonicalUrl = options.canonicalUrl ?? shareUrl;
  const imageUrl = toAbsoluteUrl(book.cover_url, SITE.libraryUrl);
  const imageType = inferImageMimeType(imageUrl);
  const imageAlt = `${book.title} cover`;
  const robots = options.noIndex
    ? "noindex,nofollow,max-image-preview:large"
    : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { property: "og:type", content: "book" },
      { property: "og:site_name", content: SITE.library },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: shareUrl },
      { property: "og:image", content: imageUrl },
      { property: "og:image:secure_url", content: imageUrl },
      { property: "og:image:type", content: imageType },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "1600" },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:url", content: shareUrl },
      { name: "twitter:image", content: imageUrl },
      { name: "twitter:image:alt", content: imageAlt },
    ],
    links: [{ rel: "canonical", href: canonicalUrl }],
  };
}

function toAbsoluteUrl(value: string | null | undefined, origin: string) {
  if (!value) {
    return `${origin}${SITE.ogImagePath}`;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const path = value.startsWith("/") ? value : `/${value}`;
  return `${origin}${path}`;
}

function inferImageMimeType(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

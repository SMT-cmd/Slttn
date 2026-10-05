import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { acceptTos, getBook, logPage, readerPayload } from "@/lib/server/platform";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SITE } from "@/lib/site";
import { libraryBookHref, libraryHomeHref, useSiteContext } from "@/lib/site-context";
import { getBookPageHead } from "./$slug";

export const Route = createFileRoute("/library/read/$slug")({
  loader: ({ params }) => getBook({ data: { slug: params.slug } }),
  head: ({ loaderData }) =>
    getBookPageHead(loaderData, {
      shareUrl: loaderData
        ? `${SITE.libraryUrl}/read/${loaderData.slug}`
        : `${SITE.libraryUrl}/read`,
      canonicalUrl: loaderData ? `${SITE.libraryUrl}/${loaderData.slug}` : SITE.libraryUrl,
      noIndex: true,
    }),
  component: Reader,
});

export function Reader() {
  // Shared by /read/$slug and /library/read/$slug — must not bind to one Route id
  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug ?? "";
  const { user, isPending } = useCurrentUserState();
  const siteContext = useSiteContext();
  const [data, setData] = useState<Awaited<ReturnType<typeof readerPayload>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [tos, setTos] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [turnDirection, setTurnDirection] = useState<"next" | "previous">("next");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 0 });

  useEffect(() => {
    if (isPending || !user || !slug) return;
    setError(null);
    setData(null);
    let cancelled = false;
    readerPayload({ data: { slug } })
      .then(async (d) => {
        if (!d?.profile) throw new Error("Your reader profile is still being prepared. Please reopen the book.");
        setPreloadProgress({ loaded: 0, total: d.pages.length });
        // Decode every accessible page before presenting the reader. Page turns
        // then swap already-decoded bitmaps instead of flashing a blank page
        // while the next Cloudinary image downloads.
        await Promise.all(
          d.pages.map(
            (bookPage) =>
              new Promise<void>((resolve) => {
                const image = new Image();
                const finish = () => {
                  if (!cancelled) setPreloadProgress((current) => ({ ...current, loaded: current.loaded + 1 }));
                  resolve();
                };
                image.onload = () => { void image.decode().catch(() => undefined).finally(finish); };
                image.onerror = finish;
                image.src = bookPage.image_url;
              }),
          ),
        );
        if (cancelled) return;
        const maxPageIndex = Math.max(d.pages.length - 1, 0);
        const nextPage = Math.min(Math.max(d.resumePageIndex ?? 0, 0), maxPageIndex);
        setPage(nextPage);
        setData(d);
        setTos(!d.profile.tos_accepted_at);
        setHasAcceptedTerms(false);
      })
      .catch((e: unknown) =>
        { if (!cancelled) setError(e instanceof Error ? e.message : "We could not open this book."); },
      );
    return () => { cancelled = true; };
  }, [isPending, user, slug]);

  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { setTurnDirection("next"); setPage((p) => Math.min(p + 1, data.pages.length - 1)); }
      if (e.key === "ArrowLeft") { setTurnDirection("previous"); setPage((p) => Math.max(p - 1, 0)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  useEffect(() => {
    if (!data || !data.pages[page]) return;
    logPage({ data: { slug, pageIndex: page } }).catch(() => undefined);
  }, [data, page, slug]);

  if (isPending) {
    return <div className="grid min-h-dvh place-items-center text-muted-foreground">Opening the desk…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (error) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <h1 className="font-display text-3xl">{error}</h1>
          <Button asChild variant="navy" className="mt-6">
            <a href={libraryHomeHref(siteContext)}>Back to the library</a>
          </Button>
        </div>
      </div>
    );
  }
  if (!data) {
    return <div className="grid min-h-dvh place-items-center bg-navy px-6 text-center text-navy-foreground"><div><p className="font-display text-3xl">Preparing your book…</p><p className="mt-2 text-sm text-navy-foreground/70">{preloadProgress.total ? `Loading page ${Math.min(preloadProgress.loaded + 1, preloadProgress.total)} of ${preloadProgress.total}` : "Checking your access"}</p><div className="mx-auto mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white transition-[width] duration-300" style={{ width: preloadProgress.total ? `${(preloadProgress.loaded / preloadProgress.total) * 100}%` : "8%" }} /></div></div></div>;
  }

  const current = data.pages[page];
  if (!current) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <h1 className="font-display text-3xl">This title has no readable pages yet.</h1>
          <Button asChild variant="navy" className="mt-6">
            <a href={libraryHomeHref(siteContext)}>Back to the library</a>
          </Button>
        </div>
      </div>
    );
  }
  const showLock = data.lockedFrom !== null && page === data.pages.length - 1;

  async function proceedPastTerms() {
    if (acceptingTerms) return;
    setAcceptingTerms(true);
    try {
      await acceptTos();
      setHasAcceptedTerms(true);
      setTos(false);
    } catch (error) {
      setHasAcceptedTerms(false);
      toast.error(error instanceof Error ? error.message : "We could not record your acceptance. Please try again.");
    } finally {
      setAcceptingTerms(false);
    }
  }

  return (
    <div
      className="no-select min-h-dvh bg-navy text-navy-foreground"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Dialog open={tos}>
        <DialogContent className="[&>button]:hidden">
          <DialogTitle>Before you read</DialogTitle>
          <DialogDescription>
            These pages are watermarked with your name and CR or email. Copying, sharing,
            or screenshots can be traced back to this account. You also accept the Terms
            of Service. This is education, not financial advice.
          </DialogDescription>
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-3 text-sm leading-6 text-foreground">
            <input
              type="checkbox"
              checked={hasAcceptedTerms}
              disabled={acceptingTerms}
              onChange={(event) => {
                const checked = event.target.checked;
                setHasAcceptedTerms(checked);
                if (checked) {
                  void proceedPastTerms();
                }
              }}
              className="mt-1 size-4 rounded border border-border accent-[var(--color-navy)]"
            />
            <span>
              I have read and accepted the{" "}
              <Link to="/terms" className="underline">
                terms and conditions
              </Link>
            </span>
          </label>
          <Button
            variant="navy"
            className="mt-4 w-full"
            disabled={!hasAcceptedTerms || acceptingTerms}
            onClick={() => {
              void proceedPastTerms();
            }}
          >
            {acceptingTerms ? "Opening your book…" : "I accept the terms"}
          </Button>
          <Link to="/terms" className="mt-2 block text-center text-sm underline">
            Read the terms
          </Link>
        </DialogContent>
      </Dialog>

      <header className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <a href={libraryBookHref(slug, siteContext)} className="hover:underline">
          Close reader
        </a>
        <p className="truncate font-display text-lg">
          {data.book.title} {data.book.subtitle}
        </p>
        <p className="text-navy-foreground/70">
          {data.totalPages === 0 ? "No pages" : `${page + 1} / ${data.totalPages}`}
        </p>
      </header>

      <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-3xl place-items-center px-3 py-6"
        onTouchStart={(event) => setTouchStart(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStart === null) return;
          const distance = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
          if (distance < -55) { setTurnDirection("next"); setPage((p) => Math.min(data.pages.length - 1, p + 1)); }
          if (distance > 55) { setTurnDirection("previous"); setPage((p) => Math.max(0, p - 1)); }
          setTouchStart(null);
        }}>
        {current ? (
          <article key={current.id} className={`page-turn page-turn-${turnDirection} relative z-10 w-full overflow-hidden rounded-md bg-paper shadow-[var(--shadow)]`}>
            <img
              src={current.image_url}
              alt={`${data.book.title} page ${page + 1}`}
              className="block w-full select-none"
              loading="eager"
              decoding="sync"
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/4 via-transparent to-black/8" />
            <div className="reader-watermarks pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <p className="reader-watermark reader-watermark-top">{data.watermark}</p>
              <p className="reader-watermark reader-watermark-bottom">{data.watermark}</p>
            </div>
            <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-black/45 px-4 py-3 text-[11px] tracking-[0.2em] text-white/80 uppercase">
              <span>{data.book.author}</span>
              <span>Page {page + 1}</span>
            </div>
            {showLock ? (
              <div className="absolute inset-x-4 bottom-4 rounded-md border border-white/15 bg-black/72 p-4 text-white shadow-lg backdrop-blur-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Lock className="size-4" /> The rest of this book is locked
                </p>
                <p className="mt-1 text-sm text-white/75">
                  Sample pages end here. Tagged members can generate a coupon. Everyone else
                  can buy online access.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="navy">
                    <Link to="/account">Get a coupon</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/checkout" search={{ slug }}>
                      See pricing
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </article>
        ) : (
          <div className="relative z-10 w-full rounded-md border border-white/10 bg-white/5 p-8 text-center text-white/70">
            No page images have been uploaded for this title yet.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pb-6">
        <Button
          variant="outline"
          className="border-white/20 bg-transparent text-navy-foreground"
          disabled={page === 0}
          onClick={() => { setTurnDirection("previous"); setPage((p) => Math.max(0, p - 1)); }}
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button
          variant="outline"
          className="border-white/20 bg-transparent text-navy-foreground"
          disabled={page >= data.pages.length - 1}
          onClick={() => { setTurnDirection("next"); setPage((p) => Math.min(data.pages.length - 1, p + 1)); }}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

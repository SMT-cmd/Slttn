import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { acceptTos, logPage, readerPayload } from "@/lib/server/platform";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/library/read/$slug")({
  component: Reader,
});

function Reader() {
  const { slug } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<Awaited<ReturnType<typeof readerPayload>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [tos, setTos] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    readerPayload({ data: { slug } })
      .then((d) => {
        setData(d);
        setTos(!d.profile.tos_accepted_at);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "We could not open this book."),
      );
  }, [isPending, user, slug]);

  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, data.pages.length - 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  useEffect(() => {
    if (!data) return;
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
            <Link to="/library">Back to the library</Link>
          </Button>
        </div>
      </div>
    );
  }
  if (!data) {
    return <div className="grid min-h-dvh place-items-center text-muted-foreground">Setting the page…</div>;
  }

  const current = data.pages[page];
  const showLock = data.lockedFrom !== null && page === data.pages.length - 1;
  const watermarkRows = [
    "top-1/4",
    "top-1/2",
    "top-3/4",
  ];

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
          <Button
            variant="navy"
            className="mt-4 w-full"
            onClick={async () => {
              await acceptTos();
              setTos(false);
            }}
          >
            I accept the terms
          </Button>
          <Link to="/terms" className="mt-2 block text-center text-sm underline">
            Read the terms
          </Link>
        </DialogContent>
      </Dialog>

      <header className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <Link to="/library/$slug" params={{ slug }} className="hover:underline">
          Close reader
        </Link>
        <p className="truncate font-display text-lg">
          {data.book.title} {data.book.subtitle}
        </p>
        <p className="text-navy-foreground/70">
          {data.totalPages === 0 ? "No pages" : `${page + 1} / ${data.totalPages}`}
        </p>
      </header>

      <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-3xl place-items-center px-3 py-6">
        {current ? (
          <article className="page-flip relative z-10 w-full overflow-hidden rounded-md bg-paper shadow-[var(--shadow)]">
            <img
              src={current.image_url}
              alt={`${data.book.title} page ${page + 1}`}
              className="block w-full select-none"
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/4 via-transparent to-black/8" />
            {watermarkRows.map((topClass, index) => (
              <p
                key={`${topClass}-${index}`}
                className={`pointer-events-none absolute inset-x-6 ${topClass} rotate-[-18deg] text-center text-sm tracking-[0.28em] text-white/18 uppercase sm:text-base`}
              >
                {data.watermark}
              </p>
            ))}
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
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button
          variant="outline"
          className="border-white/20 bg-transparent text-navy-foreground"
          disabled={page >= data.pages.length - 1}
          onClick={() => setPage((p) => Math.min(data.pages.length - 1, p + 1))}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

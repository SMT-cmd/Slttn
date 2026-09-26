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
          {page + 1} / {data.totalPages}
        </p>
      </header>

      <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-3xl place-items-center px-3 py-6">
        <div className="watermark absolute inset-0 opacity-90" />
        <p className="pointer-events-none absolute inset-x-8 top-1/3 rotate-[-18deg] text-center text-sm tracking-[0.2em] text-white/15 uppercase">
          {data.watermark}
        </p>
        {current ? (
          <article className="page-flip relative z-10 w-full rounded-md bg-paper p-8 text-ink shadow-[var(--shadow)] sm:p-12">
            <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              The Trading Library · {data.book.author}
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl">{current.heading}</h1>
            <div className="mt-6 space-y-4 text-[1.02rem] leading-7">
              {current.body.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            {current.bullets ? (
              <ul className="mt-5 list-disc space-y-1 pl-5 text-sm">
                {current.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
            {current.note ? (
              <aside
                className={`mt-6 rounded-md border p-4 text-sm ${
                  current.note.tone === "green"
                    ? "border-profit/30 bg-mint"
                    : current.note.tone === "red"
                      ? "border-loss/30 bg-loss/8"
                      : "border-navy/20 bg-muted"
                }`}
              >
                <p className="text-xs tracking-[0.16em] uppercase">{current.note.title}</p>
                <p className="mt-1">{current.note.text}</p>
              </aside>
            ) : null}
            {showLock ? (
              <div className="mt-8 rounded-md border border-border bg-muted p-4">
                <p className="flex items-center gap-2 font-medium">
                  <Lock className="size-4" /> The rest of this book is locked
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
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
        ) : null}
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



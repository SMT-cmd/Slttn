import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
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
import {
  TURN_FINISH_MS, TURN_RETURN_MS, cornerCurl, finishTurnDuration, leafAngle,
  resolveTurnDirection, shouldCompleteTurn, turnProgressFromDrag,
  type TurnDirection,
} from "@/lib/reader/page-turn";

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

type ReaderTurn = {
  from: number;
  to: number;
  direction: TurnDirection;
  phase: "dragging" | "finishing" | "returning";
  progress: number;
  gripY: number;
  durationMs?: number;
};

type ReaderGesture = {
  pointerId: number;
  startX: number;
  startedAt: number;
  width: number;
  gripY: number;
  initialDirection: TurnDirection;
};

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
  const [turn, setTurn] = useState<ReaderTurn | null>(null);
  const turnRef = useRef<ReaderTurn | null>(null);
  const gestureRef = useRef<ReaderGesture | null>(null);
  const setActiveTurn = useCallback((value: ReaderTurn | null) => {
    turnRef.current = value;
    setTurn(value);
  }, []);
  const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 0 });

  useEffect(() => {
    if (isPending || !user || !slug) return;
    setError(null);
    setData(null);
    let cancelled = false;
    readerPayload({ data: { slug } })
      .then(async (d) => {
        if (!d?.profile) throw new Error("Your reader profile is still being prepared. Please reopen the book.");
        // Decode only the resumed page before opening, not the entire book.
        setPreloadProgress({ loaded: 0, total: 1 });
        const resume = Math.min(Math.max(d.resumePageIndex ?? 0, 0), Math.max(d.pages.length - 1, 0));
        const firstPage = d.pages[resume];
        if (firstPage) {
          await new Promise<void>((resolve) => {
            const image = new Image();
            image.onload = () => { void image.decode().catch(() => undefined).finally(resolve); };
            image.onerror = () => resolve();
            image.src = firstPage.image_url;
          });
        }
        if (cancelled) return;
        setPreloadProgress({ loaded: 1, total: 1 });
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

  const reducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const turnPage = useCallback((direction: TurnDirection) => {
    if (!data || turnRef.current || gestureRef.current || tos) return;
    const to = page + (direction === "next" ? 1 : -1);
    if (to < 0 || to >= data.pages.length) return;
    if (reducedMotion()) {
      setPage(to);
      return;
    }
    const initial: ReaderTurn = {
      from: page, to, direction, phase: "dragging", progress: 0, gripY: 0.5,
    };
    setActiveTurn(initial);
    // Paint the first face before animating; otherwise React may batch the
    // start and end frames, which made the old flip appear instantaneous.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (turnRef.current === initial) {
        setActiveTurn({ ...initial, phase: "finishing", progress: 1, durationMs: TURN_FINISH_MS });
      }
    }));
  }, [data, page, setActiveTurn, tos]);

  useEffect(() => {
    if (!turn || turn.phase === "dragging") return;
    const finishing = turn.phase === "finishing";
    const timeout = window.setTimeout(() => {
      if (finishing) setPage(turn.to);
      setActiveTurn(null);
    }, finishing ? (turn.durationMs ?? TURN_FINISH_MS) : TURN_RETURN_MS);
    return () => window.clearTimeout(timeout);
  }, [turn?.phase, turn?.to, turn?.durationMs, setActiveTurn]);

  function onReaderPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (!data || tos || turnRef.current || gestureRef.current || !event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest("a, button, input, textarea, select, [role='button']")) return;

    const canNext = page < data.pages.length - 1;
    const canPrevious = page > 0;
    if (!canNext && !canPrevious) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pointerX = event.clientX - rect.left;
    const gripY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    let initialDirection: TurnDirection = pointerX >= rect.width * 0.5 ? "next" : "previous";
    if (initialDirection === "next" && !canNext) initialDirection = "previous";
    if (initialDirection === "previous" && !canPrevious) initialDirection = "next";

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startedAt: performance.now(),
      width: rect.width,
      gripY,
      initialDirection,
    };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* capture may already be lost */ }
    if (!reducedMotion()) {
      const to = page + (initialDirection === "next" ? 1 : -1);
      setActiveTurn({ from: page, to, direction: initialDirection, phase: "dragging", progress: 0.075, gripY });
    }
  }

  function onReaderPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || !data || reducedMotion()) return;
    const deltaX = event.clientX - gesture.startX;
    const direction = resolveTurnDirection(
      deltaX, gesture.initialDirection,
      page < data.pages.length - 1, page > 0,
    );
    if (!direction) {
      if (turnRef.current?.progress !== 0) {
        setActiveTurn({ ...turnRef.current!, progress: 0 });
      }
      return;
    }
    const next: ReaderTurn = {
      from: page,
      to: page + (direction === "next" ? 1 : -1),
      direction,
      phase: "dragging",
      progress: Math.max(0.075, turnProgressFromDrag(deltaX, gesture.width)),
      gripY: gesture.gripY,
    };
    setActiveTurn(next);
  }

  function onReaderPointerUp(event: ReactPointerEvent<HTMLElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch { /* capture already released */ }
    if (!data) { setActiveTurn(null); return; }
    const deltaX = event.clientX - gesture.startX;
    const direction = resolveTurnDirection(
      deltaX, gesture.initialDirection,
      page < data.pages.length - 1, page > 0,
    );
    const complete = direction && shouldCompleteTurn(deltaX, gesture.width, performance.now() - gesture.startedAt);
    if (complete && direction) {
      const to = page + (direction === "next" ? 1 : -1);
      if (reducedMotion()) {
        setActiveTurn(null);
        setPage(to);
      } else {
        const progress = Math.max(turnRef.current?.direction === direction ? turnRef.current.progress : 0, 0.075);
        setActiveTurn({ from: page, to, direction, gripY: gesture.gripY, progress, phase: "dragging" });
        requestAnimationFrame(() => {
          if (turnRef.current?.phase === "dragging" && turnRef.current.to === to) {
            setActiveTurn({ from: page, to, direction, gripY: gesture.gripY, progress: 1, phase: "finishing", durationMs: finishTurnDuration(progress) });
          }
        });
      }
    } else if (turnRef.current) {
      setActiveTurn({ ...turnRef.current, phase: "returning", progress: 0 });
    }
  }

  function onReaderPointerCancel(event: ReactPointerEvent<HTMLElement>) {
    if (gestureRef.current?.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    if (turnRef.current) setActiveTurn({ ...turnRef.current, phase: "returning", progress: 0 });
  }

  useEffect(() => {
    if (!data) return;
    [page - 1, page + 1].forEach((index) => {
      const url = data.pages[index]?.image_url;
      if (url) {
        const image = new Image();
        image.src = url;
        image.onload = () => { void image.decode().catch(() => undefined); };
      }
    });
  }, [data, page]);

  useEffect(() => {
    if (!data) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") turnPage("next");
      if (event.key === "ArrowLeft") turnPage("previous");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, turnPage]);

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

      <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-3xl place-items-center px-3 py-6">
        {current ? (
          <article
            key={current.id}
            className="reader-page relative z-10 w-full overflow-hidden rounded-md bg-paper shadow-[var(--shadow)]"
            aria-label="Book page. Swipe left or right, or drag the page to turn."
            onPointerDown={onReaderPointerDown}
            onPointerMove={onReaderPointerMove}
            onPointerUp={onReaderPointerUp}
            onPointerCancel={onReaderPointerCancel}
            onLostPointerCapture={onReaderPointerCancel}
          >
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
            {turn && (() => {
              const curl = cornerCurl(turn.gripY, turn.progress);
              const leafStyle = {
                transform: `rotateY(${leafAngle(turn.direction, turn.progress)}deg)`,
                transition: turn.phase === "dragging"
                  ? "none"
                  : `transform ${turn.phase === "finishing" ? (turn.durationMs ?? TURN_FINISH_MS) : TURN_RETURN_MS}ms ${turn.phase === "finishing" ? "cubic-bezier(.19,.72,.19,1)" : "cubic-bezier(.24,.74,.28,1)"}`,
                "--curl-top": `${curl.top}px`,
                "--curl-bottom": `${curl.bottom}px`,
                "--fold-strength": `${Math.sin(Math.PI * turn.progress)}`,
              } as CSSProperties;
              return (
                <div className="reader-flip-stage pointer-events-none absolute inset-0 z-30" aria-hidden="true">
                  <img src={data.pages[turn.to]?.image_url} alt="" className="reader-flip-under" draggable={false} />
                  <div className="reader-flip-under-shade" />
                  <div className={`reader-flip-leaf reader-flip-${turn.direction}`} style={leafStyle}>
                    <div className="reader-flip-side reader-flip-front">
                      <img src={data.pages[turn.direction === "next" ? turn.from : turn.to]?.image_url} alt="" draggable={false} />
                      <div className="reader-flip-ink-shadow" />
                      <div className="reader-flip-crease" />
                    </div>
                    <div className="reader-flip-side reader-flip-back">
                      <img src={data.pages[turn.direction === "next" ? turn.to : turn.from]?.image_url} alt="" draggable={false} />
                      <div className="reader-flip-ink-shadow" />
                      <div className="reader-flip-crease" />
                    </div>
                  </div>
                  <div className="reader-watermarks pointer-events-none absolute inset-0 z-40 overflow-hidden">
                    <p className="reader-watermark reader-watermark-top">{data.watermark}</p>
                    <p className="reader-watermark reader-watermark-bottom">{data.watermark}</p>
                  </div>
                </div>
              );
            })()}
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
          disabled={page === 0 || Boolean(turn)}
          onClick={() => turnPage("previous")}
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button
          variant="outline"
          className="border-white/20 bg-transparent text-navy-foreground"
          disabled={page >= data.pages.length - 1 || Boolean(turn)}
          onClick={() => turnPage("next")}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Shield,
  Sparkles,
  Users,
  ArrowRight,
  MessageCircle,
  Bot,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { CandleStrip } from "@/components/candles";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { listBooks } from "@/lib/server/platform";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => listBooks(),
  component: Home,
});

const BENEFITS = [
  {
    icon: BookOpen,
    title: "A real library, not a folder of PDFs",
    text: "Designed covers, a proper reader, and books written as a series — not recycled threads.",
  },
  {
    icon: Shield,
    title: "Access that respects the partnership",
    text: "Tagged SLT members get member pricing and coupons. Everyone else pays the listed rate.",
  },
  {
    icon: Users,
    title: "A room that stays serious",
    text: "Telegram, WhatsApp, and signal bots for people who already treat this as work.",
  },
  {
    icon: Sparkles,
    title: "Always-on markets, written clearly",
    text: "Volatility, Boom & Crash, Step, Jump, Range — without folklore and without gold-leaf hype.",
  },
];

const STEPS = [
  { n: "01", t: "Sign in", d: "Google, X, or email. Then link your Deriv CR if you have one." },
  { n: "02", t: "Confirm access", d: "Tagged members generate a coupon. Everyone else chooses a book or a pass." },
  { n: "03", t: "Read at the desk", d: "Open the online reader. Every page is watermarked to you." },
  { n: "04", t: "Stay in the room", d: "Join the community and the bots after you have a process, not before." },
];

const QUOTES = [
  {
    q: "The lot-size chapter is the first time someone explained Crash without selling me a signal.",
    n: "Adewale K.",
    r: "Lagos · V75 & Crash 500",
  },
  {
    q: "I stopped chasing Boom spikes after the timing chapter. Quiet weeks started paying.",
    n: "Chioma O.",
    r: "Abuja · Boom 1000",
  },
  {
    q: "It reads like a desk manual, not a guru funnel. That is why I stayed.",
    n: "Ibrahim S.",
    r: "Accra · Step Index",
  },
  {
    q: "The watermarked reader is annoying in the right way. I treat the books like they cost something.",
    n: "Naledi M.",
    r: "Johannesburg · Jump 25",
  },
];

function Home() {
  const books = Route.useLoaderData();

  return (
    <Shell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[var(--hero-wash)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="rise text-xs tracking-[0.22em] text-muted-foreground uppercase">
              A complete trading library
            </p>
            <h1 className="rise rise-2 mt-4 font-display text-5xl font-semibold text-navy dark:text-foreground sm:text-6xl lg:text-7xl">
              Become the trader who still has an account.
            </h1>
            <p className="rise rise-3 mt-5 max-w-xl text-lg text-muted-foreground">
              Exclusive books, a watermarked desk reader, and a community for synthetic
              indices — Volatility, Boom & Crash, Step, Jump, Range. Written by{" "}
              {SITE.author}.
            </p>
            <div className="rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="navy" size="lg">
                <Link to="/library">
                  Enter The Trading Library <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/community">Join the Community</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-xl bg-mint px-4 py-8">
              <CandleStrip className="h-36" />
            </div>
            <img
              src="/covers/synthetic-indices-101.png"
              alt="Synthetic Indices 101"
              className="book-3d absolute -bottom-8 right-4 hidden w-40 sm:block lg:w-52"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">What this is</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl sm:text-5xl">
          SLT Trade Hub is a trading desk with a library attached.
        </h2>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          We publish books for people who already know the chart can hurt them. No
          recycled gold-and-black funnels. Navy, paper, green, red — the colours the
          market actually uses. {SITE.tagline}.
        </p>
      </section>

      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto flex max-w-6xl items-end justify-between px-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">The Trading Library</p>
            <h2 className="mt-2 font-display text-4xl">The shelf</h2>
          </div>
          <Link to="/library" className="hidden text-sm font-medium text-primary sm:inline">
            Browse all titles
          </Link>
        </div>
        <div className="mt-8 overflow-hidden">
          <div className="marquee px-4">
            {(books ?? []).concat(books ?? []).map((b, i) => (
              <img
                key={`${b.slug}-${i}`}
                src={b.cover_url}
                alt={b.title}
                className="h-64 w-auto rounded-sm shadow-[var(--shadow)]"
              />
            ))}
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {(books ?? []).slice(0, 4).map((b) => (
            <BookCard key={b.slug} book={b} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Why join</p>
        <h2 className="mt-2 font-display text-4xl">What you actually get</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-card p-6">
              <b.icon className="size-5 text-primary" />
              <h3 className="mt-4 font-display text-2xl">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy py-20 text-navy-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs tracking-[0.2em] text-navy-foreground/60 uppercase">How it works</p>
          <h2 className="mt-2 font-display text-4xl">Four quiet steps</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n}>
                <p className="font-display text-3xl text-primary">{s.n}</p>
                <h3 className="mt-2 text-lg font-medium">{s.t}</h3>
                <p className="mt-2 text-sm text-navy-foreground/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Community & bots</p>
        <h2 className="mt-2 font-display text-4xl">Stay in the room</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a
            href={SITE.telegram}
            className="rounded-xl border border-border bg-card p-6 hover:border-primary"
          >
            <MessageCircle className="size-5 text-primary" />
            <h3 className="mt-3 font-display text-2xl">Telegram</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The main room for SLT members. Process talk, not miracle screenshots.
            </p>
          </a>
          <a
            href={SITE.whatsapp}
            className="rounded-xl border border-border bg-card p-6 hover:border-primary"
          >
            <Users className="size-5 text-profit" />
            <h3 className="mt-3 font-display text-2xl">WhatsApp</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Faster pings for session notes and desk reminders.
            </p>
          </a>
          <div className="rounded-xl border border-border bg-card p-6">
            <Bot className="size-5 text-loss" />
            <h3 className="mt-3 font-display text-2xl">Signal bots</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional alerts. They do not replace the books, the size, or your stop.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-mint/60 py-16 dark:bg-muted">
        <div className="mx-auto max-w-6xl overflow-hidden px-4">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">From the desk</p>
          <div className="marquee mt-8 items-stretch">
            {QUOTES.concat(QUOTES).map((t, i) => (
              <blockquote
                key={i}
                className="w-[min(80vw,22rem)] shrink-0 rounded-xl border border-border bg-card p-6"
              >
                <p className="font-display text-2xl leading-snug">“{t.q}”</p>
                <footer className="mt-4 text-sm text-muted-foreground">
                  {t.n} · {t.r}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-xl bg-navy px-6 py-14 text-center text-navy-foreground sm:px-12">
          <h2 className="font-display text-4xl sm:text-5xl">Open the library.</h2>
          <p className="mx-auto mt-4 max-w-lg text-navy-foreground/75">
            Start with Synthetic Indices 101. Keep the account. That is the whole pitch.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/library">Enter The Trading Library</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-navy-foreground hover:bg-white/10"
            >
              <Link to="/community">Join the Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </Shell>
  );
}

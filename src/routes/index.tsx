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
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { listBooks } from "@/lib/server/platform";
import { SITE } from "@/lib/site";
import { useSiteContext } from "@/lib/site-context";
import { LibraryCatalogContent } from "./library/index";

export const Route = createFileRoute("/")({
  loader: () => listBooks(),
  component: Home,
});

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Books worth studying",
    text: "Straight trading books, serious online access, and material you will keep coming back to before the market opens.",
  },
  {
    icon: Shield,
    title: "Clear access and pricing",
    text: "Members get their access. New readers see the price clearly from the start.",
  },
  {
    icon: Users,
    title: "A serious trading community",
    text: "Telegram, WhatsApp, and market notes for traders who value discipline, accountability, and clear execution.",
  },
  {
    icon: Sparkles,
    title: "Focused on synthetic indices",
    text: "Volatility, Boom & Crash, Step, Jump, and Range explained in clear trading language.",
  },
];

const STEPS = [
  { n: "01", t: "Sign in", d: "Sign in with Deriv, Google, X, or email." },
  {
    n: "02",
    t: "Confirm your access",
    d: "Eligible members can unlock access. Everyone else can choose a title or a pass.",
  },
  {
    n: "03",
    t: "Open your book",
    d: "Read in the online library built for focused study and repeat review.",
  },
  {
    n: "04",
    t: "Stay connected",
    d: "Use the community, notes, and optional alerts to stay sharp between sessions.",
  },
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
  const siteContext = useSiteContext();

  if (siteContext.isLibraryHost) {
    return <LibraryCatalogContent books={books} />;
  }

  return (
    <Shell>
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="rise text-xs tracking-[0.22em] text-muted-foreground uppercase">
              SLT Trade Hub
            </p>
            <h1 className="rise rise-2 mt-4 font-display text-5xl font-semibold text-navy dark:text-foreground sm:text-6xl lg:text-7xl">
              For traders who protect capital and trade with intent.
            </h1>
            <p className="rise rise-3 mt-5 max-w-xl text-lg text-muted-foreground">
              Study with practical books, serious access, and a disciplined community
              focused on Volatility, Boom & Crash, Step, Jump, and Range.
            </p>
            <div className="rise rise-4 mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-full border border-border bg-card px-3 py-1">
                Practical trading books
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1">
                Secure online reader
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1">
                Community and market notes
              </span>
            </div>
            <div className="rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="navy" size="lg">
                <Link to="/library">
                  Explore The Trading Library <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/community">Join the Community</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[28px] border border-border bg-card p-6 shadow-[var(--shadow)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    The Trading Library
                  </p>
                  <h2 className="mt-3 font-display text-3xl text-navy dark:text-foreground">
                    Clear material for serious traders.
                  </h2>
                </div>
                <img
                  src="/brand/slt-logo.png"
                  alt={SITE.name}
                  className="size-16 rounded-full object-cover"
                />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-muted px-4 py-4">
                  <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    Coverage
                  </p>
                  <p className="mt-2 text-sm font-medium">Volatility, Boom & Crash, Step, Jump, Range</p>
                </div>
                <div className="rounded-2xl bg-muted px-4 py-4">
                  <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    Access
                  </p>
                  <p className="mt-2 text-sm font-medium">Online reader, member pricing, straightforward checkout</p>
                </div>
                <div className="rounded-2xl bg-muted px-4 py-4">
                  <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    Focus
                  </p>
                  <p className="mt-2 text-sm font-medium">Risk, execution, and repeatable process</p>
                </div>
              </div>
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
          SLT Trade Hub gives traders a stronger foundation before they put on risk.
        </h2>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          We publish books for traders who want cleaner entries, better sizing, and
          stronger control. The library and community are built to support serious
          trading work.
        </p>
      </section>

      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto flex max-w-6xl items-end justify-between px-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">The Trading Library</p>
            <h2 className="mt-2 font-display text-4xl">Featured titles</h2>
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
        <h2 className="mt-2 font-display text-4xl">What you get</h2>
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
          <h2 className="mt-2 font-display text-4xl">How access works</h2>
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
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Community</p>
        <h2 className="mt-2 font-display text-4xl">Stay in the room</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a
            href={SITE.telegram}
            className="rounded-xl border border-border bg-card p-6 hover:border-primary"
          >
            <MessageCircle className="size-5 text-primary" />
            <h3 className="mt-3 font-display text-2xl">Telegram</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The main room for SLT members. Market discussion, reviews, and session context.
            </p>
          </a>
          <a
            href={SITE.whatsapp}
            className="rounded-xl border border-border bg-card p-6 hover:border-primary"
          >
            <Users className="size-5 text-profit" />
            <h3 className="mt-3 font-display text-2xl">WhatsApp</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Session notes, reminders, and trading-day updates.
            </p>
          </a>
          <div className="rounded-xl border border-border bg-card p-6">
            <Bot className="size-5 text-loss" />
            <h3 className="mt-3 font-display text-2xl">Market alerts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional alerts that support your plan. They never replace risk control.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-mint/60 py-16 dark:bg-muted">
        <div className="mx-auto max-w-6xl overflow-hidden px-4">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Trader feedback</p>
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
            Start with the title that fits your market and study in a reading experience
            built for focused work.
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

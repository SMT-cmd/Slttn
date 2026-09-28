import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout/shell";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About SLT Trade Hub | Synthetic Indices Trading Books and Education` },
      {
        name: "description",
        content:
          "Learn about SLT Trade Hub, the team behind The Trading Library, and the practical synthetic indices trading books, education, and community built for disciplined traders.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">About</p>
        <h1 className="mt-3 font-display text-5xl">{SITE.name}</h1>
        <img
          src="/brand/trading-library-powered.png"
          alt=""
          className="mt-8 max-w-md"
        />
        <div className="mt-8 space-y-4 text-muted-foreground">
          <p>
            SLT Trade Hub is a trading education desk built around The Trading Library.
            We publish books for synthetic indices traders — Volatility, Boom & Crash,
            Step, Jump, Range — and keep a community built around discipline,
            preparation, and repeatable execution.
          </p>
          <p>
            The library is written by {SITE.author}, {SITE.authorRole}. The covers you
            see are the real series and the books are written to be studied, not skimmed.
          </p>
          <p>
            This is education. It is not a broker, not a signal service, and not financial
            advice. Trading can lose money, including money you cannot afford to lose.
          </p>
        </div>
      </div>
    </Shell>
  );
}

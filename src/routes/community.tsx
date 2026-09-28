import { createFileRoute } from "@tanstack/react-router";
import { Bot, MessageCircle, Users } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: `Synthetic Indices Trading Community | ${SITE.name}` },
      {
        name: "description",
        content:
          "Join the SLT Trade Hub synthetic indices trading community on Telegram and WhatsApp for market discussion, session notes, and optional market alerts.",
      },
    ],
  }),
  component: Community,
});

function Community() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Community</p>
        <h1 className="mt-3 font-display text-5xl">Trade with people who take it seriously.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Telegram handles the main conversation. WhatsApp keeps session notes close.
          Optional alerts can support your plan, but they never replace the books or your
          own discipline.
        </p>
        <div className="mt-10 grid gap-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <MessageCircle className="size-5 text-primary" />
            <h2 className="mt-3 font-display text-3xl">Telegram</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The main SLT room for trade review, execution talk, and clear market discussion.
            </p>
            <Button asChild variant="navy" className="mt-4">
              <a href={SITE.telegram}>Open Telegram</a>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Users className="size-5 text-profit" />
            <h2 className="mt-3 font-display text-3xl">WhatsApp</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Useful for trading-day reminders, session notes, and quick updates.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <a href={SITE.whatsapp}>Open WhatsApp</a>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Bot className="size-5 text-loss" />
            <h2 className="mt-3 font-display text-3xl">Market alerts</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional alerts only. They should support an existing plan, not create one.
              Access notes go out to tagged members after approval.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

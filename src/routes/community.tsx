import { createFileRoute } from "@tanstack/react-router";
import { Bot, MessageCircle, Users } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/community")({ component: Community });

function Community() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Community</p>
        <h1 className="mt-3 font-display text-5xl">A room, not a crowd.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Telegram for the long conversation. WhatsApp for the session ping. Bots for
          alerts you already decided to take. None of them replace the books.
        </p>
        <div className="mt-10 grid gap-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <MessageCircle className="size-5 text-primary" />
            <h2 className="mt-3 font-display text-3xl">Telegram</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The main SLT room. Process, journal talk, and the occasional well-earned screenshot.
            </p>
            <Button asChild variant="navy" className="mt-4">
              <a href={SITE.telegram}>Open Telegram</a>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Users className="size-5 text-profit" />
            <h2 className="mt-3 font-display text-3xl">WhatsApp</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Faster, smaller, and meant for people already in the library.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <a href={SITE.whatsapp}>Open WhatsApp</a>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Bot className="size-5 text-loss" />
            <h2 className="mt-3 font-display text-3xl">Signal bots</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional. If a bot changes your lot size, the system is no longer yours. Access
              notes go out to members after they are tagged.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

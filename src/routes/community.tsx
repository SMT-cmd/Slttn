import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Bot, MessageCircle, Users } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { publicSettings } from "@/lib/server/platform";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/community")({
  loader: async () => {
    try {
      return await publicSettings();
    } catch {
      return null;
    }
  },
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
  const settings = Route.useLoaderData();
  const links = getCommunityLinks(settings);
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
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {links.map((link, index) => {
            const Icon = communityIcon(link.label, index);
            return (
              <div key={`${link.label}-${link.url}`} className="rounded-xl border border-border bg-card p-6">
                <Icon className={index % 2 === 0 ? "size-5 text-primary" : "size-5 text-profit"} />
                <h2 className="mt-3 font-display text-3xl">{link.label}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Join the {link.label} space for focused community updates and discussion.
                </p>
                <Button asChild variant={index % 2 === 0 ? "navy" : "outline"} className="mt-4">
                  <a href={link.url} target="_blank" rel="noreferrer">
                    Open {link.label} <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              </div>
            );
          })}
          <div className="rounded-xl border border-border bg-card p-6">
            <Bot className="size-5 text-loss" />
            <h2 className="mt-3 font-display text-3xl">Market alerts</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional alerts only. They should support an existing plan, not create one.
              Access notes go out to tagged members after approval.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-3xl">Need help?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you need help with access, pricing, or linking your account, go straight to
              the support desk.
            </p>
            <Button asChild variant="navy" className="mt-4">
              <a href="/support">Open support</a>
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

type CommunityLink = { label: string; url: string };

function getCommunityLinks(settings: Record<string, unknown> | null): CommunityLink[] {
  const configured = Array.isArray(settings?.community_links)
    ? settings.community_links.filter(isCommunityLink).filter((link) => isSafeExternalUrl(link.url))
    : [];
  return configured.length > 0
    ? configured
    : [{ label: "Telegram", url: SITE.telegram }, { label: "WhatsApp", url: SITE.whatsapp }];
}

function isCommunityLink(value: unknown): value is CommunityLink {
  if (!value || typeof value !== "object") return false;
  const link = value as Record<string, unknown>;
  return (
    typeof link.label === "string" &&
    link.label.trim().length > 0 &&
    typeof link.url === "string" &&
    link.url.trim().length > 0
  );
}

function isSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function communityIcon(label: string, index: number) {
  const name = label.toLowerCase();
  if (name.includes("telegram") || name.includes("chat") || name.includes("group")) return MessageCircle;
  if (name.includes("whatsapp") || name.includes("community")) return Users;
  return index % 2 === 0 ? MessageCircle : Users;
}

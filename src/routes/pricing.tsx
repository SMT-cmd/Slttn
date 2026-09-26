import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/site";
import { formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({ component: Pricing });

function Pricing() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Pricing</p>
        <h1 className="mt-3 font-display text-5xl">Clear numbers. No theatre.</h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs tracking-[0.16em] uppercase text-profit">Pre-launch</p>
            <h2 className="mt-2 font-display text-3xl">Tagged SLT members</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Free online reading with a coupon generated from your account. Downloads{" "}
              {formatMoney(PRICING.downloadPrelaunch)}.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">After public launch</p>
            <h2 className="mt-2 font-display text-3xl">Tagged members pay $5</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              A {formatMoney(PRICING.taggedCouponPublic)} coupon fee, even for tagged
              accounts. Downloads {formatMoney(PRICING.downloadPublic)}.
            </p>
          </div>
        </div>
        <h2 className="mt-12 font-display text-3xl">Online access for everyone else</h2>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>Short handbooks — {formatMoney(PRICING.online.short)}</li>
          <li>Medium books — {formatMoney(PRICING.online.medium)}</li>
          <li>Full guides (Trading Bible, Synthetic Indices 101, and the rest) — {formatMoney(PRICING.online.full)}</li>
          <li>
            All-books pass — {formatMoney(PRICING.subQuarterly)} every 3 months or{" "}
            {formatMoney(PRICING.subBiannual)} every 6 months
          </li>
        </ul>
        <Button asChild variant="navy" className="mt-8">
          <Link to="/library">Choose a title</Link>
        </Button>
      </div>
    </Shell>
  );
}

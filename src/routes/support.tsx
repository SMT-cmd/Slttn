import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: `Support | ${SITE.name}` },
      {
        name: "description",
        content:
          "Get support for library access, login help, pricing questions, and Deriv account linking at SLT Trade Hub.",
      },
    ],
  }),
  component: Support,
});

function Support() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Support</p>
        <h1 className="mt-3 font-display text-5xl">Support for traders who need a clear answer.</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Reach the desk for library access, login help, pricing questions, coupon guidance,
          or Deriv account linking. If something is blocking your next step, start here.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
              Fastest route
            </p>
            <h2 className="mt-3 font-display text-3xl">Telegram</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Best for live support on library access, login checks, and account linking.
            </p>
            <Button asChild variant="navy" className="mt-5 w-full">
              <a href={SITE.telegram}>Chat on Telegram</a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
              Quick follow-up
            </p>
            <h2 className="mt-3 font-display text-3xl">WhatsApp</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Useful when you want a simple pricing or access follow-up without delay.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full">
              <a href={SITE.whatsapp}>WhatsApp</a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Email</p>
            <h2 className="mt-3 font-display text-3xl">Direct inbox</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Send full details if you need to explain a login or billing issue clearly.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full">
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-3xl">Before you send a message</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Include the email on your account, the issue you are facing, and any order or
            coupon details that matter. That helps the desk resolve access issues faster.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="navy">
              <a href="/faq">Read the FAQ</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/contact">Open contact form</a>
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

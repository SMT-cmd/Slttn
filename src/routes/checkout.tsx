import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { getBook, startCheckout, type BookRow } from "@/lib/server/platform";
import { PRICING, SITE } from "@/lib/site";
import { useSiteContext } from "@/lib/site-context";
import { formatMoney } from "@/lib/utils";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type Search = { slug?: string };

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    slug: typeof s.slug === "string" ? s.slug : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Checkout | ${SITE.library}` },
      {
        name: "description",
        content:
          "Review pricing for online reading, downloads, and library passes for The Trading Library.",
      },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { slug } = Route.useSearch();
  const { user } = useCurrentUserState();
  const siteContext = useSiteContext();
  const [book, setBook] = useState<BookRow | null>(null);

  useEffect(() => {
    if (!slug) return;
    getBook({ data: { slug } }).then(setBook);
  }, [slug]);

  async function pay(
    kind: "online" | "download" | "coupon5" | "sub3" | "sub6",
    provider: "stripe" | "paystack",
  ) {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await startCheckout({ data: { bookSlug: slug, kind, provider } });
      if (res.status === "granted") toast.success(res.message);
      else toast.message(res.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout did not go through.");
    }
  }

  return (
    <Shell library={siteContext.isLibraryHost}>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Checkout</p>
        <h1 className="mt-2 font-display text-5xl">Pay the way that fits.</h1>
        <p className="mt-3 text-muted-foreground">
          Stripe and Paystack both sit on this page. Tagged members should generate a
          coupon from the account page during pre-launch instead of paying to read.
        </p>
        {book ? (
          <div className="mt-8 flex gap-4 rounded-xl border border-border bg-card p-4">
            <img src={book.cover_url} alt="" className="h-28 w-auto rounded-sm" />
            <div>
              <h2 className="font-display text-2xl">
                {book.title} {book.subtitle}
              </h2>
              <p className="text-sm text-muted-foreground">{book.category}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4">
          {book ? (
            <>
              <PayRow
                title="Read online"
                price={formatMoney(book.online_price_cents / 100)}
                onStripe={() => pay("online", "stripe")}
                onPaystack={() => pay("online", "paystack")}
              />
              <PayRow
                title="Download"
                price={formatMoney(
                  (book.launch_mode === "public"
                    ? book.download_public_cents
                    : book.download_prelaunch_cents) / 100,
                )}
                onStripe={() => pay("download", "stripe")}
                onPaystack={() => pay("download", "paystack")}
              />
            </>
          ) : null}
          <PayRow
            title="All-books · 3 months"
            price={formatMoney(PRICING.subQuarterly)}
            onStripe={() => pay("sub3", "stripe")}
            onPaystack={() => pay("sub3", "paystack")}
          />
          <PayRow
            title="All-books · 6 months"
            price={formatMoney(PRICING.subBiannual)}
            onStripe={() => pay("sub6", "stripe")}
            onPaystack={() => pay("sub6", "paystack")}
          />
          <PayRow
            title="Tagged coupon after public launch"
            price={formatMoney(PRICING.taggedCouponPublic)}
            onStripe={() => pay("coupon5", "stripe")}
            onPaystack={() => pay("coupon5", "paystack")}
          />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Need a member coupon instead?{" "}
          <Link to="/account" className="underline">
            Open your account
          </Link>
          .
        </p>
      </div>
    </Shell>
  );
}

function PayRow({
  title,
  price,
  onStripe,
  onPaystack,
}: {
  title: string;
  price: string;
  onStripe: () => void;
  onPaystack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="font-display text-2xl">{price}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="navy" onClick={onStripe}>
          Stripe
        </Button>
        <Button variant="outline" onClick={onPaystack}>
          Paystack
        </Button>
      </div>
    </div>
  );
}

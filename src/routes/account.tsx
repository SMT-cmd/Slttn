import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  deleteMyAccount,
  exportMyData,
  generateMemberCoupon,
  getMe,
  linkDeriv,
  redeemCoupon,
  updateProfileName,
  type Profile,
} from "@/lib/server/platform";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, isPending } = useCurrentUserState();
  const [me, setMe] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [cr, setCr] = useState("");
  const [partner, setPartner] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isPending || !user) return;
    getMe()
      .then((p) => {
        setMe(p);
        setName(p.full_name ?? "");
        setCr(p.deriv_cr ?? "");
      })
      .catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Could not load account."));
  }, [isPending, user]);

  if (isPending) return <div className="grid min-h-dvh place-items-center">Loading your desk…</div>;
  if (!user) return <RedirectToSignIn />;

  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Account</p>
        <h1 className="mt-2 font-display text-5xl">Your desk</h1>
        <p className="mt-2 text-muted-foreground">{user.primaryEmail}</p>

        {me?.banned ? (
          <p className="mt-6 rounded-md border border-loss/30 bg-loss/10 p-4 text-loss">
            This account has been suspended. Write to hello@slttradehub.trade if you think that is a mistake.
          </p>
        ) : null}

        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Name on the watermark</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            <Button
              variant="navy"
              onClick={async () => {
                try {
                  await updateProfileName({ data: { fullName: name } });
                  toast.success("Name saved.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not save.");
                }
              }}
            >
              Save
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl">Deriv partnership</h2>
            {me?.deriv_tagged ? <Badge tone="green">Tagged</Badge> : <Badge tone="muted">Not tagged</Badge>}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Link your CR so we can check the official partner tag. If the Deriv API keys are
            not on this host yet, use the SLT partner code from the community.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="cr">CR number</Label>
              <Input id="cr" value={cr} onChange={(e) => setCr(e.target.value)} placeholder="CR123456" />
            </div>
            <div>
              <Label htmlFor="pc">Partner code</Label>
              <Input
                id="pc"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder="SLT-PARTNER"
              />
            </div>
          </div>
          <Button
            className="mt-4"
            variant="navy"
            onClick={async () => {
              try {
                const res = await linkDeriv({ data: { cr, partnerCode: partner } });
                setMe((m) => (m ? { ...m, deriv_tagged: res.tagged, deriv_cr: res.cr } : m));
                toast.success(
                  res.tagged
                    ? "Tagged. You can generate a member coupon."
                    : "CR saved. Not tagged yet — ask the desk or use the partner code.",
                );
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Could not link Deriv.");
              }
            }}
          >
            Link Deriv
          </Button>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Coupons</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pre-launch tagged members get a free coupon. After public launch, tagged members
            pay $5. Enter a code you already have below.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="profit"
              onClick={async () => {
                try {
                  const res = await generateMemberCoupon();
                  if ("needsPayment" in res && res.needsPayment) {
                    toast.message("Public launch is on. Pay $5 from checkout to get a coupon.");
                    return;
                  }
                  toast.success(`Coupon ${res.code}`);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not create a coupon.");
                }
              }}
            >
              Generate member coupon
            </Button>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Redeem a code" />
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await redeemCoupon({ data: { code } });
                  toast.success("Coupon attached to this account.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "That coupon did not work.");
                }
              }}
            >
              Redeem
            </Button>
          </div>
        </section>

        {me?.role === "admin" ? (
          <Link to="/admin" className="mt-6 inline-block text-sm text-primary underline">
            Open the admin desk
          </Link>
        ) : null}

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-2xl">Your data</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                const dump = await exportMyData();
                const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "slt-tradehub-data.json";
                a.click();
              }}
            >
              Download my data
            </Button>
            <Button
              variant="loss"
              onClick={async () => {
                if (!window.confirm("Delete this account and reading history?")) return;
                await deleteMyAccount();
                window.location.href = "/";
              }}
            >
              Delete account
            </Button>
          </div>
        </section>
      </div>
    </Shell>
  );
}

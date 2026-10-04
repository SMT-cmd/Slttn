import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  deleteMyAccount,
  exportMyData,
  generateMemberCoupon,
  getMe,
  myLibrary,
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
  const [code, setCode] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [shelf, setShelf] = useState<Awaited<ReturnType<typeof myLibrary>>["shelf"]>([]);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    Promise.all([getMe(), myLibrary()])
      .then(([p, library]) => {
        setMe(p);
        setName(p.full_name ?? "");
        setCr(p.deriv_cr ?? "");
        setShelf(library.shelf);
        const activeCode = (library.coupons ?? []).find((coupon) => (coupon.uses_remaining ?? 0) > 0)?.code;
        setMemberCode(activeCode ?? "");
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
        <div className="mt-5 flex flex-wrap gap-3">
          {me?.role === "admin" ? (
            <Button asChild variant="outline">
              <Link to="/admin">Open admin</Link>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true);
              void signOut("/login").catch(() => {
                setSigningOut(false);
                toast.error("We couldn't sign you out just yet. Please try again.");
              });
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>

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
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs tracking-[.16em] text-muted-foreground uppercase">My shelf</p><h2 className="mt-1 font-display text-3xl">Books you can read</h2></div>
            <Badge tone="muted">{shelf.length} {shelf.length === 1 ? "book" : "books"}</Badge>
          </div>
          {shelf.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{shelf.map((book) => <a key={book.id} href={`/read/${book.slug}`} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:border-primary"><img src={book.cover_url} alt="" className="h-20 w-14 rounded object-cover"/><span><span className="block font-medium">{book.title}</span><span className="text-xs text-muted-foreground">{book.access.canDownload ? "Paid download + reader" : "Online reader"}</span></span></a>)}</div> : <p className="mt-4 text-sm text-muted-foreground">Your claimed and purchased books will appear here. Verified SLT partner members receive online reading access automatically.</p>}
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl">Deriv partnership</h2>
            {me?.deriv_tagged ? <Badge tone="green">Tagged</Badge> : <Badge tone="muted">Not tagged</Badge>}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your Deriv CR is checked directly against the official SLT partner account. No trading, balance, or payment permission is used.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="cr">CR number</Label>
              <Input id="cr" value={cr} onChange={(e) => setCr(e.target.value)} placeholder="CR123456" />
            </div>
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">Not tagged? Contact Deriv support and ask whether your CR can be attributed to the SLT Trade Hub partner account, then return and check again. For the correct referral link, contact the SLT support desk.</div>
          </div>
          <Button
            className="mt-4"
            variant="navy"
            onClick={async () => {
              try {
                const res = await linkDeriv({ data: { cr } });
                setMe((m) => (m ? { ...m, deriv_tagged: res.tagged, deriv_cr: res.cr } : m));
                toast.success(
                  res.tagged
                    ? "Verified. Your online library access and member coupon are ready."
                    : "This CR is not currently tagged to the SLT partner account.",
                );
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Could not link Deriv.");
              }
            }}
          >
            Link Deriv
          </Button>
          {!me?.deriv_tagged ? <div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><a href="https://deriv.com/contact_us/" target="_blank" rel="noreferrer">Open Deriv support</a></Button><Button asChild variant="outline" size="sm"><Link to="/support">Contact SLT support</Link></Button></div> : null}
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
                  setMemberCode(res.code);
                  toast.success(`Coupon ${res.code}`);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not create a coupon.");
                }
              }}
            >
              {memberCode ? "Show member coupon" : "Generate member coupon"}
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
          {memberCode ? <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-profit/25 bg-profit/10 p-3"><code className="font-semibold tracking-wider">{memberCode}</code><Button type="button" size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(memberCode); toast.success("Coupon copied."); }}>Copy</Button></div> : null}
        </section>

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

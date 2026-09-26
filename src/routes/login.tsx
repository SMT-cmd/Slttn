import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { GROK_PROVIDERS, authEnabled, signIn, authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shell } from "@/components/layout/shell";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({ email, password, name });
        if (res.error) throw new Error(res.error.message || "Could not create the account.");
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message || "Email or password is not right.");
      }
      window.location.href = "/account";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong signing in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Sign in</p>
          <h1 className="mt-3 font-display text-5xl">Come in through the front door.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            If you have a Deriv account, sign in here, then link your CR from the account
            page. Tagged SLT partners get member coupons. Google, X, or email all work.
          </p>
          <img
            src="/brand/trading-library-powered.png"
            alt={SITE.library}
            className="mt-10 hidden max-w-sm lg:block"
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          {authEnabled ? (
            <div className="space-y-3">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant={p.providerId === "google" ? "navy" : "outline"}
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/account" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sign-in is being connected.</p>
          )}

          <div className="my-6 flex items-center gap-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            Email
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="mb-4 flex rounded-md bg-muted p-1">
            <button
              type="button"
              className={`h-9 flex-1 rounded-sm text-sm ${mode === "in" ? "bg-card" : ""}`}
              onClick={() => setMode("in")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`h-9 flex-1 rounded-sm text-sm ${mode === "up" ? "bg-card" : ""}`}
              onClick={() => setMode("up")}
            >
              Create account
            </button>
          </div>

          <form className="space-y-3" onSubmit={onEmail}>
            {mode === "up" ? (
              <div className="space-y-1">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            ) : null}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" variant="navy" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in with email"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            After you are in, link Deriv from{" "}
            <Link to="/account" className="underline">
              your account
            </Link>{" "}
            so we can check the partnership tag.
          </p>
        </div>
      </div>
    </Shell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AUTH_PROVIDERS, authEnabled, signIn, authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shell } from "@/components/layout/shell";
import { SITE } from "@/lib/site";
import { useSiteContext } from "@/lib/site-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: `Sign In | ${SITE.name}` },
      {
        name: "description",
        content:
          "Sign in to access The Trading Library, manage your account, and unlock member pricing when your trading account is tagged.",
      },
    ],
  }),
  component: Login,
});

const derivProvider = AUTH_PROVIDERS.find((provider) => provider.label === "Deriv");
const secondaryProviders = AUTH_PROVIDERS.filter((provider) => provider.label !== "Deriv");

function Login() {
  const siteContext = useSiteContext();
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
    <Shell library={siteContext.isLibraryHost}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Sign in</p>
          <h1 className="mt-3 font-display text-5xl">Sign in to your library account.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            If Deriv is your main account, start there. We check your partnership tag after
            sign-in, keep Google and email available, and you can still link or relink
            Deriv later from your account page.
          </p>
          <img
            src="/brand/trading-library-powered.png"
            alt={SITE.library}
            className="mt-10 hidden max-w-sm lg:block"
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          {authEnabled ? (
            <div className="space-y-4">
              {derivProvider ? (
                <div className="rounded-xl border border-profit/30 bg-profit/6 p-4">
                  <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    Primary option
                  </p>
                  <Button
                    type="button"
                    variant="navy"
                    size="lg"
                    className="mt-3 w-full"
                    onClick={() => signIn(derivProvider.providerId, { callbackURL: "/account" })}
                  >
                    Login with Deriv
                  </Button>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Best for existing Deriv clients. We will check your partnership tag
                    after sign-in and sync it to your account.
                  </p>
                </div>
              ) : null}

              <div className="space-y-3">
                {secondaryProviders.map((p) => (
                  <Button
                    key={p.providerId}
                    type="button"
                    variant={p.label === "Google" ? "navy" : "outline"}
                    className="w-full"
                    onClick={() => signIn(p.providerId, { callbackURL: "/account" })}
                  >
                    Continue with {p.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sign-in is being prepared.</p>
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
            After you are in, you can still link or relink Deriv from{" "}
            <Link to="/account" className="underline">
              your account
            </Link>{" "}
            if you started with Google or email/password.
          </p>
        </div>
      </div>
    </Shell>
  );
}

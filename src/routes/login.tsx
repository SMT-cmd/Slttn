import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AUTH_PROVIDERS, authEnabled, signIn, authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shell } from "@/components/layout/shell";
import { SITE } from "@/lib/site";
import { useSiteContext } from "@/lib/site-context";
import { authUiConfig } from "@/lib/server/platform";

export const Route = createFileRoute("/login")({
  loader: () => authUiConfig(),
  head: () => ({
    meta: [
      { title: `Sign In | ${SITE.name}` },
      {
        name: "description",
        content:
          "Sign in with Deriv, Google, or email and password to access The Trading Library and unlock member pricing when your Deriv account is tagged.",
      },
    ],
  }),
  component: Login,
});

function safeNextPath(raw: string | null | undefined, fallback = "/account") {
  if (!raw) return fallback;
  const value = raw.trim();
  // Allow absolute URLs on our own domains, or relative paths.
  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      if (
        host === "slttradehub.trade" ||
        host === "www.slttradehub.trade" ||
        host === "library.slttradehub.trade" ||
        host.endsWith(".slttradehub.trade")
      ) {
        return url.toString();
      }
      return fallback;
    }
  } catch {
    return fallback;
  }
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}

const derivProvider = AUTH_PROVIDERS.find((provider) => provider.label === "Deriv");
const secondaryProviders = AUTH_PROVIDERS.filter((provider) => provider.label !== "Deriv");

function Login() {
  const siteContext = useSiteContext();
  const authConfig = Route.useLoaderData();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const nextPath =
    typeof window !== "undefined"
      ? safeNextPath(new URLSearchParams(window.location.search).get("next"), "/account")
      : "/account";
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (!oauthError) return;
    const detail = oauthError.replace(/_/g, " ");
    toast.error(`Sign-in did not complete (${detail}). Try Deriv again, or use Google / email.`);
  }, []);


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
      window.location.href = nextPath;
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
            Start with Deriv if that is your main trading account. We check your partnership
            tag after sign-in, keep Google and email/password available, and you can still
            link or relink Deriv later from your account page.
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
              {derivProvider && authConfig.derivEnabled ? (
                <div className="rounded-xl border border-profit/30 bg-profit/6 p-4">
                  <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    Primary option
                  </p>
                  <Button
                    type="button"
                    variant="navy"
                    size="lg"
                    className="mt-3 w-full"
                    onClick={() => signIn(derivProvider.providerId, { callbackURL: nextPath, errorCallbackURL: `/login?next=${encodeURIComponent(nextPath)}` })}
                  >
                    Continue with Deriv
                  </Button>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Best for existing Deriv clients. We check your partnership tag after
                    sign-in and sync it to your account.
                  </p>
                </div>
              ) : null}

              <div className="space-y-3">
                {secondaryProviders
                  .filter((provider) => provider.label !== "Google" || authConfig.googleEnabled)
                  .map((p) => (
                    <Button
                      key={p.providerId}
                      type="button"
                      variant={p.label === "Google" ? "navy" : "outline"}
                      className="w-full"
                      onClick={() => signIn(p.providerId, { callbackURL: nextPath, errorCallbackURL: `/login?next=${encodeURIComponent(nextPath)}` })}
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
            Email and password
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
              {busy
                ? "Please wait…"
                : mode === "up"
                  ? "Create account"
                  : "Continue with email"}
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

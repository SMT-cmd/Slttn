import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AUTH_PROVIDERS, authClient, authEnabled, signIn, signOut } from "@/lib/auth/client";
import { ADMIN_ACCESS_TIMEOUT_MS, runAdminAccessCheck } from "@/lib/admin/access";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminAccess, authUiConfig } from "@/lib/server/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: `Admin Desk | ${SITE.name}` },
      {
        name: "description",
        content: "Secure sign-in for the admin desk.",
      },
    ],
  }),
  component: AdminLogin,
});

type AccessState = "idle" | "checking" | "blocked" | "error";

function AdminLogin() {
  const { user, isPending } = useCurrentUserState();
  const googleProvider = useMemo(
    () => AUTH_PROVIDERS.find((provider) => provider.providerId === "google"),
    [],
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [redirectToAdmin, setRedirectToAdmin] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [accessState, setAccessState] = useState<AccessState>("idle");
  const [accessMessage, setAccessMessage] = useState("");

  useEffect(() => {
    authUiConfig()
      .then((config) => setGoogleEnabled(config.googleEnabled))
      .catch(() => setGoogleEnabled(false));
  }, []);

  useEffect(() => {
    if (isPending) {
      const timer = window.setTimeout(() => {
        setAccessState("error");
        setAccessMessage("Admin session check timed out. Reload or sign in again to continue.");
      }, ADMIN_ACCESS_TIMEOUT_MS);
      return () => window.clearTimeout(timer);
    }

    setRedirectToAdmin(false);

    if (!user) {
      setAccessState("idle");
      setAccessMessage("");
      return;
    }

    let cancelled = false;
    setAccessState("checking");
    setAccessMessage("");

    runAdminAccessCheck(() => adminAccess())
      .then((result) => {
        if (cancelled) return;
        if (result.allowed) {
          setRedirectToAdmin(true);
          return;
        }
        setAccessState("blocked");
        setAccessMessage(
          result.message ?? "This signed-in account is not assigned the admin role.",
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAccessState("error");
        setAccessMessage(
          error instanceof Error && error.message
            ? error.message
            : "We could not confirm admin access.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  async function handleEmailSignIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setAccessState("idle");
    setAccessMessage("");
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        throw new Error(result.error.message || "Email or password is not right.");
      }
      const access = await runAdminAccessCheck(() => adminAccess());
      if (access.allowed) {
        setRedirectToAdmin(true);
        return;
      }
      setAccessState("blocked");
      setAccessMessage(
        access.message ?? "This signed-in account is not assigned the admin role.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong signing in.";
      setAccessState("error");
      setAccessMessage(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  if (redirectToAdmin) {
    return <Navigate to="/admin" />;
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_35%),linear-gradient(180deg,_#020617,_#0f172a)] px-4 py-10 text-slate-50">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden border-r border-white/10 bg-white/5 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs tracking-[0.3em] text-teal-200 uppercase">Admin desk</p>
              <h1 className="mt-4 font-display text-5xl leading-tight">
                Secure access for the operations team.
              </h1>
              <p className="mt-5 max-w-md text-sm text-slate-300">
                Use your admin account to open the dashboard, review users, and manage the
                trading library without stepping through reader onboarding.
              </p>
            </div>
            <div className="rounded-2xl border border-teal-400/20 bg-teal-400/10 p-5">
              <p className="text-sm font-medium text-teal-100">Admin checks</p>
              <p className="mt-2 text-sm text-slate-300">
                We verify your signed-in account against the `profiles` table before the
                dashboard opens.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.28em] text-slate-400 uppercase">Admin desk</p>
                  <h2 className="mt-3 font-display text-3xl text-white">Sign in</h2>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-300">
                Use an admin account to open the platform dashboard and management tools.
              </p>

              {!authEnabled ? (
                <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Sign-in is currently unavailable on this host.
                </div>
              ) : null}

              {accessState === "blocked" ? (
                <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4">
                  <p className="text-sm font-medium text-rose-100">
                    This account does not have admin access.
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {accessMessage || "Sign out and continue with an admin account."}
                  </p>
                  {user ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 border-white/20 bg-transparent text-white hover:bg-white/10"
                      disabled={signingOut}
                      onClick={() => {
                        setSigningOut(true);
                        void signOut("/admin/login").catch(() => {
                          setSigningOut(false);
                          toast.error("We couldn't sign you out just yet. Please try again.");
                        });
                      }}
                    >
                      {signingOut ? "Signing out…" : "Sign out"}
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {accessState === "error" ? (
                <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                  <p className="text-sm font-medium text-amber-100">
                    We could not confirm admin access yet.
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {accessMessage || "Reload this page or sign in again to continue."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={() => window.location.reload()}
                    >
                      Reload this page
                    </Button>
                    {user ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                        disabled={signingOut}
                        onClick={() => {
                          setSigningOut(true);
                          void signOut("/admin/login").catch(() => {
                            setSigningOut(false);
                            toast.error("We couldn't sign you out just yet. Please try again.");
                          });
                        }}
                      >
                        {signingOut ? "Signing out…" : "Sign out"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <form className="mt-8 space-y-4" onSubmit={handleEmailSignIn}>
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-slate-200">
                    Email
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="border-white/10 bg-slate-900 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-slate-200">
                    Password
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    className="border-white/10 bg-slate-900 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  variant="navy"
                  className="w-full"
                  disabled={!authEnabled || busy || accessState === "checking"}
                >
                  {busy || accessState === "checking" ? "Checking access…" : "Open admin desk"}
                </Button>
              </form>

              {googleEnabled && googleProvider && authEnabled ? (
                <div className="mt-6">
                  <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-slate-500 uppercase">
                    <span className="h-px flex-1 bg-white/10" />
                    Optional
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={() => signIn(googleProvider.providerId, { callbackURL: "/admin/login" })}
                    disabled={busy || accessState === "checking"}
                  >
                    Continue with Google
                  </Button>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <Link to="/" className="underline-offset-4 hover:underline">
                  Back to site
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

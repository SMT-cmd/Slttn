import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SITE } from "@/lib/site";
import { useTheme } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/library", label: "Library" },
  { to: "/community", label: "Community" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

export function Header({ library }: { library?: boolean }) {
  const { theme, toggle } = useTheme();
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={library ? "/brand/trading-library-powered.png" : "/brand/slt-logo.png"}
            alt=""
            className={cn("object-contain", library ? "h-10 w-10" : "h-10 w-10 rounded-full")}
          />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-tight">
              {library ? SITE.library : SITE.name}
            </span>
            <span className="hidden text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:block">
              {library ? "Powered by SLT Trade Hub" : SITE.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-sm font-medium text-muted-foreground hover:text-foreground",
                pathname.startsWith(l.to) && "text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="grid size-11 place-items-center rounded-md hover:bg-muted"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : (
            <>
              <SignedOut>
                <Button asChild size="sm" variant="navy" className="hidden sm:inline-flex">
                  <Link to="/login">Sign in</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Link
                  to="/account"
                  className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline"
                >
                  {user?.displayName?.split(" ")[0] ?? "Account"}
                </Link>
                <UserButton />
              </SignedIn>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-md hover:bg-muted md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <p className="font-display text-2xl">{SITE.name}</p>
              <div className="mt-8 flex flex-col gap-4">
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="text-lg"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link to="/login" onClick={() => setOpen(false)} className="text-lg">
                  Sign in
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

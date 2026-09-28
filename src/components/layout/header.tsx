import { useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SITE } from "@/lib/site";
import {
  libraryHomeHref,
  marketingHref,
  useSiteContext,
} from "@/lib/site-context";
import { useTheme } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "library", label: "Library" },
  { to: "/community", label: "Community" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

function isActiveLink(
  to: (typeof LINKS)[number]["to"],
  pathname: string,
  libraryHost: boolean,
) {
  if (to === "library") {
    return libraryHost;
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Header({ library }: { library?: boolean }) {
  const { theme, toggle } = useTheme();
  const { user, isPending } = useCurrentUserState();
  const siteContext = useSiteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const libraryLink = libraryHomeHref(siteContext);
  const homeLink = library ? libraryLink : marketingHref("/", siteContext);
  const signInLink = marketingHref("/login", siteContext);
  const accountLink = marketingHref("/account", siteContext);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-2 px-4 py-2 sm:gap-3">
        <a href={homeLink} className="flex min-w-0 flex-1 items-center gap-3 pr-2">
          <img
            src={library ? "/brand/trading-library.png" : "/brand/slt-logo.png"}
            alt={library ? SITE.library : SITE.name}
            className={cn(
              "shrink-0",
              library
                ? "h-11 w-11 rounded-xl border border-border/80 bg-card object-cover object-top p-0.5"
                : "h-10 w-10 rounded-full object-contain",
            )}
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-semibold tracking-tight sm:text-lg">
              {library ? SITE.library : SITE.name}
            </span>
            <span className="hidden text-[10px] tracking-[0.18em] text-muted-foreground uppercase xl:block">
              {library
                ? "Trading books for synthetic indices traders"
                : "Structured education for synthetic indices traders"}
            </span>
          </span>
        </a>

        <nav className="ml-2 hidden flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
          {LINKS.map((l) => (
            <a
              key={l.to}
              href={l.to === "library" ? libraryLink : marketingHref(l.to, siteContext)}
              aria-current={
                isActiveLink(l.to, pathname, siteContext.isLibraryHost) ? "page" : undefined
              }
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActiveLink(l.to, pathname, siteContext.isLibraryHost) &&
                  "bg-muted text-foreground",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggle}
            className="grid size-10 place-items-center rounded-md hover:bg-muted sm:size-11"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : (
            <>
              <SignedOut>
                <Button asChild size="sm" variant="navy" className="hidden md:inline-flex">
                  <a href={signInLink}>Sign in</a>
                </Button>
              </SignedOut>
              <SignedIn>
                <a
                  href={accountLink}
                  className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline"
                >
                  {user?.displayName?.split(" ")[0] ?? "Account"}
                </a>
                <UserButton compact />
              </SignedIn>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-md hover:bg-muted sm:size-11 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm border-l border-border px-0">
              <div className="flex h-full flex-col px-6 pb-6">
                <div className="pr-10">
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Menu</p>
                  <p className="mt-2 font-display text-2xl">
                    {library ? SITE.library : SITE.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {library
                      ? "Browse the shelf, review pricing, and open your reader."
                      : "Library access, pricing, and community links."}
                  </p>
                </div>
                <div className="mt-8 flex flex-1 flex-col gap-2">
                  {LINKS.map((l) => (
                    <a
                      key={l.to}
                      href={l.to === "library" ? libraryLink : marketingHref(l.to, siteContext)}
                      onClick={() => setOpen(false)}
                      aria-current={
                        isActiveLink(l.to, pathname, siteContext.isLibraryHost)
                          ? "page"
                          : undefined
                      }
                      className={cn(
                        "rounded-xl border border-transparent px-4 py-3 text-base font-medium transition-colors hover:bg-muted",
                        isActiveLink(l.to, pathname, siteContext.isLibraryHost) &&
                          "border-border bg-muted text-foreground",
                      )}
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
                <div className="mt-6 border-t border-border pt-6">
                  <SignedOut>
                    <Button asChild variant="navy" className="w-full">
                      <a href={signInLink} onClick={() => setOpen(false)}>
                        Sign in
                      </a>
                    </Button>
                  </SignedOut>
                  <SignedIn>
                    <Button asChild variant="outline" className="w-full">
                      <a href={accountLink} onClick={() => setOpen(false)}>
                        Open account
                      </a>
                    </Button>
                  </SignedIn>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { AgeGate } from "./age-gate";
import { CookieBanner } from "./cookie-banner";
import { useSiteContext } from "@/lib/site-context";

export function Shell({
  children,
  library,
  bare,
}: {
  children: ReactNode;
  library?: boolean;
  bare?: boolean;
}) {
  const siteContext = useSiteContext();
  const libraryChrome = library ?? siteContext.isLibraryHost;

  if (bare) return <>{children}</>;
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AgeGate />
      <Header library={libraryChrome} />
      <main className="flex-1">{children}</main>
      <Footer library={libraryChrome} />
      <CookieBanner />
    </div>
  );
}

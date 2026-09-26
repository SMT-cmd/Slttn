import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { AgeGate } from "./age-gate";
import { CookieBanner } from "./cookie-banner";

export function Shell({
  children,
  library,
  bare,
}: {
  children: ReactNode;
  library?: boolean;
  bare?: boolean;
}) {
  if (bare) return <>{children}</>;
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AgeGate />
      <Header library={library} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

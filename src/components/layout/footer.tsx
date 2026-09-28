import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import {
  libraryHomeHref,
  mainSiteHref,
  marketingHref,
  useSiteContext,
} from "@/lib/site-context";

const LEGAL = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/disclaimer", label: "Financial Disclaimer" },
  { to: "/refund", label: "Refund Policy" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/copyright", label: "Copyright / DMCA" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Footer() {
  const siteContext = useSiteContext();
  const libraryLink = libraryHomeHref(siteContext);

  return (
    <footer className="mt-auto border-t border-border bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/brand/slt-logo.png" alt="" className="h-12 w-12 rounded-full bg-paper" />
            <div>
              <p className="font-display text-2xl">{SITE.name}</p>
              <p className="text-xs tracking-[0.16em] text-navy-foreground/70 uppercase">
                {SITE.tagline}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-navy-foreground/75">
            Structured trading education, premium books, and a library built for traders
            who want process, risk discipline, and clear market work.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] uppercase text-navy-foreground/60">Library</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a href={libraryLink} className="hover:underline">
              The Trading Library
            </a>
            <a href={marketingHref("/pricing", siteContext)} className="hover:underline">
              Pricing
            </a>
            <a href={marketingHref("/community", siteContext)} className="hover:underline">
              Community
            </a>
            <a href={SITE.telegram} className="hover:underline">
              Telegram
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] uppercase text-navy-foreground/60">Legal</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {LEGAL.map((l) => (
              <a
                key={l.to}
                href={siteContext.isLibraryHost ? mainSiteHref(l.to) : l.to}
                className="hover:underline"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-navy-foreground/55">
        © {new Date().getFullYear()} {SITE.name}. {SITE.domain}
      </div>
    </footer>
  );
}

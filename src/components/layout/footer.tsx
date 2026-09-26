import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

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
            Exclusive books and a serious room for synthetic indices traders. Educational
            content only — never a promise of profit.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] uppercase text-navy-foreground/60">Library</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link to="/library" className="hover:underline">
              The Trading Library
            </Link>
            <Link to="/pricing" className="hover:underline">
              Pricing
            </Link>
            <Link to="/community" className="hover:underline">
              Community & bots
            </Link>
            <a href={SITE.telegram} className="hover:underline">
              Telegram
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] uppercase text-navy-foreground/60">Legal</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {LEGAL.map((l) => (
              <Link key={l.to} to={l.to} className="hover:underline">
                {l.label}
              </Link>
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

export const SITE = {
  name: "SLT Trade Hub",
  library: "The Trading Library",
  tagline: "Profitability is the Culture",
  headline: "Structured trading education for synthetic indices traders.",
  domain: "slttradehub.online",
  libraryHost: "library.slttradehub.online",
  email: "hello@slttradehub.online",
  author: "O.J. Alonge",
  authorRole: "Synthetic Indices Specialist",
  telegram: "https://t.me/slttradehub",
  whatsapp: "https://chat.whatsapp.com/slttradehub",
  url: "https://slttradehub.online",
  marketingTitle: "SLT Trade Hub | Trading Education and Premium Books for Synthetic Indices Traders",
  marketingDescription:
    "SLT Trade Hub helps synthetic indices traders study with premium books, practical trading education, and a focused community built around process, risk, and execution.",
  libraryTitle: "The Trading Library | Premium Trading Books for Synthetic Indices Traders",
  libraryDescription:
    "The Trading Library helps synthetic indices traders study Volatility, Boom & Crash, Step, Jump, and Range markets with practical books, a secure reader, and straightforward member access.",
  ogImagePath: "/og.png",
  ogImageAlt: "SLT Trade Hub share card with trading book and market branding",
};

export function bookPageTitle(title: string, subtitle?: string | null) {
  const suffix = subtitle?.trim() ? `: ${subtitle.trim()}` : "";
  return `${title}${suffix} | ${SITE.library}`;
}

export function bookPageDescription(description?: string | null) {
  const summary = description?.trim();
  return summary && summary.length > 40 ? summary : SITE.libraryDescription;
}

export const PRICING = {
  downloadPrelaunch: 69,
  downloadPublic: 99,
  taggedCouponPublic: 5,
  subQuarterly: 12.99,
  subBiannual: 22.99,
  online: { short: 19, medium: 29, full: 39 } as const,
};

export const CATEGORIES = [
  "Synthetic Indices",
  "Risk & Lot Size",
  "Supply & Demand",
  "Chart Patterns",
  "Trading Psychology",
  "Full Guides",
] as const;

export type BookSize = "short" | "medium" | "full";
export type LaunchMode = "prelaunch" | "public";
export type BookCategory = (typeof CATEGORIES)[number];

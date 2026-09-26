export const SITE = {
  name: "SLT Trade Hub",
  library: "The Trading Library",
  tagline: "Profitability is the Culture",
  headline: "The market that never sleeps. The library that keeps you ready.",
  domain: "slttradehub.online",
  libraryHost: "library.slttradehub.online",
  email: "hello@slttradehub.online",
  author: "O.J. Alonge",
  authorRole: "Synthetic Indices Specialist",
  telegram: "https://t.me/slttradehub",
  whatsapp: "https://chat.whatsapp.com/slttradehub",
  url: "https://slttradehub.online",
};

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

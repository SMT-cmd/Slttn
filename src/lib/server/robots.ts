import { SITE } from "@/lib/site";

export function renderRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /account",
    "Disallow: /checkout",
    "Disallow: /login",
    "Disallow: /read/",
    "",
    `Sitemap: ${SITE.url}/sitemap.xml`,
    `Sitemap: ${SITE.libraryUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

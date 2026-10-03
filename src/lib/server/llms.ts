import { SITE } from "@/lib/site";

/**
 * A concise, crawlable description for AI assistants and other non-HTML agents.
 * Keep this independent of the database so it remains available during a catalog outage.
 */
export function renderLlmsTxt() {
  return `# ${SITE.name}\n\n` +
    `${SITE.name} is an education and community platform for synthetic indices traders. ` +
    `It covers Volatility, Boom & Crash, Step, Jump, and Range markets. It provides ` +
    `educational books, secure online reading, pricing and access information, and community links. ` +
    `It does not provide financial advice or trading signals.\n\n` +
    `## Two connected websites\n\n` +
    `- Main site: ${SITE.url} — ${SITE.marketingDescription}\n` +
    `- The Trading Library: ${SITE.libraryUrl} — ${SITE.libraryDescription}\n\n` +
    `The main site explains the service, pricing, support, and community. The Trading Library is ` +
    `the book catalog and the public home for individual book pages. The reader is authenticated ` +
    `and intentionally excluded from search indexing.\n\n` +
    `## Important public pages\n\n` +
    `- ${SITE.url}/about\n` +
    `- ${SITE.url}/pricing\n` +
    `- ${SITE.url}/community\n` +
    `- ${SITE.url}/faq\n` +
    `- ${SITE.url}/support\n` +
    `- ${SITE.libraryUrl}\n` +
    `- ${SITE.url}/sitemap.xml\n`;
}

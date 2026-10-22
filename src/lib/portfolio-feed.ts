import type { CatalogBook } from "./catalog";

const ORIGIN = "https://library.slttradehub.trade";

export function serializePortfolioBooks(books: readonly CatalogBook[]) {
  return books
    .filter(book => book.published && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.slug))
    .sort((a,b) => a.sort_order - b.sort_order)
    .slice(0,24)
    .map(book => ({
      slug: book.slug,
      title: book.title,
      subtitle: book.subtitle,
      category: book.category,
      description: book.blurb,
      cover_url: book.cover_url.startsWith("/") ? ORIGIN + book.cover_url :
        book.cover_url.startsWith("https://") ? book.cover_url : "",
      url: ORIGIN + "/" + encodeURIComponent(book.slug),
    }));
}

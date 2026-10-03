import { createFileRoute } from "@tanstack/react-router";
import { getBook } from "@/lib/server/platform";
import { SITE } from "@/lib/site";
import { BookPage, getBookPageHead } from "./library/$slug";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => getBook({ data: { slug: params.slug } }),
  head: ({ loaderData }) =>
    getBookPageHead(loaderData, {
      shareUrl: loaderData ? `${SITE.url}/${loaderData.slug}` : SITE.url,
      canonicalUrl: loaderData ? `${SITE.libraryUrl}/${loaderData.slug}` : SITE.libraryUrl,
    }),
  component: BookPage,
});

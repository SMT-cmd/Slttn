import { createFileRoute } from "@tanstack/react-router";
import { getBook } from "@/lib/server/platform";
import { SITE } from "@/lib/site";
import { getBookPageHead } from "./library/$slug";
import { Reader } from "./library/read.$slug";

export const Route = createFileRoute("/read/$slug")({
  loader: ({ params }) => getBook({ data: { slug: params.slug } }),
  head: ({ loaderData }) =>
    getBookPageHead(loaderData, {
      shareUrl: loaderData ? `${SITE.url}/read/${loaderData.slug}` : `${SITE.url}/read`,
      canonicalUrl: loaderData ? `${SITE.libraryUrl}/${loaderData.slug}` : SITE.libraryUrl,
      noIndex: true,
    }),
  component: Reader,
});

import { createFileRoute } from "@tanstack/react-router";
import { getBook } from "@/lib/server/platform";
import { BookPage, getBookPageHead } from "./library/$slug";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => getBook({ data: { slug: params.slug } }),
  head: ({ loaderData }) => getBookPageHead(loaderData),
  component: BookPage,
});

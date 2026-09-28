import { createFileRoute } from "@tanstack/react-router";
import { getBook } from "@/lib/server/platform";
import { bookPageDescription, bookPageTitle } from "@/lib/site";
import { BookPage } from "./library/$slug";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => getBook({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Book Not Found | The Trading Library" },
          { name: "description", content: "The requested title is not currently available." },
        ],
      };
    }

    return {
      meta: [
        { title: bookPageTitle(loaderData.title, loaderData.subtitle) },
        { name: "description", content: bookPageDescription(loaderData.description) },
      ],
    };
  },
  component: BookPage,
});

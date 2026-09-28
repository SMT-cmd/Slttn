import { createFileRoute } from "@tanstack/react-router";
import { Reader } from "./library/read.$slug";

export const Route = createFileRoute("/read/$slug")({
  component: Reader,
});

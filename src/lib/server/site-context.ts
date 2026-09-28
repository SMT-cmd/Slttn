import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { resolveSiteContext } from "@/lib/site-context";
import { SITE } from "@/lib/site";

function currentHost() {
  const request = getRequest();
  const forwardedHost = request?.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request?.headers.get("host") || SITE.domain;
  return host.split(",")[0]?.trim() || SITE.domain;
}

export const getSiteContext = createServerFn({ method: "GET" }).handler(async () => {
  return resolveSiteContext(currentHost());
});

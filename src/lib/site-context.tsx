import { createContext, useContext } from "react";
import { SITE } from "@/lib/site";

export type SiteContextValue = {
  host: string;
  origin: string;
  isLibraryHost: boolean;
  mainSiteUrl: string;
  librarySiteUrl: string;
};

function normalizeHost(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

function isLocalHost(host: string) {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".localhost")
  );
}

export function isLibraryHost(host: string | null | undefined) {
  const normalized = normalizeHost(host);
  return normalized === SITE.libraryHost || normalized.startsWith("library.");
}

export function resolveSiteContext(host: string | null | undefined): SiteContextValue {
  const normalizedHost = normalizeHost(host) || SITE.domain;
  const protocol = isLocalHost(normalizedHost) ? "http" : "https";

  return {
    host: normalizedHost,
    origin: `${protocol}://${normalizedHost}`,
    isLibraryHost: isLibraryHost(normalizedHost),
    mainSiteUrl: SITE.url,
    librarySiteUrl: `https://${SITE.libraryHost}`,
  };
}

export function withLeadingSlash(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function mainSiteHref(path = "/") {
  return `${SITE.url}${withLeadingSlash(path)}`;
}

export function libraryHomeHref(siteContext: SiteContextValue) {
  return siteContext.isLibraryHost ? "/" : "/library";
}

export function libraryBookHref(slug: string, siteContext: SiteContextValue) {
  const cleanSlug = slug.replace(/^\/+/, "");
  return siteContext.isLibraryHost ? `/${cleanSlug}` : `/library/${cleanSlug}`;
}

export function libraryReaderHref(slug: string, siteContext: SiteContextValue) {
  const cleanSlug = slug.replace(/^\/+/, "");
  return siteContext.isLibraryHost
    ? `/read/${cleanSlug}`
    : `/library/read/${cleanSlug}`;
}

export function marketingHref(path: string, siteContext: SiteContextValue) {
  const target = withLeadingSlash(path);
  return siteContext.isLibraryHost ? mainSiteHref(target) : target;
}

export const defaultSiteContext = resolveSiteContext(SITE.domain);

export const SiteContext = createContext<SiteContextValue>(defaultSiteContext);

export function useSiteContext() {
  return useContext(SiteContext);
}

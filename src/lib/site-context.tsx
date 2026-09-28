import { createContext, useContext } from "react";
import { SITE } from "@/lib/site";

export type SiteContextValue = {
  host: string;
  origin: string;
  pathname: string;
  currentUrl: string;
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

function normalizePathname(value: string | null | undefined) {
  const raw = (value ?? "").trim();
  if (!raw || raw === "/") return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

export function isLibraryHost(host: string | null | undefined) {
  const normalized = normalizeHost(host);
  return normalized === SITE.libraryHost || normalized.startsWith("library.");
}

export function resolveSiteContext(
  host: string | null | undefined,
  pathname?: string | null,
): SiteContextValue {
  const normalizedHost = normalizeHost(host) || SITE.domain;
  const protocol = isLocalHost(normalizedHost) ? "http" : "https";
  const normalizedPathname = normalizePathname(pathname);
  const origin = `${protocol}://${normalizedHost}`;
  const currentUrl =
    normalizedPathname === "/" ? origin : `${origin}${normalizedPathname}`;

  return {
    host: normalizedHost,
    origin,
    pathname: normalizedPathname,
    currentUrl,
    isLibraryHost: isLibraryHost(normalizedHost),
    mainSiteUrl: SITE.url,
    librarySiteUrl: SITE.libraryUrl,
  };
}

export function withLeadingSlash(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function mainSiteHref(path = "/") {
  return `${SITE.url}${withLeadingSlash(path)}`;
}

export function libraryHomeHref(siteContext: SiteContextValue) {
  return siteContext.isLibraryHost ? "/" : SITE.libraryUrl;
}

export function libraryBookHref(slug: string, siteContext: SiteContextValue) {
  const cleanSlug = slug.replace(/^\/+/, "");
  return siteContext.isLibraryHost
    ? `/${cleanSlug}`
    : `${SITE.libraryUrl}/${cleanSlug}`;
}

export function libraryReaderHref(slug: string, siteContext: SiteContextValue) {
  const cleanSlug = slug.replace(/^\/+/, "");
  return siteContext.isLibraryHost
    ? `/read/${cleanSlug}`
    : `${SITE.libraryUrl}/read/${cleanSlug}`;
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

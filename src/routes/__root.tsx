import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ThemeProvider } from "@/components/theme";
import { SiteContext } from "@/lib/site-context";
import { getSiteContext } from "@/lib/server/site-context";
import { SITE } from "@/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: () => getSiteContext(),
  head: ({ loaderData }) => {
    const siteContext = loaderData ?? {
      isLibraryHost: false,
      currentUrl: SITE.url,
      origin: SITE.url,
      pathname: "/",
    };
    const title = siteContext.isLibraryHost ? SITE.libraryTitle : SITE.marketingTitle;
    const description = siteContext.isLibraryHost
      ? SITE.libraryDescription
      : SITE.marketingDescription;
    const siteName = siteContext.isLibraryHost ? SITE.library : SITE.name;
    const origin = siteContext.isLibraryHost ? SITE.libraryUrl : SITE.url;
    const brandIcon = siteContext.isLibraryHost
      ? "/brand/trading-library.png"
      : "/brand/slt-logo.png";
    const faviconLinks = siteContext.isLibraryHost
      ? [
          { rel: "icon", type: "image/png", href: brandIcon },
          { rel: "shortcut icon", href: brandIcon },
          { rel: "apple-touch-icon", href: brandIcon },
        ]
      : [
          { rel: "icon", type: "image/png", href: brandIcon },
          { rel: "shortcut icon", href: brandIcon },
          { rel: "apple-touch-icon", sizes: "180x180", href: brandIcon },
        ];
    const isNoIndexPath =
      siteContext.pathname === "/login" ||
      siteContext.pathname === "/account" ||
      siteContext.pathname === "/checkout" ||
      siteContext.pathname.startsWith("/admin") ||
      siteContext.pathname.startsWith("/read/");
    const robotsContent = isNoIndexPath
      ? "noindex,nofollow,max-image-preview:large"
      : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
    const shareUrl = (() => {
      try {
        const current = new URL(siteContext.currentUrl);
        return `${origin}${current.pathname}${current.search}${current.hash}`;
      } catch {
        return origin;
      }
    })();
    const ogImage = `${SITE.url}${SITE.ogImagePath}`;

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: description },
        { name: "theme-color", content: "#0E2744" },
        { name: "robots", content: robotsContent },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "en_US" },
        { property: "og:site_name", content: siteName },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: shareUrl },
        { property: "og:image", content: ogImage },
        { property: "og:image:secure_url", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: SITE.ogImageAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:url", content: shareUrl },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:image:alt", content: SITE.ogImageAlt },
      ],
      links: [
        { rel: "canonical", href: shareUrl },
        ...faviconLinks,
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@300;400;500;600;700&display=swap",
        },
      ],
    };
  },
  component: Root,
});

function Root() {
  const siteContext = Route.useLoaderData();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteContext.isLibraryHost ? SITE.libraryUrl : SITE.url}#organization`,
        name: siteContext.isLibraryHost ? SITE.library : SITE.name,
        url: siteContext.isLibraryHost ? SITE.libraryUrl : SITE.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteContext.isLibraryHost ? SITE.libraryUrl : SITE.url}${
            siteContext.isLibraryHost ? "/brand/trading-library.png" : "/brand/slt-logo.png"
          }`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteContext.isLibraryHost ? SITE.libraryUrl : SITE.url}#website`,
        name: siteContext.isLibraryHost ? SITE.library : SITE.name,
        url: siteContext.isLibraryHost ? SITE.libraryUrl : SITE.url,
        description: siteContext.isLibraryHost
          ? SITE.libraryDescription
          : SITE.marketingDescription,
        publisher: {
          "@id": `${siteContext.isLibraryHost ? SITE.libraryUrl : SITE.url}#organization`,
        },
        inLanguage: "en",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <PreviewHostBridge />
        <ThemeProvider>
          <SiteContext.Provider value={siteContext}>
            <AuthProvider>
              <Outlet />
              <Toaster richColors position="top-center" />
            </AuthProvider>
          </SiteContext.Provider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

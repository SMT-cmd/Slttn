import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AdsenseLoader } from "@/components/adsense-loader";
import { ThemeProvider } from "@/components/theme";
import { SiteContext } from "@/lib/site-context";
import { getSiteContext } from "@/lib/server/site-context";
import { SITE } from "@/lib/site";
import appCss from "../styles.css?url";

// This public identifier is intentionally opt-in. Do not load AdSense (or
// publish a fabricated publisher record) until the owner has an approved
// client ID for this domain.
const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT?.trim();

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
    const brandIconPath = siteContext.isLibraryHost
      ? SITE.libraryBrandImagePath
      : SITE.marketingBrandImagePath;
    // Make the favicon host-specific. Absolute URLs ensure a visitor on the
    // library never receives the main site's mark from a shared asset cache.
    const brandIcon = `${origin}${brandIconPath}`;
    const faviconLinks = [
      { rel: "icon", type: "image/png", href: brandIcon },
      { rel: "shortcut icon", type: "image/png", href: brandIcon },
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

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: description },
        { name: "theme-color", content: "#0E2744" },
        { name: "robots", content: robotsContent },
        { name: "application-name", content: siteName },
        { name: "author", content: SITE.author },
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
            siteContext.isLibraryHost ? SITE.libraryBrandImagePath : SITE.marketingBrandImagePath
          }`,
        },
        hasPart: [
          { "@id": `${SITE.url}#website` },
          { "@id": `${SITE.libraryUrl}#website` },
        ],
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
        isPartOf: {
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
        {adsenseClient ? (
          <meta name="google-adsense-account" content={adsenseClient} />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <PreviewHostBridge />
        <AdsenseLoader client={adsenseClient} />
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

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
    const siteContext = loaderData;
    const title = siteContext.isLibraryHost ? SITE.libraryTitle : SITE.marketingTitle;
    const description = siteContext.isLibraryHost
      ? SITE.libraryDescription
      : SITE.marketingDescription;
    const shareUrl = siteContext.isLibraryHost
      ? siteContext.librarySiteUrl
      : siteContext.mainSiteUrl;
    const ogImage = `${siteContext.origin}${SITE.ogImagePath}`;

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: description },
        { name: "theme-color", content: "#0E2744" },
        { name: "robots", content: "index,follow" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: SITE.name },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: shareUrl },
        { property: "og:image", content: ogImage },
        { property: "og:image:secure_url", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: SITE.ogImageAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: shareUrl },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
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

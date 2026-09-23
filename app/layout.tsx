import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/src/components/layout/SiteFooter";
import { SiteHeader } from "@/src/components/layout/SiteHeader";
import { siteConfig } from "@/src/config/site";
import { composeCsp } from "@/src/lib/csp";
import { getGameFrameOrigins } from "@/src/lib/data/game-loader";
import "@/src/style/globals.css";
import { JsonLd } from "@/src/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  applicationName: siteConfig.name,
  icons: { icon: "/icon.png", shortcut: "/favicon.ico", apple: "/apple-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#10110e" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const preview = process.env.NODE_ENV === "development";
  const csp = composeCsp(getGameFrameOrigins({ includeDraft: preview }), ["https://www.youtube-nocookie.com"]);
  return <html lang="en"><head><meta httpEquiv="Content-Security-Policy" content={csp}/><JsonLd data={{"@context":"https://schema.org","@type":"WebSite",name:siteConfig.name,url:siteConfig.origin,inLanguage:siteConfig.language,image:`${siteConfig.origin}${siteConfig.socialImage}`}} /></head><body><a className="skip-link" href="#main-content">Skip to main content</a><SiteHeader />{children}<SiteFooter /></body></html>;
}

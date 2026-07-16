import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config";

// Primary (English) metadata for crawlers. The visible UI localizes at runtime
// via the language selector; per-locale metadata routing (/en, /pt) is the
// documented next step (see README → SEO).
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Bread&Light — Learn languages through Scripture",
    template: "%s · Bread&Light",
  },
  description:
    "Read, listen, study and grow through God's Word in one daily experience. A calm, mobile-first way to learn a language through the Bible.",
  applicationName: "Bread&Light",
  keywords: [
    "Bread&Light",
    "learn languages through Scripture",
    "learn English through the Bible",
    "Bible language learning",
    "bilingual Bible study",
    "Scripture learning app",
  ],
  authors: [{ name: "Bread&Light" }],
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: "Bread&Light — Learn languages through Scripture",
    description:
      "Read, listen, study and grow through God's Word in one daily experience.",
    siteName: "Bread&Light",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "Bread&Light" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bread&Light — Learn languages through Scripture",
    description:
      "Read, listen, study and grow through God's Word in one daily experience.",
    images: ["/brand/og-image.png"],
  },
  icons: {
    icon: [{ url: "/icons/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F2E8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-burgundy focus:px-4 focus:py-2 focus:text-sm focus:text-[#F7F2E8]"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

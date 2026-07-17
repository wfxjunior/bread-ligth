import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cormorant, inter } from "./fonts";
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
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// ── Structured data ──────────────────────────────────────────────────────────
// SoftwareApplication + FAQPage JSON-LD so Google can render rich results.
// FAQ mirrors the on-page FAQ; keep both in sync via lib/i18n if edited.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Bread&Light",
      applicationCategory: "EducationalApplication",
      operatingSystem: "iOS, Android",
      description:
        "Read, listen, study and grow through God's Word in one daily experience. Learn a language through the Bible.",
      url: siteConfig.url,
      image: `${siteConfig.url}/brand/og-image.png`,
      offers: {
        "@type": "Offer",
        price: String(siteConfig.pricing.monthly),
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Organization",
      name: "Bread&Light",
      url: siteConfig.url,
      logo: `${siteConfig.url}/icons/icon-512.png`,
      email: siteConfig.contactEmail,
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        ["What is Bread&Light?", "Bread&Light is a calm, mobile-first app to learn a language through the Bible — read, listen, study and grow in one daily experience."],
        ["How does Bread&Light help me learn a language?", "You read Scripture side by side in two languages, listen to natural audio, tap any word for its meaning, and review vocabulary drawn from the chapter you study."],
        ["Which languages will be available?", "Bread&Light launches with English and Portuguese, with more language pairs planned."],
        ["Is the Bible content free?", "The Scripture text is public domain. Bread&Light's learning experience, audio and tools are offered through a simple subscription."],
        ["Can I use Bread&Light without a subscription?", "Yes — core reading is available for free, with Premium unlocking the full audio, vocabulary and study experience."],
        ["Will it be available for iPhone and Android?", "Yes, Bread&Light is coming to both iPhone and Android."],
        ["When will the app launch?", "Join the waitlist to be notified the moment Bread&Light is available."],
        ["Does Bread&Light replace a Bible translation?", "No. Bread&Light is a study and language-learning companion that presents trusted public-domain translations side by side."],
        ["How is my progress saved?", "Your reading history, vocabulary and journey are saved to your account and sync across your devices."],
      ].map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#FAF7F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // Structured data is trusted, build-time content (no user input).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* Public chrome (Header/Footer/i18n provider) lives in app/(site)/layout.tsx;
          the /admin area renders its own isolated shell. */}
      <body>{children}</body>
    </html>
  );
}

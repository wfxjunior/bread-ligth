// ── Launch + store configuration ─────────────────────────────────────────────
// Flip LAUNCHED to true and fill the store URLs to turn the whole site from
// "Join the Waitlist" mode into "Download the App" mode. No component hardcodes
// these — the Header CTA, Hero, Pricing and StoreBadges all read from here.
export const siteConfig = {
  name: "Bread&Light",
  url: "https://breadlight.app",
  launched: false,
  appStoreUrl: "", // e.g. https://apps.apple.com/app/idXXXXXXXXX
  playStoreUrl: "", // e.g. https://play.google.com/store/apps/details?id=...
  instagramUrl: "https://instagram.com/",
  youtubeUrl: "https://youtube.com/",
  contactEmail: "hello@breadlight.app",
  pricing: {
    monthly: 4.99,
    yearly: 39.99,
    currency: "US$",
    yearlySavingsPct: 33,
  },
} as const;

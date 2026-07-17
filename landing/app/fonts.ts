// Self-hosted fonts via next/font — no render-blocking Google Fonts <link>,
// no layout shift (size-adjusted fallbacks), and the exact same pairing as
// before (Cormorant Garamond for editorial headings, Inter for body).

import { Cormorant_Garamond, Inter } from "next/font/google";

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

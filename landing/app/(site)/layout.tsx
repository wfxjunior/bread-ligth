// ── Public site chrome ───────────────────────────────────────────────────────
// The marketing header/footer and i18n provider wrap ONLY the public pages.
// This route group keeps every public URL identical (/, /contact, /privacy…)
// while the /admin area renders its own isolated shell — neither leaks into
// the other.

import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}

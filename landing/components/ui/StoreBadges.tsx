"use client";

import { useI18n } from "@/lib/i18n/context";
import { siteConfig } from "@/lib/config";
import { track } from "@/lib/analytics";
import { IconApple, IconPlayStore } from "@/components/icons";

/**
 * Before launch (siteConfig.launched === false) these render as calm, disabled
 * "coming soon" badges. After launch, set launched + the store URLs in
 * lib/config.ts and they become real, tracked download links. No fake links.
 */
export function StoreBadges({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  const { t } = useI18n();
  const live = siteConfig.launched;

  const shell = `inline-flex h-12 items-center gap-3 rounded-xl border px-4 transition-colors ${
    onDark ? "border-white/20 text-onDark" : "border-line text-ink"
  }`;

  const Inner = ({ icon, top, bottom }: { icon: React.ReactNode; top: string; bottom: string }) => (
    <>
      <span className="shrink-0" aria-hidden>{icon}</span>
      <span className="flex flex-col text-left leading-tight">
        <span className="text-[0.6rem] uppercase tracking-wide opacity-70">{top}</span>
        <span className="font-sans text-sm font-semibold">{bottom}</span>
      </span>
    </>
  );

  if (!live) {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <span className={`${shell} cursor-default opacity-70`} aria-disabled>
          <Inner icon={<IconApple className="h-6 w-6" />} top={t.store.comingSoon} bottom={t.store.appStoreShort} />
        </span>
        <span className={`${shell} cursor-default opacity-70`} aria-disabled>
          <Inner icon={<IconPlayStore className="h-6 w-6" />} top={t.store.comingSoon} bottom={t.store.playStoreShort} />
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a href={siteConfig.appStoreUrl} onClick={() => track("app_store_click")} className={`${shell} hover:border-burgundy`} aria-label={t.store.appStore}>
        <Inner icon={<IconApple className="h-6 w-6" />} top={t.store.comingSoon} bottom={t.store.appStoreShort} />
      </a>
      <a href={siteConfig.playStoreUrl} onClick={() => track("play_store_click")} className={`${shell} hover:border-burgundy`} aria-label={t.store.playStore}>
        <Inner icon={<IconPlayStore className="h-6 w-6" />} top={t.store.comingSoon} bottom={t.store.playStoreShort} />
      </a>
    </div>
  );
}

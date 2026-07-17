// Shared server-side context for admin pages: locale, dict, date range,
// session and the resolved data snapshot — one call at the top of each page.

import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE, type AdminSession } from "./session";
import { getAdminDict, normalizeAdminLocale, ADMIN_LANG_COOKIE, type AdminDict, type AdminLocale } from "./i18n";
import { getAdminData, type AdminData } from "./data/provider";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export interface AdminPageContext {
  t: AdminDict;
  locale: AdminLocale;
  days: number;
  data: AdminData;
  session: AdminSession; // middleware guarantees it exists on admin pages
  sp: Record<string, string | string[] | undefined>;
}

const VALID_RANGES = new Set([1, 7, 30, 90, 365]);

export async function adminPageContext(searchParams?: SearchParams): Promise<AdminPageContext> {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
  const locale = normalizeAdminLocale(jar.get(ADMIN_LANG_COOKIE)?.value);
  const sp = searchParams ? await searchParams : {};
  const rangeRaw = Number(typeof sp.range === "string" ? sp.range : "30");
  const days = VALID_RANGES.has(rangeRaw) ? rangeRaw : 30;
  const data = await getAdminData();
  return { t: getAdminDict(locale), locale, days, data, session: session as AdminSession, sp };
}

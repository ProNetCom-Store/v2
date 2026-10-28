import { cookies } from "next/headers";
import type { Locale } from "./types";
import { DEFAULT_LOCALE, LOCALE_COOKIE, getDictionary, isLocale, type Dictionary } from "./i18n";

/** يقرأ لغة العرض الحالية من الكوكيز في مكوّنات الخادم. */
export async function getServerLocale(): Promise<{ locale: Locale; dict: Dictionary }> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;
  return { locale, dict: getDictionary(locale) };
}

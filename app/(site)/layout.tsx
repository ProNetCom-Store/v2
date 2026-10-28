import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/queries";
import { DEFAULT_LOCALE, LOCALE_COOKIE, getDictionary, isLocale } from "@/lib/i18n";

// الموقع يعرض بيانات قابلة للتغيير من اللوحة → عرض ديناميكي دائمًا
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <>
      <SiteHeader settings={settings} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} locale={locale} dict={dict} />
    </>
  );
}

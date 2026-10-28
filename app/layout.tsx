import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { cookies, headers } from "next/headers";
import { StoreProvider } from "@/components/store-provider";
import { PreferencesProvider } from "@/components/preferences-provider";
import { metaFor } from "@/lib/meta";
import { getSettings } from "@/lib/queries";
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  LOCALE_COOKIE,
  THEME_COOKIE,
  dirFor,
  getDictionary,
  isLocale,
  isTheme,
} from "@/lib/i18n";
import "./globals.css";

// Tailwind v4 مع بناء مسبق (بدون CDN) — يحل مشكلة FOUC والاعتماد على الإنترنت.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
  weight: ["400", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  const title = `${settings.brandName} | حلول تقنية ومتجر إلكتروني — عدن، اليمن`;
  const description =
    settings.heroSubtitle ||
    `${settings.brandName}: توريد وتركيب أجهزة الكمبيوتر واللابتوبات، معدات الشبكات، الإنترنت الفضائي Starlink، كاميرات المراقبة، والطابعات مع ضمان ودعم هندسي متخصص.`;

  // ملاحظة مهمة: الوسوم الحرجة للسيو (<title>/<meta description>/canonical/icon)
  // تُحقن يدويًا داخل <head> في RootLayout لأن Next 15 يُخرج وسوم generateMetadata
  // داخل <body> في العرض الديناميكي، فتتجاهلها محرّكات البحث.
  return {
    metadataBase: new URL(process.env.PRONET_SITE_URL || "http://localhost:3000"),
    applicationName: settings.brandName,
    keywords: [
      "برونت كمبيوتر",
      "ProNet Computer",
      "عدن",
      "اليمن",
      "لابتوب",
      "شبكات",
      "MikroTik",
      "Starlink",
      "كاميرات مراقبة",
      "طابعات",
    ],
    openGraph: {
      type: "website",
      locale: "ar_YE",
      siteName: settings.brandName,
      title,
      description,
      images: [{ url: "/assets/hero_banner.jpg", width: 1200, height: 630, alt: settings.brandName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/hero_banner.jpg"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0D1B2A" },
    { media: "(prefers-color-scheme: light)", color: "#EEF3F9" },
  ],
  width: "device-width",
  initialScale: 1,
};

/** يتحقق من أن القيمة لون HEX صالح قبل حقنها في CSS (منعًا لحقن الأنماط). */
function safeColor(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : fallback;
}

/**
 * يحوّل ألوان الهوية القابلة للتعديل من اللوحة إلى متغيّرات CSS.
 * تُطبّق في الوضع الليلي فقط حفاظًا على تباين الوضع النهاري المعتمد (وصولية ≥ 4.5:1).
 */
function identityStyleVars(settings: ReturnType<typeof getSettings>): string {
  const navy = safeColor(settings.navyColor, "#0D1B2A");
  const primary = safeColor(settings.primaryColor, "#00A8FF");
  const secondary = safeColor(settings.secondaryColor, "#38B6FF");
  return (
    `:root[data-theme="dark"]{` +
    `--color-canvas:${navy};--color-pronet-navy:${navy};` +
    `--color-brand:${primary};--color-pronet-cyan:${primary};` +
    `--color-brand-strong:${secondary};--color-pronet-lightcyan:${secondary};` +
    `}`
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const [store, headerStore] = await Promise.all([cookies(), headers()]);

  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  const cookieTheme = store.get(THEME_COOKIE)?.value;
  const theme = isTheme(cookieTheme)
    ? cookieTheme
    : isTheme(settings.defaultTheme)
      ? settings.defaultTheme
      : DEFAULT_THEME;

  const dict = getDictionary(locale);

  const pathname = headerStore.get("x-pathname") ?? "/";
  const meta = metaFor(pathname, locale);
  const siteUrl = (process.env.PRONET_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      data-theme={theme}
      className={cairo.variable}
      suppressHydrationWarning
    >
      <head>
        {/* وسوم SEO الأساسية — تُكتب هنا مباشرة لضمان خروجها داخل <head> */}
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content={pathname.startsWith("/admin") || pathname === "/cart" ? "noindex, nofollow" : "index, follow"} />
        {meta.canonical ? <link rel="canonical" href={`${siteUrl}${meta.canonical}`} /> : null}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/assets/ProNet_Logo.png" />
        <meta name="theme-color" content={theme === "light" ? "#eef3f9" : "#0d1b2a"} />
        <style dangerouslySetInnerHTML={{ __html: identityStyleVars(settings) }} />
      </head>
      <body className="flex min-h-screen flex-col bg-canvas text-ink">
        <PreferencesProvider initialLocale={locale} initialTheme={theme} dictionary={dict}>
          <StoreProvider
            rateYER={settings.rateYER}
            rateSAR={settings.rateSAR}
            defaultCurrency={settings.defaultCurrency}
          >
            <a href="#main" className="skip-link">
              {locale === "en" ? "Skip to main content" : "تجاوز إلى المحتوى الرئيسي"}
            </a>
            {children}
          </StoreProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}

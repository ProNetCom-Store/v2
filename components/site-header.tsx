"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "./store-provider";
import { usePreferences } from "./preferences-provider";
import { LanguageToggle, ThemeToggle } from "./pref-controls";
import { NavIcon, type NavIconName } from "./nav-icons";
import { pick, type Currency, type StoreSettings } from "@/lib/types";

type NavItem = { href: string; label: string; icon: NavIconName };

export function SiteHeader({ settings }: { settings: StoreSettings }) {
  const pathname = usePathname();
  const { locale, dict } = usePreferences();
  const { cartCount, currency, setCurrency } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  // إغلاق القائمة عند تغيير الصفحة
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const nav: NavItem[] = [
    { href: "/", label: dict.nav.home, icon: "home" },
    { href: "/store", label: dict.nav.store, icon: "store" },
    { href: "/services", label: dict.nav.services, icon: "services" },
    { href: "/projects", label: dict.nav.projects, icon: "projects" },
    { href: "/posts", label: dict.nav.posts, icon: "posts" },
    { href: "/about", label: dict.nav.about, icon: "about" },
    { href: "/contact", label: dict.nav.contact, icon: "contact" },
  ];

  const brandName = pick(locale, settings.brandName, settings.brandNameEn);
  const slogan = pick(locale, settings.slogan, settings.sloganEn);
  const announcement = pick(locale, settings.announcement, settings.announcementEn);
  const phone = settings.landline.replace(/[^0-9+]/g, "");

  const currencyOptions = [
    { value: "USD" as Currency, label: locale === "en" ? "US Dollar $" : "دولار أمريكي $" },
    { value: "YER" as Currency, label: locale === "en" ? "Yemeni Rial ﷼" : "ريال يمني ر.ي" },
    { value: "SAR" as Currency, label: locale === "en" ? "Saudi Riyal ﷼" : "ريال سعودي ر.س" },
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      {/* شريط الإعلان والتواصل */}
      <div className="border-b border-line bg-surface-3 px-3 py-2 text-xs sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-brand-strong">{announcement}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 font-semibold text-ink-soft hover:text-brand">
              <NavIcon name="phone" className="h-3.5 w-3.5" />
              <span dir="ltr">{settings.landline}</span>
            </a>
            <span aria-hidden="true" className="text-line">
              |
            </span>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-ink-soft hover:text-emerald-500"
            >
              <NavIcon name="whatsapp" className="h-4 w-4 text-emerald-500" />
              <span>{locale === "en" ? "Sales WhatsApp" : "واتساب المبيعات"}</span>{" "}
              <span dir="ltr">{settings.whatsappNumber}</span>
            </a>
            <span aria-hidden="true" className="text-line">
              |
            </span>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle compact />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${brandName} — ${dict.nav.home}`}>
          <Image
            src="/assets/ProNet_Logo.png"
            alt={`${brandName}`}
            width={48}
            height={48}
            priority
            className="h-12 w-12 rounded-xl object-contain"
          />
          <span className="hidden sm:block">
            <span className="block text-lg font-black leading-5 text-ink">{brandName}</span>
            <span className="block text-[11px] font-semibold text-ink-muted">{slogan}</span>
          </span>
        </Link>

        <nav aria-label={locale === "en" ? "Main navigation" : "التنقل الرئيسي"} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
                    isActive(item.href)
                      ? "bg-brand/15 text-brand-strong ring-1 ring-inset ring-brand/40"
                      : "text-ink-soft hover:bg-surface-3 hover:text-ink"
                  }`}
                >
                  <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <label htmlFor="currencySelect" className="sr-only">
              {dict.top.currency}
            </label>
            <select
              id="currencySelect"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="input-base w-auto py-2 text-sm font-bold"
            >
              {currencyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/cart"
            className="btn-ghost relative flex items-center gap-2 text-sm"
            aria-label={`${dict.cart.title} — ${cartCount}`}
          >
            <span aria-hidden="true">
              <NavIcon name="cart" className="h-[18px] w-[18px]" />
            </span>
            <span className="hidden sm:inline">{dict.top.cart}</span>
            <span
              className="badge-brand min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-black"
              data-cart-count={cartCount}
            >
              {cartCount}
            </span>
          </Link>

          <button
            type="button"
            className="btn-ghost px-3 py-2 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true">
              <NavIcon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
            </span>
            <span className="sr-only">{menuOpen ? dict.top.closeMenu : dict.top.openMenu}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label={locale === "en" ? "Mobile navigation" : "التنقل للجوال"}
          className="border-t border-line bg-canvas lg:hidden"
        >
          <ul className="mx-auto max-w-7xl px-3 py-2 sm:px-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-bold ${
                    isActive(item.href)
                      ? "bg-brand/15 text-brand-strong ring-1 ring-inset ring-brand/40"
                      : "text-ink-soft hover:bg-surface-3"
                  }`}
                >
                  <NavIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            <li className="sm:hidden">
              <div className="px-3 py-2">
                <label htmlFor="currencySelectMobile" className="mb-1 block text-xs font-bold text-ink-muted">
                  {dict.top.currency}
                </label>
                <select
                  id="currencySelectMobile"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="input-base text-sm font-bold"
                >
                  {currencyOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

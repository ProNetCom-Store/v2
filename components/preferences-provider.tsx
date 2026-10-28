"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale, Theme } from "@/lib/types";
import { dirFor, LOCALE_COOKIE, THEME_COOKIE, type Dictionary } from "@/lib/i18n";

interface PreferencesValue {
  locale: Locale;
  theme: Theme;
  dir: "rtl" | "ltr";
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  toggleLocale: () => void;
  toggleTheme: () => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${value}; path=/; max-age=${oneYear}; samesite=lax`;
}

export function PreferencesProvider({
  initialLocale,
  initialTheme,
  dictionary,
  children,
}: {
  initialLocale: Locale;
  initialTheme: Theme;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // يبقى الوضع متزامنًا إن تغيّرت القيمة من الخادم (مثلًا بعد تغيير اللغة)
  useEffect(() => {
    setThemeState(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.lang = initialLocale;
    root.dir = dirFor(initialLocale);
  }, [theme, initialLocale]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeCookie(THEME_COOKIE, next);
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      writeCookie(LOCALE_COOKIE, next);
      const root = document.documentElement;
      root.lang = next;
      root.dir = dirFor(next);
      // إعادة عرض مكوّنات الخادم باللغة الجديدة
      router.refresh();
    },
    [router],
  );

  const value: PreferencesValue = {
    locale: initialLocale,
    theme,
    dir: dirFor(initialLocale),
    dict: dictionary,
    setLocale,
    setTheme,
    toggleLocale: () => setLocale(initialLocale === "ar" ? "en" : "ar"),
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}

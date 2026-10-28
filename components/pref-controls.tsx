"use client";

import { usePreferences } from "./preferences-provider";

/** زر تبديل الوضع الليلي/النهاري. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme, dict } = usePreferences();
  const isDark = theme === "dark";
  const label = isDark ? dict.top.light : dict.top.dark;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`${dict.top.theme}: ${label}`}
      title={`${dict.top.theme}: ${label}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-xs font-bold text-ink-soft transition hover:bg-surface-3 hover:text-ink"
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      {!compact && <span>{label}</span>}
    </button>
  );
}

/** مبدّل اللغة عربي/إنجليزي. */
export function LanguageToggle() {
  const { locale, setLocale, dict } = usePreferences();
  return (
    <div
      role="group"
      aria-label={dict.top.language}
      className="inline-flex items-center overflow-hidden rounded-lg border border-line bg-surface-2 text-xs font-bold"
    >
      <button
        type="button"
        onClick={() => setLocale("ar")}
        aria-pressed={locale === "ar"}
        className={`px-2.5 py-1.5 transition ${
          locale === "ar" ? "chip-brand" : "text-ink-soft hover:bg-surface-3 hover:text-ink"
        }`}
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-2.5 py-1.5 transition ${
          locale === "en" ? "chip-brand" : "text-ink-soft hover:bg-surface-3 hover:text-ink"
        }`}
      >
        EN
      </button>
    </div>
  );
}

export function PrefControls({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <LanguageToggle />
      <ThemeToggle compact={compact} />
    </div>
  );
}

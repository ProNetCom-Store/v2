"use client";

import { useState } from "react";
import type { BankAccount, Locale } from "@/lib/types";
import { badgeStyle } from "@/lib/types";

export interface BankVisualTheme {
  key: "cac" | "tadhamon" | "qutaibi" | "kuraimi" | "cash" | "quote" | "generic";
  primary: string;
  secondary: string;
  gradient: string;
  softBg: string;
  borderGlow: string;
  subtitleEn: string;
  subtitleAr: string;
  shortCode: string;
}

export function getBankVisualTheme(bankIdOrName: string): BankVisualTheme {
  const s = (bankIdOrName || "").toLowerCase();

  if (s.includes("cac") || s.includes("كاك")) {
    return {
      key: "cac",
      primary: "#0EA5E9",
      secondary: "#F59E0B",
      gradient: "linear-gradient(135deg, #0284C7 0%, #38BDF8 60%, #F59E0B 100%)",
      softBg: "rgba(14, 165, 233, 0.12)",
      borderGlow: "rgba(14, 165, 233, 0.45)",
      subtitleEn: "CAC BANK • COOPERATIVE & AGRICULTURAL CREDIT",
      subtitleAr: "بنك التسليف التعاوني والزراعي — تحويل فوري",
      shortCode: "CAC",
    };
  }

  if (s.includes("tadhamon") || s.includes("التضامن") || s.includes("تضامن")) {
    return {
      key: "tadhamon",
      primary: "#10B981",
      secondary: "#14B8A6",
      gradient: "linear-gradient(135deg, #059669 0%, #10B981 60%, #2DD4BF 100%)",
      softBg: "rgba(16, 185, 129, 0.12)",
      borderGlow: "rgba(16, 185, 129, 0.45)",
      subtitleEn: "TADHAMON BANK • ISLAMIC BANKING & FINANCE",
      subtitleAr: "بنك التضامن الإسلامي — محفظتي والتحويل البنكي",
      shortCode: "TIB",
    };
  }

  if (s.includes("qutaibi") || s.includes("القطيبي") || s.includes("قطيبي")) {
    return {
      key: "qutaibi",
      primary: "#F59E0B",
      secondary: "#D97706",
      gradient: "linear-gradient(135deg, #B45309 0%, #F59E0B 60%, #FDE047 100%)",
      softBg: "rgba(245, 158, 11, 0.14)",
      borderGlow: "rgba(245, 158, 11, 0.45)",
      subtitleEn: "AL-QUTAIBI ISLAMIC BANK • MULTI-CURRENCY",
      subtitleAr: "بنك القطيبي الإسلامي للتمويل الأصغر — حساب موحد",
      shortCode: "QIB",
    };
  }

  if (s.includes("kuraimi") || s.includes("الكريمي") || s.includes("كريمي")) {
    return {
      key: "kuraimi",
      primary: "#06B6D4",
      secondary: "#6366F1",
      gradient: "linear-gradient(135deg, #0891B2 0%, #22D3EE 55%, #818CF8 100%)",
      softBg: "rgba(6, 182, 212, 0.14)",
      borderGlow: "rgba(34, 211, 238, 0.45)",
      subtitleEn: "AL-KURAIMI ISLAMIC BANK • KURAIMI JAWAL",
      subtitleAr: "بنك الكريمي الإسلامي — تطبيق الكريمي جوال وحسابات العملات",
      shortCode: "KIB",
    };
  }

  if (s.includes("نقد") || s.includes("cash") || s.includes("استلام")) {
    return {
      key: "cash",
      primary: "#22C55E",
      secondary: "#10B981",
      gradient: "linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)",
      softBg: "rgba(34, 197, 94, 0.14)",
      borderGlow: "rgba(34, 197, 94, 0.45)",
      subtitleEn: "CASH ON DELIVERY • ADEN SHOWROOM & COURIER",
      subtitleAr: "الدفع نقداً عند الاستلام داخل عدن أو في المعرض",
      shortCode: "COD",
    };
  }

  if (s.includes("عرض سعر") || s.includes("quote") || s.includes("مناقص")) {
    return {
      key: "quote",
      primary: "#EAB308",
      secondary: "#F59E0B",
      gradient: "linear-gradient(135deg, #CA8A04 0%, #FACC15 100%)",
      softBg: "rgba(234, 179, 8, 0.14)",
      borderGlow: "rgba(234, 179, 8, 0.45)",
      subtitleEn: "CORPORATE QUOTATION & OFFICIAL INVOICE",
      subtitleAr: "عروض أسعار وفواتير رسمية للشركات والمؤسسات والمناقصات",
      shortCode: "RFQ",
    };
  }

  return {
    key: "generic",
    primary: "#38BDF8",
    secondary: "#0284C7",
    gradient: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)",
    softBg: "rgba(56, 189, 248, 0.12)",
    borderGlow: "rgba(56, 189, 248, 0.45)",
    subtitleEn: "OFFICIAL BANK TRANSFER ACCOUNT",
    subtitleAr: "حساب بنكي رسمي معتمد للتحويل",
    shortCode: "BNK",
  };
}

/**
 * أيقونة وشعار متجهي (SVG) مخصّص لكل بنك ووسيلة دفع
 */
export function BankPaymentLogoSvg({
  bankIdOrName,
  className = "h-12 w-12",
}: {
  bankIdOrName: string;
  className?: string;
}) {
  const theme = getBankVisualTheme(bankIdOrName);

  switch (theme.key) {
    case "cac":
      return <img src="/assets/banks/cac_bank.png" alt="CAC Bank" className={`object-contain ${className}`} loading="lazy" />;
    case "tadhamon":
      return <img src="/assets/banks/tadhamon_bank.png" alt="Tadhamon Bank" className={`object-contain ${className}`} loading="lazy" />;
    case "qutaibi":
      return <img src="/assets/banks/qutaibi_bank.png" alt="Qutaibi Bank" className={`object-contain ${className}`} loading="lazy" />;
    case "kuraimi":
      return <img src="/assets/banks/kuraimi_bank.png" alt="Kuraimi Bank" className={`object-contain ${className}`} loading="lazy" />;
    case "cash":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="cashBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#cashBg)" stroke="#86EFAC" strokeWidth="1.5" />
          <rect x="12" y="18" width="40" height="26" rx="5" fill="rgba(6, 40, 20, 0.45)" stroke="#DCFCE7" strokeWidth="1.8" />
          <circle cx="32" cy="31" r="6.5" fill="none" stroke="#86EFAC" strokeWidth="2" />
          <text x="32" y="35" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill="#FFFFFF">
            $
          </text>
          <text x="32" y="56" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="7" letterSpacing="1.5" fill="#DCFCE7">
            CASH / COD
          </text>
        </svg>
      );
    case "quote":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="quoteBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A16207" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#quoteBg)" stroke="#FEF08A" strokeWidth="1.5" />
          <rect x="18" y="12" width="28" height="34" rx="4" fill="rgba(35, 20, 4, 0.45)" stroke="#FEF08A" strokeWidth="1.8" />
          <line x1="23" y1="21" x2="41" y2="21" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
          <line x1="23" y1="28" x2="41" y2="28" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
          <line x1="23" y1="35" x2="34" y2="35" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
          <text x="32" y="56" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="7" letterSpacing="1.2" fill="#FEF9C3">
            OFFICIAL RFQ
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect x="2" y="2" width="60" height="60" rx="16" fill="#0284C7" stroke="#7DD3FC" strokeWidth="1.5" />
          <polygon points="32,12 50,22 14,22" fill="#E0F2FE" />
          <rect x="18" y="25" width="5" height="16" rx="1.5" fill="#E0F2FE" />
          <rect x="29.5" y="25" width="5" height="16" rx="1.5" fill="#E0F2FE" />
          <rect x="41" y="25" width="5" height="16" rx="1.5" fill="#E0F2FE" />
          <rect x="14" y="43" width="36" height="4" rx="2" fill="#E0F2FE" />
        </svg>
      );
  }
}

function getCurrencyBadge(label: string) {
  const u = label.toUpperCase();
  if (u.includes("YER") || label.includes("يمني")) {
    return { code: "YER", flag: "🇾🇪", color: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)" };
  }
  if (u.includes("USD") || label.includes("دولار")) {
    return { code: "USD", flag: "🇺🇸", color: "#34D399", bg: "rgba(52, 211, 153, 0.15)" };
  }
  if (u.includes("SAR") || label.includes("سعودي")) {
    return { code: "SAR", flag: "🇸🇦", color: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)" };
  }
  return { code: "ACC", flag: "💳", color: "#A78BFA", bg: "rgba(167, 139, 250, 0.15)" };
}

export function CopyAccountButton({
  accountNumber,
  locale = "ar",
}: {
  accountNumber: string;
  locale?: Locale;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-extrabold transition ${
        copied
          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
          : "border-line bg-surface px-2.5 py-1 text-ink-soft hover:border-brand/50 hover:text-brand-strong"
      }`}
      title={locale === "en" ? "Copy account number" : "نسخ رقم الحساب"}
    >
      <span aria-hidden="true">{copied ? "✓" : "📋"}</span>
      <span>
        {copied
          ? locale === "en"
            ? "Copied"
            : "تم النسخ"
          : locale === "en"
            ? "Copy"
            : "نسخ"}
      </span>
    </button>
  );
}

export function BankAccountsSection({
  banks,
  title,
  intro,
  holderPrefix,
  cashNote,
  locale = "ar",
}: {
  banks: BankAccount[];
  title: string;
  intro: string;
  holderPrefix: string;
  cashNote: string;
  locale?: Locale;
}) {
  const paymentMethods = [
    {
      id: "pm_bank",
      key: "cac",
      title: locale === "en" ? "Direct Bank Transfer" : "التحويل البنكي المباشر",
      desc:
        locale === "en"
          ? "Instant transfer via CAC Bank, Tadhamon, Al-Qutaibi, or Al-Kuraimi apps"
          : "عبر تطبيقات كاك بنك، التضامن، القطيبي، أو الكريمي جوال بجميع العملات",
      badge: locale === "en" ? "Instant" : "فوري ومعتمد",
      color: "#38BDF8",
    },
    {
      id: "pm_cash",
      key: "نقداً عند الاستلام",
      title: locale === "en" ? "Cash on Delivery (COD)" : "الدفع نقداً عند الاستلام",
      desc:
        locale === "en"
          ? "Pay cash at our Aden showroom or upon delivery within Aden"
          : cashNote || "متاح في معرضنا بعدن أو عند توصيل الطلب داخل محافظة عدن",
      badge: locale === "en" ? "Aden" : "داخل عدن",
      color: "#22C55E",
    },
    {
      id: "pm_quote",
      key: "عرض سعر رسمي للشركات والمناقصات",
      title: locale === "en" ? "Corporate Quotation & Tenders" : "عروض أسعار وفواتير رسمية للشركات",
      desc:
        locale === "en"
          ? "Official stamped proforma invoice & bank transfer for companies & NGOs"
          : "توريد رسمي وفواتير مختومة للشركات والمنظمات والمؤسسات الحكومية",
      badge: locale === "en" ? "B2B / NGOs" : "شركات ومنظمات",
      color: "#F59E0B",
    },
  ];

  return (
    <section aria-labelledby="banks-heading" className="panel relative overflow-hidden p-6 sm:p-8">
      {/* إضاءة خلفية تجميلية */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/3 h-48 w-96 rounded-full bg-brand/10 blur-3xl"
      />

      {/* رأس قسم الحسابات البنكية ووسائل الدفع */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-brand/40 bg-brand/15 text-2xl shadow-inner">
            🏦
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="banks-heading" className="text-xl font-black text-ink sm:text-2xl">
                {title}
              </h2>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
                {locale === "en" ? "Verified Official Accounts ✓" : "حسابات رسمية معتمدة ✓"}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-ink-soft sm:text-sm">{intro}</p>
          </div>
        </div>
      </div>

      {/* بطاقات البنوك المعتمدة مع الشعارات والأيقونات */}
      <div className="relative z-10 mt-6 grid gap-5 md:grid-cols-2">
        {banks.map((bank) => {
          const theme = getBankVisualTheme(`${bank.id} ${bank.bankName}`);
          return (
            <div
              key={bank.id}
              className={`group relative overflow-hidden rounded-2xl border border-line bg-surface-2/90 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                bank.colSpan2 ? "md:col-span-2" : ""
              }`}
              style={{
                boxShadow: `0 10px 30px -15px ${theme.borderGlow}`,
              }}
            >
              {/* شريط علوي متدرج بهوية البنك */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
                style={{ background: theme.gradient }}
              />

              {/* رأس بطاقة البنك: شعار البنك المتجهي + اسم البنك + الشارة */}
              <div className="flex flex-wrap items-start justify-between gap-3 pt-1">
                <div className="flex items-center gap-3.5">
                  <div
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl p-0.5 shadow-md transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: theme.softBg,
                      border: `1px solid ${theme.primary}45`,
                    }}
                  >
                    <BankPaymentLogoSvg bankIdOrName={`${bank.id} ${bank.bankName}`} className="h-12 w-12" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-ink sm:text-lg">{bank.bankName}</h3>
                      {bank.badge ? (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${badgeStyle(
                            bank.badgeColor
                          )}`}
                        >
                          {bank.badge}
                        </span>
                      ) : null}
                    </div>
                    <p
                      dir="ltr"
                      className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                      style={{ color: theme.primary }}
                    >
                      {theme.subtitleEn}
                    </p>
                  </div>
                </div>

                {/* اسم صاحب الحساب */}
                <div className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs">
                  <span aria-hidden="true" className="text-emerald-400">
                    🛡️
                  </span>
                  <span className="font-semibold text-ink-muted">{holderPrefix}</span>
                  <span className="font-black text-ink">{bank.accountHolder}</span>
                </div>
              </div>

              {/* قائمة أرقام الحسابات مع أيقونة العملة وزر النسخ */}
              <dl
                className={`mt-4 grid gap-2.5 ${
                  bank.accounts.length > 1 ? "sm:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {bank.accounts.map((acc) => {
                  const curr = getCurrencyBadge(acc.label);
                  return (
                    <div
                      key={`${bank.id}-${acc.label}-${acc.number}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-line/90 bg-surface p-3 transition hover:border-brand/50"
                    >
                      <div className="min-w-0">
                        <dt className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-black"
                            style={{ backgroundColor: curr.bg, color: curr.color }}
                          >
                            <span>{curr.flag}</span>
                            <span>{curr.code}</span>
                          </span>
                          <span className="truncate">{acc.label}</span>
                        </dt>
                        <dd
                          dir="ltr"
                          className="mt-1 font-mono text-base font-black tracking-wider text-brand-strong sm:text-lg"
                        >
                          {acc.number}
                        </dd>
                      </div>

                      <CopyAccountButton accountNumber={acc.number} locale={locale} />
                    </div>
                  );
                })}
              </dl>
            </div>
          );
        })}
      </div>

      {/* شريط وسائل الدفع المعتمدة مع الأيقونات والشعارات */}
      <div className="relative z-10 mt-7 border-t border-line pt-6">
        <h3 className="mb-3.5 flex items-center gap-2 text-sm font-black text-ink sm:text-base">
          <span aria-hidden="true">💳</span>
          <span>
            {locale === "en"
              ? "Approved Payment & Settlement Methods"
              : "وسائل الدفع والتوريد المتاحة"}
          </span>
        </h3>

        <div className="grid gap-3.5 md:grid-cols-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-start gap-3.5 rounded-2xl border border-line bg-surface-2/80 p-4 transition hover:border-brand/40"
            >
              <div className="shrink-0">
                <BankPaymentLogoSvg bankIdOrName={pm.key} className="h-12 w-12" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p className="text-sm font-black text-ink">{pm.title}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                    style={{
                      backgroundColor: `${pm.color}20`,
                      color: pm.color,
                      border: `1px solid ${pm.color}40`,
                    }}
                  >
                    {pm.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{pm.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

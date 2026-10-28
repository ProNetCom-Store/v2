import Link from "next/link";
import type { Brand, Locale } from "@/lib/types";
import { pick } from "@/lib/types";

export interface BrandVisualMeta {
  key: string;
  color: string;
  gradient: string;
  softBg: string;
  borderHover: string;
  subtitleEn: string;
  subtitleAr: string;
  badgeAr: string;
  badgeEn: string;
  defaultLogo: string;
}

const BRAND_VISUALS: Record<string, BrandVisualMeta> = {
  hp: {
    key: "hp",
    color: "#0096D6",
    gradient: "linear-gradient(135deg, #0096D6 0%, #38BDF8 100%)",
    softBg: "rgba(0, 150, 214, 0.12)",
    borderHover: "rgba(0, 150, 214, 0.55)",
    subtitleEn: "BUSINESS & LASERJET",
    subtitleAr: "لابتوبات وطابعات أعمال",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/hp.svg",
  },
  dell: {
    key: "dell",
    color: "#007DB8",
    gradient: "linear-gradient(135deg, #007DB8 0%, #0EA5E9 100%)",
    softBg: "rgba(0, 125, 184, 0.12)",
    borderHover: "rgba(14, 165, 233, 0.55)",
    subtitleEn: "OPTIPLEX & VOSTRO",
    subtitleAr: "أجهزة مكتبية ولابتوبات",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/dell.svg",
  },
  lenovo: {
    key: "lenovo",
    color: "#E2231A",
    gradient: "linear-gradient(135deg, #E2231A 0%, #FB7185 100%)",
    softBg: "rgba(226, 35, 26, 0.12)",
    borderHover: "rgba(226, 35, 26, 0.55)",
    subtitleEn: "THINKPAD & IDEAPAD",
    subtitleAr: "حواسيب عملية ومكتبية",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/lenovo.svg",
  },
  asus: {
    key: "asus",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #1D4ED8 0%, #60A5FA 100%)",
    softBg: "rgba(59, 130, 246, 0.12)",
    borderHover: "rgba(59, 130, 246, 0.55)",
    subtitleEn: "EXPERTBOOK & TUF",
    subtitleAr: "أجهزة احترافية وألعاب",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/asus.svg",
  },
  mikrotik: {
    key: "mikrotik",
    color: "#38BDF8",
    gradient: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)",
    softBg: "rgba(56, 189, 248, 0.12)",
    borderHover: "rgba(56, 189, 248, 0.55)",
    subtitleEn: "ROUTEROS & SWITCHING",
    subtitleAr: "راوترات وسويتشات شبكات",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/mikrotik.svg",
  },
  ubiquiti: {
    key: "ubiquiti",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #0559C9 0%, #60A5FA 100%)",
    softBg: "rgba(37, 99, 235, 0.12)",
    borderHover: "rgba(59, 130, 246, 0.55)",
    subtitleEn: "UNIFI & AIRMAX",
    subtitleAr: "نقاط وصول وربط لاسلكي",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/ubiquiti.svg",
  },
  starlink: {
    key: "starlink",
    color: "#818CF8",
    gradient: "linear-gradient(135deg, #4F46E5 0%, #38BDF8 100%)",
    softBg: "rgba(99, 102, 241, 0.14)",
    borderHover: "rgba(129, 140, 248, 0.6)",
    subtitleEn: "HIGH-SPEED SATELLITE",
    subtitleAr: "إنترنت فضائي عالي السرعة",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/starlink.svg",
  },
  hikvision: {
    key: "hikvision",
    color: "#F43F5E",
    gradient: "linear-gradient(135deg, #D71920 0%, #FB7185 100%)",
    softBg: "rgba(225, 29, 72, 0.12)",
    borderHover: "rgba(244, 63, 94, 0.55)",
    subtitleEn: "COLORVU & IP SECURITY",
    subtitleAr: "كاميرات مراقبة وأنظمة أمنية",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/hikvision.svg",
  },
  dahua: {
    key: "dahua",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #DC2626 0%, #F97316 100%)",
    softBg: "rgba(239, 68, 68, 0.12)",
    borderHover: "rgba(239, 68, 68, 0.55)",
    subtitleEn: "FULL-COLOR & XVR",
    subtitleAr: "كاميرات مراقبة ذكية",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/dahua.svg",
  },
  "tp-link": {
    key: "tp-link",
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #0891B2 0%, #22D3EE 100%)",
    softBg: "rgba(6, 182, 212, 0.12)",
    borderHover: "rgba(34, 211, 238, 0.55)",
    subtitleEn: "OMADA & ARCHER",
    subtitleAr: "معدات شبكات وواي فاي",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/tplink.svg",
  },
  "moon link": {
    key: "moon link",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #D97706 0%, #FBBF24 100%)",
    softBg: "rgba(245, 158, 11, 0.14)",
    borderHover: "rgba(245, 158, 11, 0.55)",
    subtitleEn: "SOLAR CAM & UPS",
    subtitleAr: "كاميرات طاقة شمسية وبطاريات",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/moonlink.svg",
  },
  speeder: {
    key: "speeder",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #059669 0%, #34D399 100%)",
    softBg: "rgba(16, 185, 129, 0.14)",
    borderHover: "rgba(16, 185, 129, 0.55)",
    subtitleEn: "AVR & STABILIZER",
    subtitleAr: "منظمات جهد وحماية كهربائية",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/speeder.svg",
  },
  "power maxma": {
    key: "power maxma",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #EA580C 0%, #FB923C 100%)",
    softBg: "rgba(249, 115, 22, 0.14)",
    borderHover: "rgba(249, 115, 22, 0.55)",
    subtitleEn: "UPS & POWER SUPPLY",
    subtitleAr: "أنظمة طاقة احتياطية UPS",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/powermaxma.svg",
  },
  delux: {
    key: "delux",
    color: "#A855F7",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)",
    softBg: "rgba(168, 85, 247, 0.14)",
    borderHover: "rgba(168, 85, 247, 0.55)",
    subtitleEn: "CASES & PERIPHERALS",
    subtitleAr: "كيسات وملحقات كمبيوتر",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/delux.svg",
  },
  zkteco: {
    key: "zkteco",
    color: "#14B8A6",
    gradient: "linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%)",
    softBg: "rgba(20, 184, 166, 0.14)",
    borderHover: "rgba(20, 184, 166, 0.55)",
    subtitleEn: "BIOMETRICS & ACCESS",
    subtitleAr: "أجهزة بصمة وتحكم بالدخول",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "/assets/brands/zkteco.svg",
  },
};

export function getBrandVisualMeta(name: string): BrandVisualMeta {
  const norm = name.trim().toLowerCase();
  if (BRAND_VISUALS[norm]) return BRAND_VISUALS[norm];
  if (norm.includes("tp") && norm.includes("link")) return BRAND_VISUALS["tp-link"];
  if (norm.includes("moon")) return BRAND_VISUALS["moon link"];
  if (norm.includes("maxma") || norm.includes("power")) return BRAND_VISUALS["power maxma"];
  return {
    key: norm,
    color: "#38BDF8",
    gradient: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)",
    softBg: "rgba(56, 189, 248, 0.12)",
    borderHover: "rgba(56, 189, 248, 0.5)",
    subtitleEn: "ENTERPRISE SOLUTIONS",
    subtitleAr: "حلول وأجهزة تقنية",
    badgeAr: "متوفرة لدينا منتجات",
    badgeEn: "Available Products",
    defaultLogo: "",
  };
}

/**
 * شعار متجهي (SVG) فائق الوضوح لكل ماركة عالمية مع ألوانها الرسمية
 */
export function BrandLogoGraphic({ name, className = "h-12 w-full" }: { name: string; className?: string }) {
  const norm = name.trim().toLowerCase();

  switch (norm) {
    case "hp":
      return (
        <svg viewBox="0 0 180 56" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="hpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0096D6" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <circle cx="52" cy="28" r="23" fill="url(#hpGrad)" />
          <text
            x="52"
            y="36"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="25"
            fill="#FFFFFF"
          >
            hp
          </text>
          <text
            x="118"
            y="34"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="22"
            letterSpacing="1"
            fill="#38BDF8"
          >
            HP Inc.
          </text>
        </svg>
      );

    case "dell":
      return (
        <svg viewBox="0 0 180 56" className={className} aria-hidden="true">
          <circle cx="44" cy="28" r="21" fill="none" stroke="#0EA5E9" strokeWidth="3" />
          <text
            x="44"
            y="33"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="13"
            letterSpacing="0.5"
            fill="#38BDF8"
          >
            DELL
          </text>
          <text
            x="120"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="2"
            fill="#0EA5E9"
          >
            DELL
          </text>
        </svg>
      );

    case "lenovo":
      return (
        <svg viewBox="0 0 180 56" className={className} aria-hidden="true">
          <rect x="18" y="10" width="144" height="36" rx="9" fill="#E2231A" />
          <text
            x="90"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="22"
            letterSpacing="1.5"
            fill="#FFFFFF"
          >
            Lenovo
          </text>
        </svg>
      );

    case "asus":
      return (
        <svg viewBox="0 0 180 56" className={className} aria-hidden="true">
          <rect
            x="14"
            y="9"
            width="152"
            height="38"
            rx="10"
            fill="rgba(37, 99, 235, 0.18)"
            stroke="#3B82F6"
            strokeWidth="1.8"
          />
          <text
            x="90"
            y="36"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="4"
            fill="#60A5FA"
          >
            ASUS
          </text>
          <line x1="36" y1="27" x2="144" y2="27" stroke="#1E3A8A" strokeWidth="1.2" opacity="0.55" />
        </svg>
      );

    case "mikrotik":
      return (
        <svg viewBox="0 0 190 56" className={className} aria-hidden="true">
          <path d="M24 38L32 16L40 30L48 18L54 38H24Z" fill="#38BDF8" opacity="0.9" />
          <circle cx="32" cy="14" r="2.5" fill="#FBBF24" />
          <circle cx="48" cy="16" r="2.5" fill="#38BDF8" />
          <text
            x="116"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="21"
            letterSpacing="0.8"
            fill="#38BDF8"
          >
            MikroTik
          </text>
        </svg>
      );

    case "ubiquiti":
      return (
        <svg viewBox="0 0 185 56" className={className} aria-hidden="true">
          <rect x="18" y="10" width="36" height="36" rx="10" fill="#2563EB" />
          <path
            d="M29 20V30C29 34 32 37 36 37C40 37 43 34 43 30V20"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="43" cy="20" r="2.2" fill="#38BDF8" />
          <text
            x="116"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="19"
            letterSpacing="1.5"
            fill="#60A5FA"
          >
            UBIQUITI
          </text>
        </svg>
      );

    case "starlink":
      return (
        <svg viewBox="0 0 195 56" className={className} aria-hidden="true">
          <path d="M22 36 Q 38 16 54 22" stroke="#818CF8" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <line x1="36" y1="24" x2="44" y2="14" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="45" cy="13" r="3" fill="#38BDF8" />
          <text
            x="122"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="18"
            letterSpacing="2.5"
            fill="#A5B4FC"
          >
            STARLINK
          </text>
        </svg>
      );

    case "hikvision":
      return (
        <svg viewBox="0 0 195 56" className={className} aria-hidden="true">
          <rect x="12" y="11" width="171" height="34" rx="9" fill="rgba(225, 29, 72, 0.16)" stroke="#F43F5E" strokeWidth="1.6" />
          <circle cx="30" cy="28" r="8" fill="#E11D48" />
          <circle cx="30" cy="28" r="3.2" fill="#FFFFFF" />
          <text
            x="110"
            y="34"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="19"
            letterSpacing="1.5"
            fill="#FB7185"
          >
            HIKVISION
          </text>
        </svg>
      );

    case "dahua":
      return (
        <svg viewBox="0 0 185 56" className={className} aria-hidden="true">
          <rect x="16" y="11" width="153" height="34" rx="9" fill="rgba(239, 68, 68, 0.16)" stroke="#EF4444" strokeWidth="1.6" />
          <path d="M28 21H38C43 21 43 35 38 35H28V21Z" fill="#EF4444" />
          <text
            x="106"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="21"
            letterSpacing="1"
            fill="#F87171"
          >
            alhua
          </text>
        </svg>
      );

    case "tp-link":
      return (
        <svg viewBox="0 0 185 56" className={className} aria-hidden="true">
          <g transform="translate(20, 13)">
            <path d="M6 16V28H16V18H26V8H14C9.5 8 6 11.5 6 16Z" fill="#22D3EE" />
            <circle cx="22" cy="14" r="6" fill="none" stroke="#06B6D4" strokeWidth="3.5" />
          </g>
          <text
            x="114"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="22"
            letterSpacing="0.8"
            fill="#22D3EE"
          >
            tp-link
          </text>
        </svg>
      );

    case "moon link":
      return (
        <svg viewBox="0 0 195 56" className={className} aria-hidden="true">
          <path
            d="M36 15C28.8 15 23 20.8 23 28C23 35.2 28.8 41 36 41C39.5 41 42.6 39.6 44.8 37.3C39.8 38 35.2 34.2 35.2 29C35.2 23.8 39.8 20 44.8 20.7C42.6 17.4 39.5 15 36 15Z"
            fill="#FBBF24"
          />
          <circle cx="44" cy="21" r="2.8" fill="#38BDF8" />
          <text
            x="120"
            y="34"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="19"
            letterSpacing="0.8"
            fill="#FBBF24"
          >
            Moon Link
          </text>
        </svg>
      );

    case "speeder":
      return (
        <svg viewBox="0 0 190 56" className={className} aria-hidden="true">
          <circle cx="34" cy="28" r="15" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="2" />
          <path d="M36 16L27 29H34L32 40L42 27H35L36 16Z" fill="#34D399" />
          <text
            x="116"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="20"
            letterSpacing="1.5"
            fill="#34D399"
          >
            SPEEDER
          </text>
        </svg>
      );

    case "power maxma":
      return (
        <svg viewBox="0 0 200 56" className={className} aria-hidden="true">
          <rect x="16" y="15" width="24" height="26" rx="5" fill="rgba(249, 115, 22, 0.2)" stroke="#F97316" strokeWidth="2" />
          <rect x="23" y="11" width="10" height="4" rx="1.5" fill="#F97316" />
          <path d="M29 19L23 29H28L26 37L34 27H29L29 19Z" fill="#FB923C" />
          <text
            x="120"
            y="30"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="15"
            letterSpacing="1"
            fill="#FB923C"
          >
            POWER MAXMA
          </text>
          <text
            x="120"
            y="42"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="700"
            fontSize="9"
            letterSpacing="2"
            fill="#FDBA74"
          >
            UPS SYSTEMS
          </text>
        </svg>
      );

    case "delux":
      return (
        <svg viewBox="0 0 185 56" className={className} aria-hidden="true">
          <polygon points="34,14 46,28 34,42 22,28" fill="#A855F7" />
          <circle cx="34" cy="28" r="4" fill="#FFFFFF" />
          <text
            x="114"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="22"
            letterSpacing="2.5"
            fill="#C084FC"
          >
            DELUX
          </text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 185 56" className={className} aria-hidden="true">
          <rect x="14" y="10" width="157" height="36" rx="10" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="1.6" />
          <text
            x="92"
            y="35"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="20"
            letterSpacing="1.5"
            fill="#38BDF8"
          >
            {name.toUpperCase()}
          </text>
        </svg>
      );
  }
}

function BrandCard({
  brand,
  locale,
  productCount,
}: {
  brand: Brand;
  locale: Locale;
  productCount: number;
}) {
  const meta = getBrandVisualMeta(brand.name);
  const displayName = pick(locale, brand.name, brand.nameEn);
  const subtitleEn = brand.descriptionEn?.trim() || meta.subtitleEn;
  const subtitleAr = brand.description?.trim() || meta.subtitleAr;
  const badgeText = locale === "en" ? meta.badgeEn : meta.badgeAr;
  const countLabel =
    locale === "en"
      ? `${productCount} ${productCount === 1 ? "item" : "items"}`
      : `${productCount} ${productCount <= 10 && productCount >= 3 ? "أصناف" : "صنف"}`;

  // هل لدى الماركة شعار مخصّص مرفوع من لوحة التحكم يختلف عن الشعارات الافتراضية؟
  const hasCustomUploadedLogo =
    Boolean(brand.logo) &&
    !brand.logo.startsWith("/assets/brands/") &&
    (brand.logo.startsWith("/uploads/") || brand.logo.startsWith("http"));

  return (
    <Link
      href={`/store?brand=${encodeURIComponent(brand.name)}`}
      title={
        locale === "en"
          ? `Browse ${displayName} products in store (${countLabel})`
          : `تصفّح أصناف ماركة ${displayName} في المتجر (${countLabel})`
      }
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand"
      style={{
        boxShadow: `0 6px 24px -12px ${meta.color}40`,
      }}
    >
      {/* شريط لوني علوي بهوية الماركة */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 transition-all duration-300 group-hover:h-2"
        style={{ background: meta.gradient }}
      />

      {/* توهج خلفي ناعم بلون الماركة */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
        style={{ background: meta.color }}
      />

      {/* الصف العلوي: شارة الوكالة + عدد المنتجات */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 pt-1">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold"
          style={{
            backgroundColor: meta.softBg,
            color: meta.color,
            border: `1px solid ${meta.color}40`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
          {badgeText}
        </span>

        {productCount > 0 ? (
          <span className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-ink-soft transition-colors group-hover:border-brand/40 group-hover:text-ink">
            {countLabel}
          </span>
        ) : null}
      </div>

      {/* صندوق الشعار الرسمي */}
      <div
        className="relative z-10 my-2.5 flex h-16 w-full items-center justify-center rounded-xl border px-2 py-1.5 transition-transform duration-300 group-hover:scale-[1.04]"
        style={{
          backgroundColor: meta.softBg,
          borderColor: `${meta.color}30`,
        }}
      >
        {hasCustomUploadedLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logo}
            alt={displayName}
            loading="lazy"
            className="max-h-12 max-w-[130px] object-contain"
          />
        ) : (
          <BrandLogoGraphic name={brand.name} className="h-12 w-full" />
        )}
      </div>

      {/* اسم الماركة والتخصص الكامل بدون اقتطاع */}
      <div className="relative z-10 text-center">
        <p className="text-sm font-black tracking-tight text-ink transition-colors group-hover:text-brand-strong">
          {displayName}
        </p>
        <p
          dir="ltr"
          className="mt-0.5 text-[10px] font-extrabold uppercase leading-tight tracking-wider"
          style={{ color: meta.color }}
        >
          {subtitleEn}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold leading-snug text-ink-muted">
          {locale === "en" ? subtitleEn : subtitleAr}
        </p>
      </div>

      {/* شريط التفاعل السفلي لفتح المتجر وفلترة الأصناف */}
      <div
        className="relative z-10 mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-line/70 bg-surface-2/80 px-2.5 py-1.5 text-[11px] font-extrabold text-ink-soft transition-all duration-200 group-hover:border-transparent group-hover:text-white"
        style={{
          backgroundImage: "none",
        }}
      >
        <span className="transition-transform duration-200 group-hover:scale-105" style={{ color: meta.color }}>
          ⚡
        </span>
        <span className="group-hover:text-brand-strong">
          {locale === "en" ? "Filter Brand Items ←" : "تصفّح أصناف الماركة ←"}
        </span>
      </div>
    </Link>
  );
}

export function BrandsBar({
  brands,
  title,
  subtitle,
  locale,
  productCounts = {},
}: {
  brands: Brand[];
  title: string;
  subtitle: string;
  officialAgentLabel?: string;
  visitLabel?: string;
  locale: Locale;
  productCounts?: Record<string, number>;
}) {
  if (brands.length === 0) return null;

  return (
    <section
      aria-labelledby="brands-heading"
      className="mx-auto max-w-7xl px-4 py-8"
    >
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface via-surface to-surface-2 p-5 shadow-xl sm:p-7">
        {/* زخرفة ضوئية خلفية */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 h-48 w-96 rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-96 rounded-full bg-amber-500/10 blur-3xl"
        />

        {/* رأس شريط الماركات */}
        <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line/80 pb-4">
          <div className="flex items-center gap-3.5">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/15 text-2xl shadow-inner"
            >
              🏆
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="brands-heading" className="text-xl font-black text-ink sm:text-2xl">
                  {title}
                </h2>
                <span className="rounded-full border border-brand/40 bg-brand/15 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-strong">
                  {locale === "en" ? `${brands.length} Global Brands` : `${brands.length} ماركة عالمية`}
                </span>
              </div>
              {subtitle ? (
                <p className="mt-1 text-xs font-semibold text-ink-soft sm:text-sm">
                  {subtitle}{" "}
                  <span className="font-bold text-brand-strong">
                    {locale === "en"
                      ? "— Click any brand to open the store & filter its products."
                      : "— انقر على أي ماركة لفتح المتجر وفلترة أصنافها مباشرة."}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          <Link
            href="/store"
            className="inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/15 px-4 py-2.5 text-xs font-black text-brand-strong transition hover:bg-brand hover:text-slate-950 sm:text-sm"
          >
            <span>{locale === "en" ? "View All Brands in Store" : "عرض جميع الماركات في المتجر"}</span>
            <span aria-hidden="true">{locale === "en" ? "→" : "←"}</span>
          </Link>
        </div>

        {/* شبكة بطاقات الماركات */}
        <ul className="relative z-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {brands.map((b) => {
            const count =
              productCounts[b.name] ??
              productCounts[b.name.trim().toLowerCase()] ??
              0;
            return (
              <li key={b.id} className="flex">
                <div className="w-full flex">
                  <BrandCard brand={b} locale={locale} productCount={count} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * شريط فلترة الماركات التفاعلي داخل صفحة المتجر (/store)
 * يتيح للمستخدم التنقل السريع بين الماركات بنقرة واحدة مع عرض الشعار وعدد الأصناف
 */
export function StoreBrandsFilterStrip({
  brands,
  activeBrand,
  category,
  search,
  sort,
  locale,
  productCounts = {},
  totalProductsCount = 0,
}: {
  brands: Brand[];
  activeBrand?: string;
  category?: string;
  search?: string;
  sort?: string;
  locale: Locale;
  productCounts?: Record<string, number>;
  totalProductsCount?: number;
}) {
  if (brands.length === 0) return null;

  function buildStoreHref(targetBrand?: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (targetBrand) params.set("brand", targetBrand);
    if (sort && sort !== "default") params.set("sort", sort);
    const qs = params.toString();
    return qs ? `/store?${qs}` : "/store";
  }

  const normalizedActive = activeBrand?.trim().toLowerCase() || "";
  const matchedBrandObj = brands.find(
    (b) => b.name.trim().toLowerCase() === normalizedActive
  );
  const activeMeta = activeBrand ? getBrandVisualMeta(activeBrand) : null;

  return (
    <div className="mt-6 space-y-4">
      <div className="panel overflow-hidden p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-lg">
              🏷️
            </span>
            <h2 className="text-sm font-black text-ink sm:text-base">
              {locale === "en"
                ? "Quick Filter by Brand / Official Agency"
                : "فلترة سريعة حسب الماركة / الوكالة المعتمدة"}
            </h2>
          </div>
          {activeBrand ? (
            <Link
              href={buildStoreHref(undefined)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-extrabold text-rose-300 transition hover:bg-rose-500/25"
            >
              <span>✕</span>
              <span>
                {locale === "en" ? "Clear Brand Filter" : "إلغاء فلتر الماركة"}
              </span>
            </Link>
          ) : (
            <span className="text-xs font-semibold text-ink-muted">
              {locale === "en"
                ? "Select any brand to filter products"
                : "اختر أي ماركة لعرض أصنافها فقط"}
            </span>
          )}
        </div>

        {/* أزرار الماركات المصغّرة بالألوان والشعارات */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1">
          <Link
            href={buildStoreHref(undefined)}
            className={`group flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-black transition ${
              !activeBrand
                ? "border-brand bg-brand/20 text-ink shadow-md"
                : "border-line bg-surface-2 text-ink-soft hover:border-brand/50 hover:text-ink"
            }`}
          >
            <span>🌐</span>
            <span>{locale === "en" ? "All Brands" : "كل الماركات"}</span>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-extrabold text-brand-strong">
              {totalProductsCount}
            </span>
          </Link>

          {brands.map((b) => {
            const meta = getBrandVisualMeta(b.name);
            const isSelected = b.name.trim().toLowerCase() === normalizedActive;
            const count =
              productCounts[b.name] ??
              productCounts[b.name.trim().toLowerCase()] ??
              0;
            const displayName = pick(locale, b.name, b.nameEn);

            return (
              <Link
                key={b.id}
                href={buildStoreHref(isSelected ? undefined : b.name)}
                className={`group relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected
                    ? "bg-surface shadow-lg ring-2"
                    : "border-line bg-surface-2/90 hover:bg-surface"
                }`}
                style={{
                  borderColor: isSelected ? meta.color : undefined,
                  boxShadow: isSelected ? `0 4px 18px -4px ${meta.color}55` : undefined,
                }}
              >
                <span
                  aria-hidden="true"
                  className=" inset-y-0 start-0 w-1 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <div
                  className="flex h-7 w-16 items-center justify-center rounded-lg px-1"
                  style={{
                    backgroundColor: meta.softBg,
                    border: `1px solid ${meta.color}35`,
                  }}
                >
                  <BrandLogoGraphic name={b.name} className="h-6 w-full" />
                </div>
                <div className="text-start">
                  <p className="text-xs font-black leading-none text-ink">
                    {displayName}
                  </p>
                  <p
                    dir="ltr"
                    className="mt-0.5 text-[9px] font-bold uppercase leading-none"
                    style={{ color: meta.color }}
                  >
                    {meta.subtitleEn}
                  </p>
                </div>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold"
                  style={{
                    backgroundColor: meta.softBg,
                    color: meta.color,
                  }}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* لافتة الماركة النشطة عند اختيار ماركة معينة */}
      {activeBrand && activeMeta ? (
        <div
          className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border p-4 sm:p-5"
          style={{
            borderColor: `${activeMeta.color}66`,
            background: `linear-gradient(135deg, ${activeMeta.softBg} 0%, rgba(15, 23, 42, 0.4) 100%)`,
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="flex h-16 w-36 items-center justify-center rounded-xl border p-2 shadow-inner"
              style={{
                backgroundColor: "rgba(9, 16, 28, 0.75)",
                borderColor: `${activeMeta.color}50`,
              }}
            >
              <BrandLogoGraphic name={activeBrand} className="h-12 w-full" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
                  style={{
                    backgroundColor: activeMeta.softBg,
                    color: activeMeta.color,
                    border: `1px solid ${activeMeta.color}50`,
                  }}
                >
                  {locale === "en" ? activeMeta.badgeEn : activeMeta.badgeAr}
                </span>
                <h3 className="text-lg font-black text-ink sm:text-xl">
                  {locale === "en"
                    ? `${activeBrand} Official Products`
                    : `أصناف ومنتجات ${matchedBrandObj ? pick(locale, matchedBrandObj.name, matchedBrandObj.nameEn) : activeBrand}`}
                </h3>
              </div>
              <p className="mt-1 text-xs font-semibold text-ink-soft sm:text-sm">
                {locale === "en"
                  ? matchedBrandObj?.descriptionEn || activeMeta.subtitleEn
                  : matchedBrandObj?.description || activeMeta.subtitleAr}{" "}
                <span dir="ltr" className="font-bold opacity-80" style={{ color: activeMeta.color }}>
                  ({activeMeta.subtitleEn})
                </span>
              </p>
            </div>
          </div>

          <Link
            href={buildStoreHref(undefined)}
            className="btn-ghost text-xs font-extrabold"
          >
            {locale === "en" ? "Show All Brands" : "عرض جميع الماركات"}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { canAccessTab, requireUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import { updateSettings } from "@/lib/queries";
import type { Currency, SocialLink, Theme } from "@/lib/types";

function s(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function b(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}
function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** سطر لكل رابط: icon|label|url  (أو label|url، أو url فقط). */
function parseSocials(raw: string): SocialLink[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length >= 3) return { icon: parts[0], label: parts[1], url: parts[2] };
      if (parts.length === 2) return { icon: "🔗", label: parts[0], url: parts[1] };
      return { icon: "🔗", label: parts[0], url: parts[0] };
    })
    .filter((l) => l.url.length > 0);
}

export async function saveSettingsAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;

  const rawRates = {
    rateYER: Number(fd.get("rateYER")),
    rateSAR: Number(fd.get("rateSAR")),
  };

  updateSettings({
    // الهوية والشركة
    brandName: s(fd, "brandName") || "برونت كمبيوتر",
    brandNameEn: s(fd, "brandNameEn"),
    slogan: s(fd, "slogan"),
    sloganEn: s(fd, "sloganEn"),
    announcement: s(fd, "announcement"),
    announcementEn: s(fd, "announcementEn"),
    email: s(fd, "email"),
    landline: s(fd, "landline"),
    whatsappNumber: s(fd, "whatsappNumber"),
    secondarySalesWhatsapp: s(fd, "secondarySalesWhatsapp"),
    mgmtWhatsapp1: s(fd, "mgmtWhatsapp1"),
    mgmtWhatsapp2: s(fd, "mgmtWhatsapp2"),
    address: s(fd, "address"),
    addressEn: s(fd, "addressEn"),
    workingHours: s(fd, "workingHours"),
    workingHoursEn: s(fd, "workingHoursEn"),
    ceoName: s(fd, "ceoName"),
    ceoTitle: s(fd, "ceoTitle"),
    ceoTitleEn: s(fd, "ceoTitleEn"),
    footerNote: s(fd, "footerNote"),
    footerNoteEn: s(fd, "footerNoteEn"),
    mapUrl: s(fd, "mapUrl"),

    // هويتنا وريادتنا
    identityTitle: s(fd, "identityTitle"),
    identityTitleEn: s(fd, "identityTitleEn"),
    identityText: s(fd, "identityText"),
    identityTextEn: s(fd, "identityTextEn"),
    visionTitle: s(fd, "visionTitle"),
    visionTitleEn: s(fd, "visionTitleEn"),
    visionText: s(fd, "visionText"),
    visionTextEn: s(fd, "visionTextEn"),

    // شريط الماركات
    brandBarTitle: s(fd, "brandBarTitle"),
    brandBarTitleEn: s(fd, "brandBarTitleEn"),
    brandBarSubtitle: s(fd, "brandBarSubtitle"),
    brandBarSubtitleEn: s(fd, "brandBarSubtitleEn"),

    // مقدّمة الصفحة الرئيسية
    heroBadge: s(fd, "heroBadge"),
    heroBadgeEn: s(fd, "heroBadgeEn"),
    heroTitle: s(fd, "heroTitle"),
    heroTitleEn: s(fd, "heroTitleEn"),
    heroSubtitle: s(fd, "heroSubtitle"),
    heroSubtitleEn: s(fd, "heroSubtitleEn"),

    // المظهر والعملات
    defaultTheme: oneOf<Theme>(s(fd, "defaultTheme"), ["dark", "light"], "dark"),
    defaultCurrency: oneOf<Currency>(s(fd, "defaultCurrency"), ["USD", "YER", "SAR"], "USD"),
    showPricesGlobal: b(fd, "showPricesGlobal"),
    primaryColor: s(fd, "primaryColor") || "#00A8FF",
    secondaryColor: s(fd, "secondaryColor") || "#38B6FF",
    navyColor: s(fd, "navyColor") || "#0D1B2A",
    rateYER: Number.isFinite(rawRates.rateYER) && rawRates.rateYER > 0 ? rawRates.rateYER : 2050,
    rateSAR: Number.isFinite(rawRates.rateSAR) && rawRates.rateSAR > 0 ? rawRates.rateSAR : 3.75,

    // الروابط الاجتماعية
    socialLinks: parseSocials(s(fd, "socialLinks")),
    smsWebhookUrl: s(fd, "smsWebhookUrl"),
  });

  audit(user.id, "settings_saved");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

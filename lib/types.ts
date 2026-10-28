export type Currency = "USD" | "YER" | "SAR";

/** لغة العرض المدعومة. */
export type Locale = "ar" | "en";

/** وضع الألوان. */
export type Theme = "dark" | "light";

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface StoreSettings {
  brandName: string;
  slogan: string;
  announcement: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultCurrency: Currency;
  rateYER: number;
  rateSAR: number;
  showPricesGlobal: boolean;
  primaryColor: string;
  secondaryColor: string;
  navyColor: string;
  whatsappNumber: string;
  secondarySalesWhatsapp: string;
  mgmtWhatsapp1: string;
  mgmtWhatsapp2: string;
  landline: string;
  email: string;
  address: string;
  ceoName: string;
  ceoTitle: string;

  // ---- نسخ إنجليزية (اختيارية؛ عند فراغها يُعرض النص العربي) ----
  brandNameEn: string;
  sloganEn: string;
  announcementEn: string;
  heroBadgeEn: string;
  heroTitleEn: string;
  heroSubtitleEn: string;
  addressEn: string;
  ceoTitleEn: string;

  // ---- شريط الماركات والوكلاء ----
  brandBarTitle: string;
  brandBarTitleEn: string;
  brandBarSubtitle: string;
  brandBarSubtitleEn: string;

  // ---- هويتنا الرسمية وريادتنا التقنية ----
  identityTitle: string;
  identityTitleEn: string;
  identityText: string;
  identityTextEn: string;
  visionTitle: string;
  visionTitleEn: string;
  visionText: string;
  visionTextEn: string;

  // ---- إعدادات عامة إضافية ----
  defaultTheme: Theme;
  workingHours: string;
  workingHoursEn: string;
  mapUrl: string;
  footerNote: string;
  footerNoteEn: string;
  socialLinks: SocialLink[];
  smsWebhookUrl: string;
}

export interface Product {
  id: string;
  sku: string;
  brandCode: string;
  model: string;
  name: string;
  nameEn: string;
  category: string;
  brand: string;
  price: number;
  oldPrice: number | null;
  hidePrice: boolean;
  badge: string | null;
  badgeEn: string;
  iconType: string;
  featured: boolean;
  specs: string[];
  specsEn: string[];
  description: string;
  descriptionEn: string;
  imageUrl: string | null;
  officialSpecUrl: string | null;
  active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  /** وكيل رسمي معتمد */
  isAgent: boolean;
  website: string;
  description: string;
  descriptionEn: string;
  sort: number;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  image: string;
  sort: number;
  active: boolean;
}

export interface Slide {
  id: string;
  badge: string;
  badgeEn: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaLabelEn: string;
  ctaHref: string;
  sort: number;
  active: boolean;
}

export interface BusinessArea {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  categoryFilter: string;
  desc: string;
  descEn: string;
  sort: number;
  active: boolean;
}

export interface Project {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  location: string;
  desc: string;
  descEn: string;
  image: string;
  sort: number;
  active: boolean;
}

export interface Post {
  id: string;
  title: string;
  titleEn: string;
  tag: string;
  tagEn: string;
  date: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  image: string;
  sort: number;
  active: boolean;
}

export interface SupportTicket {
  id: string;
  title: string;
  client: string;
  status: string;
  engineer: string;
}

export interface BankAccountEntry {
  label: string;
  number: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  badge: string;
  badgeColor: string;
  accountHolder: string;
  colSpan2: boolean;
  accounts: BankAccountEntry[];
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  phone: string;
  roleKey: string;
  roleTitle: string;
  icon: string;
  badgeClass: string;
  description: string;
  allowedTabs: string[];
  canEditPrices: boolean;
  canDeleteItems: boolean;
  canExportSite: boolean;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string | null;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  priceUsd: number;
  qty: number;
}

export type OrderStatus = "new" | "in_progress" | "delivered" | "cancelled";
export type OrderType = "store" | "rfq" | "tender";

export interface Order {
  id: number;
  orderNo: string;
  type: OrderType;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  paymentMethod: string | null;
  notes: string | null;
  items: OrderItem[];
  itemsCount: number;
  totalUsd: number;
  currency: Currency;
  status: OrderStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "جديد",
  in_progress: "قيد المتابعة",
  delivered: "تم التوريد",
  cancelled: "ملغي",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  store: "طلب متجر",
  rfq: "طلب عرض سعر",
  tender: "مناقصة / توريد",
};

/** الشارات الملوّنة: نصوص داكنة على خلفيات فاتحة لضمان تباين يمرّ فحص الوصولية. */
export const BADGE_STYLES: Record<string, string> = {
  cyan: "bg-cyan-300 text-[#08313f]",
  blue: "bg-sky-300 text-[#0b2f4a]",
  green: "bg-emerald-300 text-[#06301c]",
  amber: "bg-amber-300 text-[#3b2606]",
  purple: "bg-violet-300 text-[#2a1055]",
  gold: "bg-[#f0d47a] text-[#3d2f05]",
  slate: "bg-slate-300 text-[#1f2937]",
};

export function badgeStyle(color?: string | null): string {
  const key = (color || "cyan").toLowerCase();
  return BADGE_STYLES[key] ?? BADGE_STYLES.cyan;
}

/**
 * يختار النص حسب اللغة مع الرجوع للعربية عند فراغ النص الإنجليزي.
 * يعمل على مستوى الخادم والعميل على السواء.
 */
export function pick(locale: Locale, ar: string, en?: string | null): string {
  if (locale === "en" && en && en.trim().length > 0) return en;
  return ar;
}

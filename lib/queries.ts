import { getDb } from "./db";
import type {
  BankAccount,
  Brand,
  BusinessArea,
  Category,
  Currency,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  Post,
  Product,
  Project,
  Slide,
  SocialLink,
  StoreSettings,
  SupportTicket,
} from "./types";
import { randomToken } from "./crypto";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function rows<T>(sql: string, ...params: unknown[]): T[] {
  return getDb().prepare(sql).all(...(params as never[])) as T[];
}

function row<T>(sql: string, ...params: unknown[]): T | undefined {
  return getDb().prepare(sql).get(...(params as never[])) as T | undefined;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value.length === 0) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomToken(4)}`;
}

function nextSort(table: string): number {
  const r = row<{ m: number | null }>(`SELECT MAX(sort) AS m FROM ${table}`);
  return Number(r?.m ?? -1) + 1;
}

const TRUE = 1;
const FALSE = 0;
const bool = (v: unknown, fallback = false): number => {
  if (v === undefined || v === null) return fallback ? TRUE : FALSE;
  if (typeof v === "boolean") return v ? TRUE : FALSE;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true" || s === "on" || s === "yes" ? TRUE : FALSE;
};
const str = (v: unknown): string => (v === undefined || v === null ? "" : String(v));
const optStr = (v: unknown): string | null => {
  const s = str(v).trim();
  return s.length === 0 ? null : s;
};

// ---------------------------------------------------------------------------
// settings
// ---------------------------------------------------------------------------
const DEFAULT_SETTINGS: StoreSettings = {
  brandName: "برونت كمبيوتر",
  slogan: "",
  announcement: "",
  heroBadge: "",
  heroTitle: "",
  heroSubtitle: "",
  defaultCurrency: "USD",
  rateYER: 2050,
  rateSAR: 3.75,
  showPricesGlobal: true,
  primaryColor: "#00A8FF",
  secondaryColor: "#38B6FF",
  navyColor: "#0D1B2A",
  whatsappNumber: "",
  secondarySalesWhatsapp: "",
  mgmtWhatsapp1: "",
  mgmtWhatsapp2: "",
  landline: "",
  email: "",
  address: "",
  ceoName: "",
  ceoTitle: "",
  brandNameEn: "ProNet Computer",
  sloganEn: "Precision Services • Integrated Technology Solutions",
  announcementEn: "",
  heroBadgeEn: "",
  heroTitleEn: "",
  heroSubtitleEn: "",
  addressEn: "",
  ceoTitleEn: "",
  brandBarTitle: "الماركات والوكلاء المعتمدون",
  brandBarTitleEn: "Brands & Authorized Agents",
  brandBarSubtitle: "نتعامل مع أفضل العلامات العالمية ونوفّرها بأصليتها وضمانها الرسمي.",
  brandBarSubtitleEn: "We supply leading global brands with genuine products and official warranty.",
  identityTitle: "هويتنا الرسمية",
  identityTitleEn: "Our Official Identity",
  identityText: "",
  identityTextEn: "",
  visionTitle: "ريادتنا التقنية",
  visionTitleEn: "Our Technical Leadership",
  visionText: "",
  visionTextEn: "",
  defaultTheme: "dark",
  workingHours: "السبت - الخميس: 8:00 صباحًا - 9:00 مساءً",
  workingHoursEn: "Sat - Thu: 8:00 AM - 9:00 PM",
  mapUrl: "",
  footerNote: "",
  footerNoteEn: "",
  socialLinks: [],
  smsWebhookUrl: "",
};

export function getSettings(): StoreSettings {
  const result: Record<string, unknown> = {};
  for (const r of rows<{ key: string; value: string }>("SELECT key, value FROM settings")) {
    result[r.key] = parseJson(r.value, r.value);
  }
  return { ...DEFAULT_SETTINGS, ...(result as Partial<StoreSettings>) };
}

export function updateSettings(patch: Partial<StoreSettings>): void {
  const stmt = getDb().prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    stmt.run(key, JSON.stringify(value));
  }
}

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------
interface CategoryRow {
  id: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  image: string | null;
  sort: number;
  active: number;
}

function mapCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    nameEn: r.name_en ?? "",
    icon: r.icon ?? "",
    image: r.image ?? "",
    sort: r.sort,
    active: r.active === 1,
  };
}

export function getCategoryList(includeInactive = false): Category[] {
  const where = includeInactive ? "" : "WHERE active = 1";
  return rows<CategoryRow>(`SELECT * FROM categories ${where} ORDER BY sort`).map(mapCategory);
}

/** أسماء التصنيفات (المفتاح القانوني المستخدم في فلترة المنتجات). */
export function getCategories(): string[] {
  return getCategoryList(true).map((c) => c.name);
}

export function upsertCategory(input: Partial<Category> & { name: string }): string {
  const db = getDb();
  const id = input.id && input.id.length > 0 ? input.id : newId("cat");
  const existing = row<CategoryRow>("SELECT * FROM categories WHERE id = ?", id);
  if (existing) {
    db.prepare("UPDATE categories SET name = ?, name_en = ?, icon = ?, image = ?, sort = ?, active = ? WHERE id = ?").run(
      input.name,
      optStr(input.nameEn),
      optStr(input.icon),
      optStr(input.image),
      input.sort ?? existing.sort,
      input.active === undefined ? existing.active : bool(input.active, true),
      id,
    );
  } else {
    db.prepare("INSERT INTO categories (id, name, name_en, icon, image, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id,
      input.name,
      optStr(input.nameEn),
      optStr(input.icon),
      optStr(input.image),
      input.sort ?? nextSort("categories"),
      input.active === undefined ? TRUE : bool(input.active, true),
    );
  }
  return id;
}

export function deleteCategory(id: string): void {
  getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// ---------------------------------------------------------------------------
// brands (الماركات والوكلاء)
// ---------------------------------------------------------------------------
interface BrandRow {
  id: string;
  name: string;
  name_en: string | null;
  logo: string | null;
  is_agent: number;
  website: string | null;
  description: string | null;
  description_en: string | null;
  sort: number;
  active: number;
}

const BRAND_DEFAULTS: Record<string, { logo: string; descAr: string; descEn: string }> = {
  hp: { logo: "/assets/brands/hp.svg", descAr: "لابتوبات وطابعات أعمال", descEn: "BUSINESS & LASERJET" },
  dell: { logo: "/assets/brands/dell.svg", descAr: "أجهزة مكتبية ولابتوبات", descEn: "OPTIPLEX & VOSTRO" },
  lenovo: { logo: "/assets/brands/lenovo.svg", descAr: "حواسيب عملية ومكتبية", descEn: "THINKPAD & IDEAPAD" },
  asus: { logo: "/assets/brands/asus.svg", descAr: "أجهزة احترافية وألعاب", descEn: "EXPERTBOOK & TUF" },
  mikrotik: { logo: "/assets/brands/mikrotik.svg", descAr: "راوترات وسويتشات شبكات", descEn: "ROUTEROS & SWITCHING" },
  ubiquiti: { logo: "/assets/brands/ubiquiti.svg", descAr: "نقاط وصول وربط لاسلكي", descEn: "UNIFI & AIRMAX" },
  starlink: { logo: "/assets/brands/starlink.svg", descAr: "إنترنت فضائي عالي السرعة", descEn: "HIGH-SPEED SATELLITE" },
  hikvision: { logo: "/assets/brands/hikvision.svg", descAr: "كاميرات مراقبة وأنظمة أمنية", descEn: "COLORVU & IP SECURITY" },
  dahua: { logo: "/assets/brands/dahua.svg", descAr: "كاميرات مراقبة ذكية", descEn: "FULL-COLOR & XVR" },
  "tp-link": { logo: "/assets/brands/tplink.svg", descAr: "معدات شبكات وواي فاي", descEn: "OMADA & ARCHER" },
  "moon link": { logo: "/assets/brands/moonlink.svg", descAr: "كاميرات طاقة شمسية وبطاريات", descEn: "SOLAR CAM & UPS" },
  speeder: { logo: "/assets/brands/speeder.svg", descAr: "منظمات جهد وحماية كهربائية", descEn: "AVR & STABILIZER" },
  "power maxma": { logo: "/assets/brands/powermaxma.svg", descAr: "أنظمة طاقة احتياطية UPS", descEn: "UPS & POWER SUPPLY" },
  delux: { logo: "/assets/brands/delux.svg", descAr: "كيسات وملحقات كمبيوتر", descEn: "CASES & PERIPHERALS" },
};

function mapBrand(r: BrandRow): Brand {
  const def = BRAND_DEFAULTS[r.name.trim().toLowerCase()];
  return {
    id: r.id,
    name: r.name,
    nameEn: r.name_en ?? r.name,
    logo: r.logo || def?.logo || "",
    isAgent: r.is_agent === 1 || Boolean(def),
    website: r.website ?? "",
    description: r.description || def?.descAr || "",
    descriptionEn: r.description_en || def?.descEn || "",
    sort: r.sort,
    active: r.active === 1,
  };
}

export function getBrandList(includeInactive = false): Brand[] {
  const where = includeInactive ? "" : "WHERE active = 1";
  return rows<BrandRow>(`SELECT * FROM brands ${where} ORDER BY sort`).map(mapBrand);
}

/** أسماء الماركات (المفتاح القانوني المستخدم في فلترة المنتجات). */
export function getBrands(): string[] {
  return getBrandList(true).map((b) => b.name);
}

export function upsertBrand(input: Partial<Brand> & { name: string }): string {
  const db = getDb();
  const id = input.id && input.id.length > 0 ? input.id : newId("brand");
  const existing = row<BrandRow>("SELECT * FROM brands WHERE id = ?", id);
  if (existing) {
    db.prepare(
      `UPDATE brands SET name = ?, name_en = ?, logo = ?, is_agent = ?, website = ?, description = ?, description_en = ?, sort = ?, active = ? WHERE id = ?`,
    ).run(
      input.name,
      optStr(input.nameEn),
      optStr(input.logo),
      input.isAgent === undefined ? existing.is_agent : bool(input.isAgent),
      optStr(input.website),
      optStr(input.description),
      optStr(input.descriptionEn),
      input.sort ?? existing.sort,
      input.active === undefined ? existing.active : bool(input.active, true),
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO brands (id, name, name_en, logo, is_agent, website, description, description_en, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      input.name,
      optStr(input.nameEn),
      optStr(input.logo),
      bool(input.isAgent),
      optStr(input.website),
      optStr(input.description),
      optStr(input.descriptionEn),
      input.sort ?? nextSort("brands"),
      input.active === undefined ? TRUE : bool(input.active, true),
    );
  }
  return id;
}

export function deleteBrand(id: string): void {
  getDb().prepare("DELETE FROM brands WHERE id = ?").run(id);
}

// ---------------------------------------------------------------------------
// products
// ---------------------------------------------------------------------------
interface ProductRow {
  id: string;
  sku: string | null;
  brand_code: string | null;
  model: string | null;
  name: string;
  name_en: string | null;
  category: string | null;
  brand: string | null;
  price: number;
  old_price: number | null;
  hide_price: number;
  badge: string | null;
  badge_en: string | null;
  icon_type: string | null;
  featured: number;
  specs: string;
  specs_en: string;
  description: string | null;
  description_en: string | null;
  image_url: string | null;
  official_spec_url: string | null;
  active: number;
  sort: number;
}

function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    sku: r.sku ?? "",
    brandCode: r.brand_code ?? "",
    model: r.model ?? "",
    name: r.name,
    nameEn: r.name_en ?? "",
    category: r.category ?? "",
    brand: r.brand ?? "",
    price: Number(r.price),
    oldPrice: r.old_price === null ? null : Number(r.old_price),
    hidePrice: r.hide_price === 1,
    badge: r.badge,
    badgeEn: r.badge_en ?? "",
    iconType: r.icon_type ?? "box",
    featured: r.featured === 1,
    specs: parseJson<string[]>(r.specs, []),
    specsEn: parseJson<string[]>(r.specs_en, []),
    description: r.description ?? "",
    descriptionEn: r.description_en ?? "",
    imageUrl: r.image_url,
    officialSpecUrl: r.official_spec_url,
    active: r.active === 1,
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  sort?: "default" | "price-asc" | "price-desc" | "name";
  featuredOnly?: boolean;
  limit?: number;
  /** للوحة التحكم: يشمل الأصناف غير المعروضة حتى يمكن إعادة تفعيلها. */
  includeInactive?: boolean;
}

export function getProducts(filters: ProductFilters = {}): Product[] {
  const where: string[] = [];
  const params: unknown[] = [];

  if (!filters.includeInactive) {
    where.push("active = 1");
  }

  if (filters.search) {
    where.push("(name LIKE ? OR name_en LIKE ? OR model LIKE ? OR sku LIKE ? OR description LIKE ? OR brand LIKE ?)");
    const like = `%${filters.search}%`;
    params.push(like, like, like, like, like, like);
  }
  if (filters.category) {
    where.push("category = ?");
    params.push(filters.category);
  }
  if (filters.brand) {
    where.push("LOWER(TRIM(brand)) = LOWER(TRIM(?))");
    params.push(filters.brand);
  }
  if (filters.featuredOnly) {
    where.push("featured = 1");
  }

  const orderBy =
    filters.sort === "price-asc"
      ? "price ASC"
      : filters.sort === "price-desc"
        ? "price DESC"
        : filters.sort === "name"
          ? "name ASC"
          : "sort ASC";

  const limit = filters.limit && filters.limit > 0 ? ` LIMIT ${Math.floor(filters.limit)}` : "";
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const sql = `SELECT * FROM products ${whereSql} ORDER BY ${orderBy}${limit}`;
  return rows<ProductRow>(sql, ...params).map(mapProduct);
}

export function getProduct(id: string): Product | null {
  const r = row<ProductRow>("SELECT * FROM products WHERE id = ? AND active = 1", id);
  return r ? mapProduct(r) : null;
}

export function countProducts(): number {
  return (row<{ c: number }>("SELECT COUNT(*) AS c FROM products WHERE active = 1")?.c ?? 0) as number;
}

export function getBrandProductCounts(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const r of rows<{ brand: string | null; cnt: number }>(
    "SELECT brand, COUNT(*) AS cnt FROM products WHERE active = 1 AND brand IS NOT NULL GROUP BY brand"
  )) {
    if (r.brand) {
      result[r.brand] = Number(r.cnt);
      result[r.brand.trim().toLowerCase()] = Number(r.cnt);
    }
  }
  return result;
}

export function upsertProduct(input: Partial<Product> & { name: string }): string {
  const db = getDb();
  const id = input.id && input.id.length > 0 ? input.id : newId("p");
  const existing = row<ProductRow>("SELECT * FROM products WHERE id = ?", id);
  const specs = Array.isArray(input.specs) ? input.specs : [];
  const specsEn = Array.isArray(input.specsEn) ? input.specsEn : [];
  const oldPrice = input.oldPrice === null || input.oldPrice === undefined ? null : Number(input.oldPrice);

  if (existing) {
    db.prepare(
      `UPDATE products SET sku = ?, brand_code = ?, model = ?, name = ?, name_en = ?, category = ?, brand = ?,
        price = ?, old_price = ?, hide_price = ?, badge = ?, badge_en = ?, icon_type = ?, featured = ?,
        specs = ?, specs_en = ?, description = ?, description_en = ?, image_url = ?, official_spec_url = ?,
        active = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(
      optStr(input.sku),
      optStr(input.brandCode),
      optStr(input.model),
      input.name,
      optStr(input.nameEn),
      optStr(input.category),
      optStr(input.brand),
      Number(input.price ?? existing.price),
      oldPrice,
      input.hidePrice === undefined ? existing.hide_price : bool(input.hidePrice),
      optStr(input.badge),
      optStr(input.badgeEn),
      optStr(input.iconType) ?? "box",
      input.featured === undefined ? existing.featured : bool(input.featured),
      JSON.stringify(specs),
      JSON.stringify(specsEn),
      optStr(input.description),
      optStr(input.descriptionEn),
      optStr(input.imageUrl),
      optStr(input.officialSpecUrl),
      input.active === undefined ? existing.active : bool(input.active, true),
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO products (id, sku, brand_code, model, name, name_en, category, brand, price, old_price,
        hide_price, badge, badge_en, icon_type, featured, specs, specs_en, description, description_en,
        image_url, official_spec_url, active, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      optStr(input.sku),
      optStr(input.brandCode),
      optStr(input.model),
      input.name,
      optStr(input.nameEn),
      optStr(input.category),
      optStr(input.brand),
      Number(input.price ?? 0),
      oldPrice,
      bool(input.hidePrice),
      optStr(input.badge),
      optStr(input.badgeEn),
      optStr(input.iconType) ?? "box",
      bool(input.featured),
      JSON.stringify(specs),
      JSON.stringify(specsEn),
      optStr(input.description),
      optStr(input.descriptionEn),
      optStr(input.imageUrl),
      optStr(input.officialSpecUrl),
      input.active === undefined ? TRUE : bool(input.active, true),
      nextSort("products"),
    );
  }
  return id;
}

export function deleteProduct(id: string): void {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

// ---------------------------------------------------------------------------
// slides (لوحة العرض التلقائية)
// ---------------------------------------------------------------------------
interface SlideRow {
  id: string;
  badge: string | null;
  badge_en: string | null;
  title: string;
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  image: string | null;
  image_alt: string | null;
  cta_label: string | null;
  cta_label_en: string | null;
  cta_href: string | null;
  sort: number;
  active: number;
}

function mapSlide(r: SlideRow): Slide {
  return {
    id: r.id,
    badge: r.badge ?? "",
    badgeEn: r.badge_en ?? "",
    title: r.title,
    titleEn: r.title_en ?? "",
    subtitle: r.subtitle ?? "",
    subtitleEn: r.subtitle_en ?? "",
    image: r.image ?? "",
    imageAlt: r.image_alt ?? "",
    ctaLabel: r.cta_label ?? "",
    ctaLabelEn: r.cta_label_en ?? "",
    ctaHref: r.cta_href ?? "",
    sort: r.sort,
    active: r.active === 1,
  };
}

export function getSlides(opts: { includeInactive?: boolean } = {}): Slide[] {
  const where = opts.includeInactive ? "" : "WHERE active = 1";
  return rows<SlideRow>(`SELECT * FROM slides ${where} ORDER BY sort`).map(mapSlide);
}

export function upsertSlide(input: Partial<Slide> & { title: string }): string {
  const db = getDb();
  const id = input.id && input.id.length > 0 ? input.id : newId("s");
  const existing = row<SlideRow>("SELECT * FROM slides WHERE id = ?", id);
  if (existing) {
    db.prepare(
      `UPDATE slides SET badge = ?, badge_en = ?, title = ?, title_en = ?, subtitle = ?, subtitle_en = ?,
        image = ?, image_alt = ?, cta_label = ?, cta_label_en = ?, cta_href = ?, sort = ?, active = ? WHERE id = ?`,
    ).run(
      optStr(input.badge),
      optStr(input.badgeEn),
      input.title,
      optStr(input.titleEn),
      optStr(input.subtitle),
      optStr(input.subtitleEn),
      optStr(input.image),
      optStr(input.imageAlt),
      optStr(input.ctaLabel),
      optStr(input.ctaLabelEn),
      optStr(input.ctaHref),
      input.sort ?? existing.sort,
      input.active === undefined ? existing.active : bool(input.active, true),
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO slides (id, badge, badge_en, title, title_en, subtitle, subtitle_en, image, image_alt,
        cta_label, cta_label_en, cta_href, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      optStr(input.badge),
      optStr(input.badgeEn),
      input.title,
      optStr(input.titleEn),
      optStr(input.subtitle),
      optStr(input.subtitleEn),
      optStr(input.image),
      optStr(input.imageAlt),
      optStr(input.ctaLabel),
      optStr(input.ctaLabelEn),
      optStr(input.ctaHref),
      input.sort ?? nextSort("slides"),
      input.active === undefined ? TRUE : bool(input.active, true),
    );
  }
  return id;
}

export function deleteSlide(id: string): void {
  getDb().prepare("DELETE FROM slides WHERE id = ?").run(id);
}

// ---------------------------------------------------------------------------
// business areas (مجالات العمل)
// ---------------------------------------------------------------------------
interface AreaRow {
  id: string;
  title: string;
  title_en: string | null;
  icon: string | null;
  category_filter: string | null;
  description: string | null;
  description_en: string | null;
  sort: number;
  active: number;
}

function mapArea(r: AreaRow): BusinessArea {
  return {
    id: r.id,
    title: r.title,
    titleEn: r.title_en ?? "",
    icon: r.icon ?? "",
    categoryFilter: r.category_filter ?? "",
    desc: r.description ?? "",
    descEn: r.description_en ?? "",
    sort: r.sort,
    active: r.active === 1,
  };
}

export function getBusinessAreas(opts: { includeInactive?: boolean } = {}): BusinessArea[] {
  const where = opts.includeInactive ? "" : "WHERE active = 1";
  return rows<AreaRow>(`SELECT * FROM business_areas ${where} ORDER BY sort`).map(mapArea);
}

export function upsertBusinessArea(input: Partial<BusinessArea> & { title: string }): string {
  const db = getDb();
  const id = input.id && input.id.length > 0 ? input.id : newId("ba");
  const existing = row<AreaRow>("SELECT * FROM business_areas WHERE id = ?", id);
  if (existing) {
    db.prepare(
      `UPDATE business_areas SET title = ?, title_en = ?, icon = ?, category_filter = ?, description = ?, description_en = ?, sort = ?, active = ? WHERE id = ?`,
    ).run(
      input.title,
      optStr(input.titleEn),
      optStr(input.icon),
      optStr(input.categoryFilter),
      optStr(input.desc),
      optStr(input.descEn),
      input.sort ?? existing.sort,
      input.active === undefined ? existing.active : bool(input.active, true),
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO business_areas (id, title, title_en, icon, category_filter, description, description_en, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      input.title,
      optStr(input.titleEn),
      optStr(input.icon),
      optStr(input.categoryFilter),
      optStr(input.desc),
      optStr(input.descEn),
      input.sort ?? nextSort("business_areas"),
      input.active === undefined ? TRUE : bool(input.active, true),
    );
  }
  return id;
}

export function deleteBusinessArea(id: string): void {
  getDb().prepare("DELETE FROM business_areas WHERE id = ?").run(id);
}

// ---------------------------------------------------------------------------
// projects
// ---------------------------------------------------------------------------
interface ProjectRow {
  id: string;
  title: string;
  title_en: string | null;
  category: string | null;
  location: string | null;
  description: string | null;
  description_en: string | null;
  image: string | null;
  sort: number;
  active: number;
}

function mapProject(r: ProjectRow): Project {
  return {
    id: r.id,
    title: r.title,
    titleEn: r.title_en ?? "",
    category: r.category ?? "",
    location: r.location ?? "",
    desc: r.description ?? "",
    descEn: r.description_en ?? "",
    image: r.image ?? "",
    sort: r.sort,
    active: r.active === 1,
  };
}

export function getProjects(opts: { includeInactive?: boolean } = {}): Project[] {
  const where = opts.includeInactive ? "" : "WHERE active = 1";
  return rows<ProjectRow>(`SELECT * FROM projects ${where} ORDER BY sort`).map(mapProject);
}

export function upsertProject(input: Partial<Project> & { title: string }): string {
  const db = getDb();
  const id = input.id && input.id.length > 0 ? input.id : newId("proj");
  const existing = row<ProjectRow>("SELECT * FROM projects WHERE id = ?", id);
  if (existing) {
    db.prepare(
      `UPDATE projects SET title = ?, title_en = ?, category = ?, location = ?, description = ?, description_en = ?, image = ?, sort = ?, active = ? WHERE id = ?`,
    ).run(
      input.title,
      optStr(input.titleEn),
      optStr(input.category),
      optStr(input.location),
      optStr(input.desc),
      optStr(input.descEn),
      optStr(input.image),
      input.sort ?? existing.sort,
      input.active === undefined ? existing.active : bool(input.active, true),
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO projects (id, title, title_en, category, location, description, description_en, image, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      input.title,
      optStr(input.titleEn),
      optStr(input.category),
      optStr(input.location),
      optStr(input.desc),
      optStr(input.descEn),
      optStr(input.image),
      input.sort ?? nextSort("projects"),
      input.active === undefined ? TRUE : bool(input.active, true),
    );
  }
  return id;
}

export function deleteProject(id: string): void {
  getDb().prepare("DELETE FROM projects WHERE id = ?").run(id);
}

// ---------------------------------------------------------------------------
// posts (المدونة والعروض)
// ---------------------------------------------------------------------------
interface PostRow {
  id: string;
  title: string;
  title_en: string | null;
  tag: string | null;
  tag_en: string | null;
  published: string | null;
  excerpt: string | null;
  excerpt_en: string | null;
  content: string | null;
  content_en: string | null;
  image: string | null;
  sort: number;
  active: number;
}

function mapPost(r: PostRow): Post {
  return {
    id: r.id,
    title: r.title,
    titleEn: r.title_en ?? "",
    tag: r.tag ?? "",
    tagEn: r.tag_en ?? "",
    date: r.published ?? "",
    excerpt: r.excerpt ?? "",
    excerptEn: r.excerpt_en ?? "",
    content: r.content ?? "",
    contentEn: r.content_en ?? "",
    image: r.image ?? "",
    sort: r.sort,
    active: r.active === 1,
  };
}

export function getPosts(opts: { includeInactive?: boolean } = {}): Post[] {
  const where = opts.includeInactive ? "" : "WHERE active = 1";
  return rows<PostRow>(`SELECT * FROM posts ${where} ORDER BY sort DESC, rowid DESC`).map(mapPost);
}

export function getPost(id: string): Post | null {
  const r = row<PostRow>("SELECT * FROM posts WHERE id = ?", id);
  return r ? mapPost(r) : null;
}

export function upsertPost(input: Partial<Post> & { title: string }): string {
  const db = getDb();
  const id = input.id && input.id.length > 0 ? input.id : newId("post");
  const existing = row<PostRow>("SELECT * FROM posts WHERE id = ?", id);
  if (existing) {
    db.prepare(
      `UPDATE posts SET title = ?, title_en = ?, tag = ?, tag_en = ?, published = ?, excerpt = ?, excerpt_en = ?,
        content = ?, content_en = ?, image = ?, active = ? WHERE id = ?`,
    ).run(
      input.title,
      optStr(input.titleEn),
      optStr(input.tag),
      optStr(input.tagEn),
      optStr(input.date),
      optStr(input.excerpt),
      optStr(input.excerptEn),
      optStr(input.content),
      optStr(input.contentEn),
      optStr(input.image),
      input.active === undefined ? existing.active : bool(input.active, true),
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO posts (id, title, title_en, tag, tag_en, published, excerpt, excerpt_en, content, content_en, image, sort, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      input.title,
      optStr(input.titleEn),
      optStr(input.tag),
      optStr(input.tagEn),
      optStr(input.date),
      optStr(input.excerpt),
      optStr(input.excerptEn),
      optStr(input.content),
      optStr(input.contentEn),
      optStr(input.image),
      nextSort("posts"),
      input.active === undefined ? TRUE : bool(input.active, true),
    );
  }
  return id;
}

export function deletePost(id: string): void {
  getDb().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

// ---------------------------------------------------------------------------
// support tickets & bank accounts
// ---------------------------------------------------------------------------
export function getSupportTickets(): SupportTicket[] {
  return rows<{ id: string; title: string; client: string | null; status: string | null; engineer: string | null }>(
    "SELECT id, title, client, status, engineer FROM support_tickets ORDER BY sort",
  ).map((r) => ({
    id: r.id,
    title: r.title,
    client: r.client ?? "",
    status: r.status ?? "",
    engineer: r.engineer ?? "",
  }));
}

export function getBankAccounts(): BankAccount[] {
  return rows<{
    id: string;
    bank_name: string;
    badge: string | null;
    badge_color: string | null;
    account_holder: string | null;
    col_span2: number;
    accounts: string;
  }>("SELECT * FROM bank_accounts ORDER BY sort").map((r) => ({
    id: r.id,
    bankName: r.bank_name,
    badge: r.badge ?? "",
    badgeColor: r.badge_color ?? "cyan",
    accountHolder: r.account_holder ?? "",
    colSpan2: r.col_span2 === 1,
    accounts: parseJson(r.accounts, []),
  }));
}

// ---------------------------------------------------------------------------
// orders — تُحفظ على الخادم فتصل للإدارة فعليًا
// ---------------------------------------------------------------------------
interface OrderRow {
  id: number;
  order_no: string;
  type: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  payment_method: string | null;
  notes: string | null;
  items: string;
  items_count: number;
  total_usd: number;
  currency: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

function mapOrder(r: OrderRow): Order {
  return {
    id: r.id,
    orderNo: r.order_no,
    type: r.type as OrderType,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerAddress: r.customer_address,
    paymentMethod: r.payment_method,
    notes: r.notes,
    items: parseJson<OrderItem[]>(r.items, []),
    itemsCount: r.items_count,
    totalUsd: Number(r.total_usd),
    currency: r.currency as Currency,
    status: r.status as OrderStatus,
    source: r.source,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export interface CreateOrderInput {
  type: OrderType;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  items: OrderItem[];
  currency?: Currency;
}

export function createOrder(input: CreateOrderInput): Order {
  const db = getDb();
  const total = input.items.reduce((sum, it) => sum + Number(it.priceUsd || 0) * Number(it.qty || 0), 0);
  const count = input.items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  const placeholder = `PENDING-${randomToken(8)}`;

  const info = db
    .prepare(
      `INSERT INTO orders (order_no, type, customer_name, customer_phone, customer_address, payment_method,
        notes, items, items_count, total_usd, currency, status, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'website')`,
    )
    .run(
      placeholder,
      input.type,
      input.customerName,
      input.customerPhone,
      input.customerAddress ?? null,
      input.paymentMethod ?? null,
      input.notes ?? null,
      JSON.stringify(input.items),
      count,
      total,
      input.currency ?? "USD",
    );

  const id = Number(info.lastInsertRowid);
  // ترقيم مقروء مستمر على نمط النظام القديم: #PN-2601
  const orderNo = `#PN-${2600 + id}`;
  db.prepare("UPDATE orders SET order_no = ? WHERE id = ?").run(orderNo, id);

  const created = getOrder(id);
  if (!created) throw new Error("فشل إنشاء الطلب");
  return created;
}

export function getOrders(filter: { status?: OrderStatus; search?: string; limit?: number } = {}): Order[] {
  const where: string[] = ["1 = 1"];
  const params: unknown[] = [];
  if (filter.status) {
    where.push("status = ?");
    params.push(filter.status);
  }
  if (filter.search) {
    where.push("(customer_name LIKE ? OR customer_phone LIKE ? OR order_no LIKE ?)");
    const like = `%${filter.search}%`;
    params.push(like, like, like);
  }
  const limit = filter.limit && filter.limit > 0 ? ` LIMIT ${Math.floor(filter.limit)}` : "";
  return rows<OrderRow>(
    `SELECT * FROM orders WHERE ${where.join(" AND ")} ORDER BY created_at DESC, id DESC${limit}`,
    ...params,
  ).map(mapOrder);
}

export function getOrder(id: number): Order | null {
  const r = row<OrderRow>("SELECT * FROM orders WHERE id = ?", id);
  return r ? mapOrder(r) : null;
}

export function updateOrderStatus(id: number, status: OrderStatus): boolean {
  const info = getDb()
    .prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, id);
  return Number(info.changes) > 0;
}

export function deleteOrder(id: number): void {
  getDb().prepare("DELETE FROM orders WHERE id = ?").run(id);
}

export interface OrderStats {
  total: number;
  new: number;
  inProgress: number;
  delivered: number;
  cancelled: number;
  totalUsd: number;
}

export function getOrderStats(): OrderStats {
  const r = row<{
    total: number;
    c_new: number;
    c_in: number;
    c_done: number;
    c_cancel: number;
    sum_usd: number;
  }>(`SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS c_new,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS c_in,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS c_done,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS c_cancel,
        IFNULL(SUM(CASE WHEN status != 'cancelled' THEN total_usd ELSE 0 END), 0) AS sum_usd
      FROM orders`);
  return {
    total: Number(r?.total ?? 0),
    new: Number(r?.c_new ?? 0),
    inProgress: Number(r?.c_in ?? 0),
    delivered: Number(r?.c_done ?? 0),
    cancelled: Number(r?.c_cancel ?? 0),
    totalUsd: Number(r?.sum_usd ?? 0),
  };
}

/** روابط التواصل الاجتماعي المخزّنة في الإعدادات. */
export function getSocialLinks(settings: StoreSettings): SocialLink[] {
  return Array.isArray(settings.socialLinks) ? settings.socialLinks : [];
}

"use server";

import { revalidatePath } from "next/cache";
import { canAccessTab, requireUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import {
  deleteBrand,
  deleteBusinessArea,
  deleteCategory,
  deletePost,
  deleteProduct,
  deleteProject,
  deleteSlide,
  getProduct,
  upsertBrand,
  upsertBusinessArea,
  upsertCategory,
  upsertPost,
  upsertProduct,
  upsertProject,
  upsertSlide,
} from "@/lib/queries";

// ---------------------------------------------------------------------------
// أدوات مساعدة لتحويل FormData
// ---------------------------------------------------------------------------
function s(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function b(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true";
}
function num(fd: FormData, key: string, fallback = 0): number {
  const v = Number(fd.get(key));
  return Number.isFinite(v) ? v : fallback;
}
function lines(fd: FormData, key: string): string[] {
  return s(fd, key)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}
function num0(fd: FormData, key: string): number | null {
  const raw = s(fd, key);
  if (raw === "") return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/store");
  revalidatePath("/posts");
  revalidatePath("/projects");
  revalidatePath("/services");
  revalidatePath("/about");
}

// ---------------------------------------------------------------------------
// المقالات (المدونة والعروض)
// ---------------------------------------------------------------------------
export async function savePostAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "posts")) return;

  const savedId = upsertPost({
    id: s(fd, "id"),
    title: s(fd, "title"),
    titleEn: s(fd, "titleEn"),
    tag: s(fd, "tag"),
    tagEn: s(fd, "tagEn"),
    date: s(fd, "date"),
    excerpt: s(fd, "excerpt"),
    excerptEn: s(fd, "excerptEn"),
    content: s(fd, "content"),
    contentEn: s(fd, "contentEn"),
    image: s(fd, "image"),
    sort: num(fd, "sort", 0),
    active: b(fd, "active"),
  });

  audit(user.id, "post_saved", { id: savedId });
  revalidatePath("/admin/content/posts");
  revalidatePath(`/posts/${savedId}`);
  revalidateSite();
}

export async function deletePostAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "posts")) return;
  const id = s(fd, "id");
  if (!id) return;
  deletePost(id);
  audit(user.id, "post_deleted", { id });
  revalidatePath("/admin/content/posts");
  revalidateSite();
}

// ---------------------------------------------------------------------------
// لوحة العرض التلقائية (السلايدر)
// ---------------------------------------------------------------------------
export async function saveSlideAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;

  const savedId = upsertSlide({
    id: s(fd, "id"),
    badge: s(fd, "badge"),
    badgeEn: s(fd, "badgeEn"),
    title: s(fd, "title"),
    titleEn: s(fd, "titleEn"),
    subtitle: s(fd, "subtitle"),
    subtitleEn: s(fd, "subtitleEn"),
    image: s(fd, "image"),
    imageAlt: s(fd, "imageAlt"),
    ctaLabel: s(fd, "ctaLabel"),
    ctaLabelEn: s(fd, "ctaLabelEn"),
    ctaHref: s(fd, "ctaHref") || "/store",
    sort: num(fd, "sort", 0),
    active: b(fd, "active"),
  });

  audit(user.id, "slide_saved", { id: savedId });
  revalidatePath("/admin/content/slides");
  revalidateSite();
}

export async function deleteSlideAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;
  const id = s(fd, "id");
  if (!id) return;
  deleteSlide(id);
  audit(user.id, "slide_deleted", { id });
  revalidatePath("/admin/content/slides");
  revalidateSite();
}

// ---------------------------------------------------------------------------
// الماركات والوكلاء
// ---------------------------------------------------------------------------
export async function saveBrandAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;

  const savedId = upsertBrand({
    id: s(fd, "id"),
    name: s(fd, "name"),
    nameEn: s(fd, "nameEn"),
    logo: s(fd, "logo"),
    isAgent: b(fd, "isAgent"),
    website: s(fd, "website"),
    description: s(fd, "description"),
    descriptionEn: s(fd, "descriptionEn"),
    sort: num(fd, "sort", 0),
    active: b(fd, "active"),
  });

  audit(user.id, "brand_saved", { id: savedId });
  revalidatePath("/admin/content/brands");
  revalidateSite();
}

export async function deleteBrandAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;
  const id = s(fd, "id");
  if (!id) return;
  deleteBrand(id);
  audit(user.id, "brand_deleted", { id });
  revalidatePath("/admin/content/brands");
  revalidateSite();
}

// ---------------------------------------------------------------------------
// فئات المتجر
// ---------------------------------------------------------------------------
export async function saveCategoryAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "categories")) return;

  const savedId = upsertCategory({
    id: s(fd, "id"),
    name: s(fd, "name"),
    nameEn: s(fd, "nameEn"),
    icon: s(fd, "icon"),
    image: s(fd, "image"),
    sort: num(fd, "sort", 0),
    active: b(fd, "active"),
  });

  audit(user.id, "category_saved", { id: savedId });
  revalidatePath("/admin/content/categories");
  revalidateSite();
}

export async function deleteCategoryAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "categories")) return;
  const id = s(fd, "id");
  if (!id) return;
  deleteCategory(id);
  audit(user.id, "category_deleted", { id });
  revalidatePath("/admin/content/categories");
  revalidateSite();
}

// ---------------------------------------------------------------------------
// مجالات العمل
// ---------------------------------------------------------------------------
export async function saveAreaAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;

  const savedId = upsertBusinessArea({
    id: s(fd, "id"),
    title: s(fd, "title"),
    titleEn: s(fd, "titleEn"),
    icon: s(fd, "icon"),
    categoryFilter: s(fd, "categoryFilter"),
    desc: s(fd, "desc"),
    descEn: s(fd, "descEn"),
    sort: num(fd, "sort", 0),
    active: b(fd, "active"),
  });

  audit(user.id, "area_saved", { id: savedId });
  revalidatePath("/admin/content/areas");
  revalidateSite();
}

export async function deleteAreaAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;
  const id = s(fd, "id");
  if (!id) return;
  deleteBusinessArea(id);
  audit(user.id, "area_deleted", { id });
  revalidatePath("/admin/content/areas");
  revalidateSite();
}

// ---------------------------------------------------------------------------
// المشاريع
// ---------------------------------------------------------------------------
export async function saveProjectAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;

  const savedId = upsertProject({
    id: s(fd, "id"),
    title: s(fd, "title"),
    titleEn: s(fd, "titleEn"),
    category: s(fd, "category"),
    location: s(fd, "location"),
    desc: s(fd, "desc"),
    descEn: s(fd, "descEn"),
    image: s(fd, "image"),
    sort: num(fd, "sort", 0),
    active: b(fd, "active"),
  });

  audit(user.id, "project_saved", { id: savedId });
  revalidatePath("/admin/content/projects");
  revalidateSite();
}

export async function deleteProjectAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;
  const id = s(fd, "id");
  if (!id) return;
  deleteProject(id);
  audit(user.id, "project_deleted", { id });
  revalidatePath("/admin/content/projects");
  revalidateSite();
}

// ---------------------------------------------------------------------------
// الأصناف (إضافة/تحرير كامل)
// ---------------------------------------------------------------------------
export async function saveProductAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "products")) return;

  const id = s(fd, "id");
  const existing = id ? getProduct(id) : null;

  const priceAllowed = user.roleKey === "designer" || user.canEditPrices;
  const price = priceAllowed ? num(fd, "price", existing?.price ?? 0) : (existing?.price ?? 0);
  const oldPrice = priceAllowed ? num0(fd, "oldPrice") : (existing?.oldPrice ?? null);

  const savedId = upsertProduct({
    id,
    name: s(fd, "name"),
    nameEn: s(fd, "nameEn"),
    sku: s(fd, "sku"),
    brandCode: s(fd, "brandCode"),
    model: s(fd, "model"),
    category: s(fd, "category"),
    brand: s(fd, "brand"),
    price,
    oldPrice,
    hidePrice: b(fd, "hidePrice"),
    badge: s(fd, "badge"),
    badgeEn: s(fd, "badgeEn"),
    iconType: s(fd, "iconType") || "box",
    featured: b(fd, "featured"),
    specs: lines(fd, "specs"),
    specsEn: lines(fd, "specsEn"),
    description: s(fd, "description"),
    descriptionEn: s(fd, "descriptionEn"),
    imageUrl: s(fd, "imageUrl"),
    officialSpecUrl: s(fd, "officialSpecUrl"),
    active: b(fd, "active"),
  });

  audit(user.id, "product_saved", { id: savedId });
  revalidatePath("/admin/content/products");
  revalidatePath(`/product/${savedId}`);
  revalidatePath("/store");
}

export async function deleteProductAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "products")) return;
  const id = s(fd, "id");
  if (!id) return;
  deleteProduct(id);
  audit(user.id, "product_deleted", { id });
  revalidatePath("/admin/content/products");
  revalidatePath("/store");
}


export async function saveBankAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;
  const { getDb } = await import("@/lib/db");
  const { newId } = await import("@/lib/queries");
  const db = getDb();
  const id = s(fd, "id") || newId("bank");
  
  db.prepare(`
    INSERT INTO bank_accounts (id, bank_name, badge, badge_color, account_holder, col_span2, accounts, sort) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET 
      bank_name=excluded.bank_name, badge=excluded.badge, badge_color=excluded.badge_color, 
      account_holder=excluded.account_holder, col_span2=excluded.col_span2, accounts=excluded.accounts, sort=excluded.sort
  `).run(
    id, s(fd, "bankName"), optStr(fd.get("badge")), s(fd, "badgeColor"), optStr(fd.get("accountHolder")), 
    b(fd, "colSpan2") ? 1 : 0, s(fd, "accounts") || "[]", num(fd, "sort", 0)
  );

  audit(user.id, "bank_saved", { id });
  revalidatePath("/admin/content/banks");
  revalidatePath("/contact");
}

export async function deleteBankAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) return;
  const id = s(fd, "id");
  if (!id) return;
  const { getDb } = await import("@/lib/db");
  getDb().prepare("DELETE FROM bank_accounts WHERE id = ?").run(id);
  audit(user.id, "bank_deleted", { id });
  revalidatePath("/admin/content/banks");
  revalidatePath("/contact");
}

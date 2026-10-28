"use server";

import { revalidatePath } from "next/cache";
import { canAccessTab, requireUser } from "@/lib/auth";
import { audit, getDb } from "@/lib/db";

/**
 * تعديل بيانات صنف — التحقق من الصلاحيات يتم على الخادم.
 * من لا يملك صلاحية "تعديل الأسعار" لا يمكنه تغيير السعر حتى لو عدّل الطلب يدويًا.
 */
export async function updateProduct(formData: FormData): Promise<void> {
  const user = await requireUser();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = getDb().prepare("SELECT id, price, old_price, badge, featured, active FROM products WHERE id = ?").get(id) as
    | { id: string; price: number; old_price: number | null; badge: string | null; featured: number; active: number }
    | undefined;
  if (!existing) return;

  const price = Number(formData.get("price"));
  const oldPriceRaw = String(formData.get("oldPrice") ?? "").trim();
  const oldPrice = oldPriceRaw === "" ? null : Number(oldPriceRaw);
  const badge = String(formData.get("badge") ?? "").trim().slice(0, 40);
  const featured = formData.get("featured") === "on" ? 1 : 0;
  const active = formData.get("active") === "on" ? 1 : 0;

  const priceAllowed = user.roleKey === "designer" || user.canEditPrices;
  // من يملك تبويب الأصناف يستطيع التحكم في عرض الصنف (المبيعات مسؤولة عن حالة التوفّر)
  const visibilityAllowed = canAccessTab(user, "products") || user.canDeleteItems;

  const nextPrice = priceAllowed && Number.isFinite(price) && price >= 0 ? price : Number(existing.price);
  const nextOldPrice =
    priceAllowed && oldPrice !== null && Number.isFinite(oldPrice) && oldPrice >= 0 ? oldPrice : existing.old_price;
  const nextActive = visibilityAllowed ? active : existing.active;

  getDb()
    .prepare(
      `UPDATE products
       SET price = ?, old_price = ?, badge = ?, featured = ?, active = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
    .run(nextPrice, nextOldPrice, badge || null, featured, nextActive, id);

  audit(user.id, "product_updated", {
    id,
    price: nextPrice,
    oldPrice: nextOldPrice,
    badge,
    featured,
    active: nextActive,
    priceChanged: nextPrice !== Number(existing.price),
  });

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath(`/product/${id}`);
}

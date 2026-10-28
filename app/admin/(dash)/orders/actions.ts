"use server";

import { revalidatePath } from "next/cache";
import { canAccessTab, requireUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import { updateOrderStatus } from "@/lib/queries";
import type { OrderStatus } from "@/lib/types";

const ALLOWED: OrderStatus[] = ["new", "in_progress", "delivered", "cancelled"];

/**
 * تحديث حالة الطلب — تنفيذ على الخادم مع التحقق من الجلسة.
 * الإصدار القديم كان يسمح بأي تغيير من المتصفح بدون أي تحقق.
 */
export async function setOrderStatus(formData: FormData): Promise<void> {
  const user = await requireUser();
  // من يملك تبويب «الطلبات» يستطيع متابعة الطلبات وتحديث حالتها
  if (!canAccessTab(user, "orders")) return;

  const id = Number(formData.get("orderId"));
  const status = String(formData.get("status")) as OrderStatus;
  if (!Number.isFinite(id) || !ALLOWED.includes(status)) return;

  const changed = updateOrderStatus(id, status);
  if (changed) audit(user.id, "order_status_changed", { orderId: id, status });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

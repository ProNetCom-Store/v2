import { AdminShell, type AdminNavItem } from "@/components/admin-shell";
import { canAccessTab, canManageSystem, purgeExpiredSessions, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// كل الصفحات داخل هذه المجموعة محميّة بالتحقق من الجلسة
export default async function AdminDashLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  purgeExpiredSessions();

  const nav: AdminNavItem[] = [
    { href: "/admin", label: "لوحة المعلومات", icon: "📊", group: "نظرة عامة" },
  ];

  if (canAccessTab(user, "orders")) nav.push({ href: "/admin/orders", label: "الطلبات", icon: "🧾", group: "المتجر" });
  if (canAccessTab(user, "products")) {
    nav.push({ href: "/admin/products", label: "الأصناف (سعر وشارة)", icon: "📦", group: "المتجر" });
    nav.push({ href: "/admin/content/products", label: "إضافة وتحرير الأصناف", icon: "➕", group: "المتجر" });
  }
  if (canAccessTab(user, "categories")) {
    nav.push({ href: "/admin/content/categories", label: "فئات المتجر", icon: "🗂️", group: "المتجر" });
  }

  if (canAccessTab(user, "posts")) {
    nav.push({ href: "/admin/content/posts", label: "المقالات والعروض", icon: "📝", group: "المحتوى والتصميم" });
  }
  if (canAccessTab(user, "settings")) {
    nav.push({ href: "/admin/content/slides", label: "لوحة العرض التلقائية", icon: "🎞️", group: "المحتوى والتصميم" });
    nav.push({ href: "/admin/content/brands", label: "الماركات والوكلاء", icon: "🏷️", group: "المحتوى والتصميم" });
    nav.push({ href: "/admin/content/areas", label: "مجالات العمل", icon: "🧩", group: "المحتوى والتصميم" });
    nav.push({ href: "/admin/content/projects", label: "المشاريع", icon: "🏗️", group: "المحتوى والتصميم" });
    nav.push({ href: "/admin/content/banks", label: "الحسابات البنكية", icon: "🏦", group: "المحتوى والتصميم" });
    nav.push({ href: "/admin/settings", label: "إعدادات الموقع والمتجر", icon: "⚙️", group: "الإعدادات" });
  }

  if (canAccessTab(user, "users")) nav.push({ href: "/admin/users", label: "المستخدمون", icon: "👥", group: "الإدارة" });
  nav.push({ href: "/admin/password", label: "حسابي وكلمة المرور", icon: "🔐", group: "الإدارة" });

  if (canManageSystem(user)) {
    nav.push({ href: "/admin/files", label: "مدير ملفات المشروع", icon: "🗂️", group: "النظام والصيانة" });
    nav.push({ href: "/admin/backups", label: "النسخ الاحتياطي والاستعادة", icon: "💾", group: "النظام والصيانة" });
  }

  return (
    <AdminShell user={user} nav={nav}>
      {children}
    </AdminShell>
  );
}

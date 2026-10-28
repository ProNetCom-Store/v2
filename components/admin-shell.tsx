"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminUser } from "@/lib/types";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
  /** عنوان مجموعة اختياري — تُعرض المجموعة مرة واحدة عند تغيّر العنوان. */
  group?: string;
}

export function AdminShell({
  user,
  nav,
  children,
}: {
  user: AdminUser;
  nav: AdminNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="no-print border-b border-line bg-surface-3 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-e">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-ink">{user.displayName}</p>
            <p className="truncate text-[11px] font-semibold text-brand-strong">{user.roleTitle || user.roleKey}</p>
          </div>
          <button
            type="button"
            className="btn-ghost px-3 py-2 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
            <span className="sr-only">{menuOpen ? "إغلاق قائمة اللوحة" : "فتح قائمة اللوحة"}</span>
          </button>
        </div>

        <nav id="admin-nav" aria-label="أقسام لوحة التحكم" className={`${menuOpen ? "block" : "hidden"} lg:block`}>
          <ul className="px-2 pb-3">
            {nav.map((item, i) => {
              const prev = nav[i - 1];
              const showHeader = Boolean(item.group) && item.group !== prev?.group;
              return (
                <li key={item.href}>
                  {showHeader ? (
                    <p className="px-3 pb-1 pt-4 text-[10px] font-black tracking-wide text-ink-muted">{item.group}</p>
                  ) : null}
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                      isActive(item.href)
                        ? "bg-surface-3 text-brand-strong"
                        : "text-ink-soft hover:bg-surface-3 hover:text-ink"
                    }`}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="space-y-2 border-t border-line p-3">
            <Link href="/" className="btn-ghost block text-center text-xs">
              عرض الموقع
            </Link>
            <button type="button" onClick={logout} disabled={busy} className="btn-ghost w-full text-xs text-rose-500">
              {busy ? "جارٍ الخروج…" : "تسجيل الخروج"}
            </button>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {user.mustChangePassword ? (
          <div className="no-print border-b border-amber-500/40 bg-amber-950/40 px-4 py-3 text-center text-xs font-bold text-amber-100">
            ⚠️ ما زلت تستخدم كلمة المرور الأولية.{" "}
            <Link href="/admin/password" className="underline">
              غيّرها الآن
            </Link>
          </div>
        ) : null}
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

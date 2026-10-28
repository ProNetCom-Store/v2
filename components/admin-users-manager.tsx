"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/types";

const AVAILABLE_TABS = [
  { id: "products", label: "الأصناف والتسعير" },
  { id: "orders", label: "الطلبات" },
  { id: "categories", label: "الأقسام والفئات" },
  { id: "posts", label: "المنشورات والعروض" },
  { id: "support", label: "الدعم الفني" },
  { id: "settings", label: "الإعدادات والهوية" },
  { id: "users", label: "المستخدمون" },
  { id: "github", label: "المزامنة والتصدير" },
  { id: "profile", label: "حسابي" },
];

const TAB_LABELS: Record<string, string> = {
  all: "كل الأقسام",
  products: "الأصناف",
  orders: "الطلبات",
  categories: "الأقسام",
  posts: "المنشورات",
  support: "الدعم الفني",
  settings: "الإعدادات",
  users: "المستخدمون",
  profile: "حسابي",
  github: "المزامنة والتصدير",
};

const ROLE_PRESETS: Record<
  string,
  { roleTitle: string; icon: string; tabs: string[]; canEditPrices: boolean; canDeleteItems: boolean; canExportSite: boolean }
> = {
  designer: {
    roleTitle: "المصمم — كامل الصلاحية",
    icon: "🎨",
    tabs: ["products", "orders", "categories", "posts", "support", "settings", "users", "github", "profile"],
    canEditPrices: true,
    canDeleteItems: true,
    canExportSite: true,
  },
  management: {
    roleTitle: "الإدارة العامة — كامل الصلاحية",
    icon: "👨‍💼",
    tabs: ["products", "orders", "categories", "posts", "support", "settings", "users", "github", "profile"],
    canEditPrices: true,
    canDeleteItems: true,
    canExportSite: true,
  },
  sales: {
    roleTitle: "المبيعات — الأصناف والتسعير والعروض",
    icon: "💼",
    tabs: ["products", "orders", "categories", "posts", "profile"],
    canEditPrices: true,
    canDeleteItems: false,
    canExportSite: false,
  },
  support: {
    roleTitle: "الدعم الفني — المواصفات والمشاريع والصيانة",
    icon: "🛠️",
    tabs: ["products", "support", "posts", "profile"],
    canEditPrices: false,
    canDeleteItems: false,
    canExportSite: false,
  },
};

export function AdminUsersManager({
  initialUsers,
  currentUser,
  canEdit,
}: {
  initialUsers: AdminUser[];
  currentUser: AdminUser;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleKey, setRoleKey] = useState("sales");
  const [roleTitle, setRoleTitle] = useState("");
  const [icon, setIcon] = useState("💼");
  const [description, setDescription] = useState("");
  const [allowedTabs, setAllowedTabs] = useState<string[]>(ROLE_PRESETS.sales.tabs);
  const [canEditPrices, setCanEditPrices] = useState(true);
  const [canDeleteItems, setCanDeleteItems] = useState(false);
  const [canExportSite, setCanExportSite] = useState(false);
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function openCreateModal() {
    setEditingUser(null);
    setIsCreating(true);
    setUsername("");
    setDisplayName("");
    setPhone("+967");
    setRoleKey("sales");
    setRoleTitle(ROLE_PRESETS.sales.roleTitle);
    setIcon(ROLE_PRESETS.sales.icon);
    setDescription("إدارة الأصناف والتسعير ومتابعة طلبات العملاء.");
    setAllowedTabs(ROLE_PRESETS.sales.tabs);
    setCanEditPrices(true);
    setCanDeleteItems(false);
    setCanExportSite(false);
    setActive(true);
    setPassword("");
    setFeedback(null);
  }

  function openEditModal(u: AdminUser) {
    setIsCreating(false);
    setEditingUser(u);
    setUsername(u.username);
    setDisplayName(u.displayName);
    setPhone(u.phone || "+967");
    setRoleKey(u.roleKey);
    setRoleTitle(u.roleTitle);
    setIcon(u.icon || "👤");
    setDescription(u.description || "");
    setAllowedTabs(u.allowedTabs.includes("all") ? AVAILABLE_TABS.map((t) => t.id) : u.allowedTabs);
    setCanEditPrices(u.canEditPrices);
    setCanDeleteItems(u.canDeleteItems);
    setCanExportSite(u.canExportSite);
    setActive(u.active);
    setPassword("");
    setFeedback(null);
  }

  function closeModal() {
    setEditingUser(null);
    setIsCreating(false);
    setPassword("");
  }

  function handleRolePresetChange(nextRole: string) {
    setRoleKey(nextRole);
    const preset = ROLE_PRESETS[nextRole];
    if (preset) {
      setRoleTitle(preset.roleTitle);
      setIcon(preset.icon);
      setAllowedTabs(preset.tabs);
      setCanEditPrices(preset.canEditPrices);
      setCanDeleteItems(preset.canDeleteItems);
      setCanExportSite(preset.canExportSite);
    }
  }

  function toggleTab(tabId: string) {
    setAllowedTabs((prev) => (prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]));
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setBusy(true);

    try {
      const method = isCreating ? "POST" : "PUT";
      const res = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser?.id,
          username,
          displayName,
          phone,
          roleKey,
          roleTitle,
          icon,
          description,
          allowedTabs,
          canEditPrices,
          canDeleteItems,
          canExportSite,
          active,
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedback({ type: "err", text: data.error || "تعذّر حفظ بيانات المستخدم." });
        return;
      }

      if (Array.isArray(data.users)) {
        setUsers(data.users);
      }
      setFeedback({
        type: "ok",
        text: isCreating
          ? `✅ تم إنشاء حساب المستخدم (${username}) وربطه برقم الهاتف (${phone}) بنجاح.`
          : `✅ تم تحديث بيانات المستخدم (${username})${password.trim() ? " وكلمة المرور" : ""} بنجاح.`,
      });
      setIsCreating(false);
      setEditingUser(null);
      setPassword("");
      router.refresh();
    } catch {
      setFeedback({ type: "err", text: "تعذّر الاتصال بالخادم." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteUser(u: AdminUser) {
    if (u.id === "u_designer" || u.id === currentUser.id) return;
    if (!window.confirm(`هل أنت متأكد من حذف حساب "${u.displayName}" (${u.username})؟`)) return;

    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(u.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedback({ type: "err", text: data.error || "تعذّر حذف المستخدم." });
        return;
      }
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      }
      setFeedback({ type: "ok", text: `تم حذف المستخدم (${u.username}) بنجاح.` });
      router.refresh();
    } catch {
      setFeedback({ type: "err", text: "تعذّر الاتصال بالخادم." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">المستخدمون والصلاحيات وأرقام الاستعادة</h1>
          <p className="mt-1 text-sm text-ink-muted">
            إدارة حسابات الموظفين، تعديل كلمات المرور، وربط كل مستخدم برقم هاتف لإرسال كود التحقق (OTP) في حال نسيان كلمة المرور.
          </p>
        </div>
        {canEdit ? (
          <button type="button" onClick={openCreateModal} className="btn-primary text-xs">
            + إضافة مستخدم جديد
          </button>
        ) : null}
      </header>

      {!canEdit ? (
        <p className="panel p-4 text-sm text-amber-200">
          أنت تستعرض هذه القائمة بصلاحية قراءة فقط. يمكنك تعديل بيانات حسابك وكلمة مرورك الخاصة من صفحة «حسابي وكلمة المرور».
        </p>
      ) : null}

      {feedback ? (
        <div
          role={feedback.type === "err" ? "alert" : "status"}
          className={`rounded-2xl border p-4 text-xs font-bold ${
            feedback.type === "ok"
              ? "border-emerald-500/50 bg-emerald-950/50 text-emerald-200"
              : "border-rose-500/50 bg-rose-950/50 text-rose-200"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {canEdit && (isCreating || editingUser) ? (
        <form onSubmit={handleSaveUser} className="panel space-y-4 border-2 border-brand p-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-base font-black text-ink">
              {isCreating ? "➕ إضافة مستخدم جديد للوحة التحكم" : `✏️ تعديل بيانات وكلمة مرور: ${editingUser?.displayName}`}
            </h2>
            <button type="button" onClick={closeModal} className="btn-ghost px-3 py-1 text-xs">
              إغلاق ✕
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink-muted">الاسم المعروض</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="مثال: موظف المبيعات"
                className="input-base text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink-muted">اسم المستخدم (Username)</label>
              <input
                type="text"
                required
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sales"
                className="input-base font-mono text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink-muted">
                رقم الهاتف المرتبط (لاستعادة كلمة المرور OTP) 📱
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+967778163178"
                className="input-base font-mono text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink-muted">الدور الوظيفي</label>
              <select
                value={roleKey}
                disabled={editingUser?.id === "u_designer"}
                onChange={(e) => handleRolePresetChange(e.target.value)}
                className="input-base text-sm"
              >
                <option value="designer">المصمم (Super Admin)</option>
                <option value="management">الإدارة العامة (Management)</option>
                <option value="sales">المبيعات (Sales)</option>
                <option value="support">الدعم الفني (Support)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink-muted">المسمى الوظيفي التفصيلي</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="input-base text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink-muted">
                {isCreating ? "كلمة المرور الأولية (6 خانات على الأقل)" : "تعيين كلمة مرور جديدة (اختياري)"}
              </label>
              <div className="flex gap-2">
                <input
                  type={showPass ? "text" : "password"}
                  dir="ltr"
                  required={isCreating}
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isCreating ? "أدخل كلمة المرور" : "اتركها فارغة للإبقاء على الحالية"}
                  className="input-base font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="btn-ghost px-3 text-xs"
                >
                  {showPass ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-ink-muted">وصف المهام والصلاحيات</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base text-sm"
            />
          </div>

          <div className="rounded-xl border border-line bg-surface-2 p-4">
            <p className="mb-2 text-xs font-black text-ink">التبويبات المسموح بالوصول إليها:</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TABS.map((tab) => {
                const checked = roleKey === "designer" || allowedTabs.includes(tab.id);
                return (
                  <label
                    key={tab.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      checked
                        ? "border-brand bg-brand/15 text-brand-strong"
                        : "border-line bg-surface text-ink-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={roleKey === "designer"}
                      onChange={() => toggleTab(tab.id)}
                      className="accent-sky-500"
                    />
                    <span>{tab.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-xs font-bold">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={canEditPrices}
                  onChange={(e) => setCanEditPrices(e.target.checked)}
                  className="accent-sky-500"
                />
                <span>صلاحية تعديل الأسعار وسعر الصرف</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={canDeleteItems}
                  onChange={(e) => setCanDeleteItems(e.target.checked)}
                  className="accent-sky-500"
                />
                <span>صلاحية الحذف والإخفاء</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={canExportSite}
                  onChange={(e) => setCanExportSite(e.target.checked)}
                  className="accent-sky-500"
                />
                <span>صلاحية التصدير والنسخ الاحتياطي</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={active}
                  disabled={editingUser?.id === "u_designer"}
                  onChange={(e) => setActive(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span>الحساب مُفعّل</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="btn-ghost text-xs">
              إلغاء
            </button>
            <button type="submit" disabled={busy} className="btn-primary text-xs">
              {busy ? "جارٍ الحفظ…" : isCreating ? "إنشاء الحساب وحفظ البيانات" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      ) : null}

      <ul className="space-y-4">
        {users.map((u) => (
          <li key={u.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-black text-ink">
                  <span aria-hidden="true">{u.icon}</span> {u.displayName}
                  {u.id === currentUser.id ? <span className="ms-2 text-xs font-bold text-brand-strong">(أنت)</span> : null}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs">
                  <span className="font-mono text-ink-muted" dir="ltr">
                    @{u.username}
                  </span>
                  <span className="font-mono font-bold text-brand-strong" dir="ltr">
                    📱 {u.phone || "غير مربوط برقم هاتف"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-brand-strong">{u.roleTitle || u.roleKey}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${
                    u.active
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                      : "border-rose-400/50 bg-rose-400/10 text-rose-200"
                  }`}
                >
                  {u.active ? "مُفعّل" : "موقوف"}
                </span>

                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => openEditModal(u)}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    ✏️ تعديل البيانات / كلمة المرور / الهاتف
                  </button>
                ) : null}

                {canEdit && u.id !== "u_designer" && u.id !== currentUser.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u)}
                    className="btn-ghost px-3 py-1.5 text-xs text-rose-400"
                  >
                    حذف
                  </button>
                ) : null}
              </div>
            </div>

            <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="font-bold text-ink-muted">التبويبات المسموحة</dt>
                <dd className="mt-1 text-ink-soft">
                  {u.allowedTabs.map((t) => TAB_LABELS[t] ?? t).join("، ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-ink-muted">صلاحيات حساسة</dt>
                <dd className="mt-1 text-ink-soft">
                  {[
                    u.canEditPrices ? "تعديل الأسعار" : null,
                    u.canDeleteItems ? "الحذف والإخفاء" : null,
                    u.canExportSite ? "التصدير" : null,
                  ]
                    .filter(Boolean)
                    .join("، ") || "لا يوجد"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-ink-muted">آخر دخول</dt>
                <dd className="mt-1 text-ink-soft" dir="ltr">
                  {u.lastLoginAt ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-ink-muted">الوصف</dt>
                <dd className="mt-1 leading-5 text-ink-soft">{u.description || "—"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

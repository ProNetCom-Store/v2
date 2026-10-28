import { ChangePasswordForm } from "@/components/change-password-form";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPasswordPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">حسابي وكلمة المرور ورقم الهاتف</h1>
        <p className="mt-1 text-sm text-ink-muted">
          الحساب: <span className="font-mono font-bold text-ink" dir="ltr">{user.username}</span> — {user.roleTitle || user.roleKey} — الهاتف المرتبط:{" "}
          <span className="font-mono font-bold text-brand-strong" dir="ltr">
            {user.phone || "غير محدد"}
          </span>
        </p>
      </header>

      {user.mustChangePassword ? (
        <p className="panel border-amber-500/40 bg-amber-950/30 p-4 text-sm font-bold text-amber-100">
          ⚠️ أنت تستخدم كلمة المرور الأولية التي طُبعت عند تهيئة النظام. يرجى تغييرها الآن وتأكيد رقم هاتفك لاستعادة الحساب عند الحاجة.
        </p>
      ) : null}

      <ChangePasswordForm user={user} />
    </div>
  );
}

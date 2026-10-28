import { ConfirmForm } from "@/components/confirm-form";
import { canManageSystem, requireUser } from "@/lib/auth";
import { listBackups } from "@/lib/backup";
import { createBackupAction, deleteBackupAction, restoreBackupAction, uploadBackupAction } from "./actions";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleString("ar", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return "";
  }
}

export default async function AdminBackupsPage() {
  const user = await requireUser();
  if (!canManageSystem(user)) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">هذه الصفحة مخصّصة للإدارة والمصمّم فقط.</p>;
  }

  const backups = listBackups();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">النسخ الاحتياطي والاستعادة</h1>
        <p className="mt-1 text-sm text-ink-muted">
          أنشئ نسخًا احتياطية كاملة أو لقاعدة البيانات فقط، ونزّلها، واستعِد أي نسخة بضغطة واحدة. متاح للإدارة والمصمّم
          فقط، وكل عملية تُسجَّل في سجل التدقيق.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <form action={createBackupAction} className="panel space-y-2 p-4">
          <input type="hidden" name="kind" value="full" />
          <p className="text-sm font-black text-ink">نسخة كاملة للمشروع</p>
          <p className="text-xs text-ink-muted">
            كل ملفات الكود والوسائط وقاعدة البيانات (تُستثنى <span dir="ltr">node_modules</span> و
            <span dir="ltr">.next</span> والنسخ السابقة).
          </p>
          <button type="submit" className="btn-primary text-sm">
            🗄️ إنشاء نسخة كاملة
          </button>
        </form>

        <form action={createBackupAction} className="panel space-y-2 p-4">
          <input type="hidden" name="kind" value="db" />
          <p className="text-sm font-black text-ink">نسخة قاعدة البيانات فقط</p>
          <p className="text-xs text-ink-muted">
            ملف قاعدة بيانات SQLite وحده (المقالات، الأصناف، الطلبات، الإعدادات) — أخف وأسرع.
          </p>
          <button type="submit" className="btn-primary text-sm">
            🧾 إنشاء نسخة قاعدة البيانات
          </button>
        </form>
      </div>

      <form action={uploadBackupAction} className="panel flex flex-wrap items-end gap-2 p-4">
        <label htmlFor="backup-upload" className="w-full text-xs font-bold text-ink-muted">
          استيراد ملف نسخة احتياطية (‎.tar.gz) إلى القائمة لاستعادته لاحقًا
        </label>
        <input
          id="backup-upload"
          name="file"
          type="file"
          accept=".gz,.tgz,application/gzip"
          required
          className="input-base flex-1 text-sm file:me-2 file:rounded file:border-0 file:bg-brand/15 file:px-2 file:py-1 file:text-xs file:font-bold file:text-brand-strong"
        />
        <button type="submit" className="btn-primary text-sm">
          ⬆ استيراد
        </button>
      </form>

      <div className="panel border-2 border-amber-400/50 bg-amber-400/5 p-4">
        <p className="text-xs font-bold text-amber-700">
          تنبيه: الاستعادة تستبدل الملفات الحالية بمحتوى النسخة المختارة. خُذ نسخة احتياطية حديثة قبل الاستعادة. بعد
          استعادة الكود أو قاعدة البيانات قد تحتاج إلى إعادة تشغيل/إعادة بناء المشروع على السيرفر ليظهر التغيير.
        </p>
      </div>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-3 text-xs font-black text-ink-muted">
            <tr>
              <th className="px-3 py-2 text-right">الملف</th>
              <th className="px-3 py-2 text-right">النوع</th>
              <th className="px-3 py-2 text-right">الحجم</th>
              <th className="px-3 py-2 text-right">التاريخ</th>
              <th className="px-3 py-2 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.name} className="border-t border-line">
                <td className="px-3 py-2 font-mono text-xs text-ink" dir="ltr">
                  {b.name}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      b.kind === "full"
                        ? "rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-black text-brand-strong"
                        : "rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-black text-ink-muted"
                    }
                  >
                    {b.kind === "full" ? "كاملة" : "قاعدة بيانات"}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-ink-muted">{formatBytes(b.size)}</td>
                <td className="px-3 py-2 text-xs text-ink-muted">{formatDate(b.mtime)}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/api/admin/download?type=backup&name=${encodeURIComponent(b.name)}`}
                      className="rounded-lg border border-line px-2 py-1 text-[11px] font-bold text-ink-muted hover:border-brand/50 hover:text-brand-strong"
                    >
                      ⬇ تنزيل
                    </a>
                    <ConfirmForm
                      action={restoreBackupAction}
                      message={`استعادة «${b.name}»؟ سيتم استبدال الملفات الحالية بمحتوى هذه النسخة.`}
                    >
                      <input type="hidden" name="name" value={b.name} />
                      <button
                        type="submit"
                        className="rounded-lg border border-brand/50 bg-brand/10 px-2 py-1 text-[11px] font-bold text-brand-strong hover:bg-brand/20"
                      >
                        ♻ استعادة
                      </button>
                    </ConfirmForm>
                    <ConfirmForm action={deleteBackupAction} message={`حذف النسخة «${b.name}» نهائيًا؟`}>
                      <input type="hidden" name="name" value={b.name} />
                      <button
                        type="submit"
                        className="rounded-lg border border-rose-400/50 bg-rose-400/10 px-2 py-1 text-[11px] font-bold text-rose-500 hover:bg-rose-400/20"
                      >
                        🗑 حذف
                      </button>
                    </ConfirmForm>
                  </div>
                </td>
              </tr>
            ))}

            {backups.length === 0 ? (
              <tr className="border-t border-line">
                <td className="px-3 py-8 text-center text-sm text-ink-muted" colSpan={5}>
                  لا توجد نسخ احتياطية بعد. أنشئ نسخة من الأزرار أعلاه.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

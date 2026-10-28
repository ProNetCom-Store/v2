import Link from "next/link";
import { ConfirmForm } from "@/components/confirm-form";
import { canManageSystem, requireUser } from "@/lib/auth";
import { listDir, readTextFile, MAX_EDIT_BYTES } from "@/lib/files";
import {
  createFolderAction,
  deleteEntryAction,
  renameEntryAction,
  saveFileAction,
  uploadFilesAction,
} from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ dir?: string; edit?: string }>;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "";
  }
}

export default async function AdminFilesPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  if (!canManageSystem(user)) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">هذه الصفحة مخصّصة للإدارة والمصمّم فقط.</p>;
  }

  const sp = await searchParams;
  const rawDir = (sp.dir ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

  let listing: ReturnType<typeof listDir>;
  try {
    listing = listDir(rawDir);
  } catch {
    listing = listDir("");
  }
  const dir = listing.dir;

  const segments = dir ? dir.split("/") : [];

  let editing: { rel: string; content: string; size: number; truncated: boolean; binary: boolean } | null = null;
  if (sp.edit) {
    try {
      const file = readTextFile(sp.edit);
      editing = { rel: sp.edit, ...file };
    } catch {
      editing = null;
    }
  }

  const crumbBase = "/admin/files";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">مدير ملفات المشروع</h1>
        <p className="mt-1 text-sm text-ink-muted">
          تصفّح ملفات ومجلدات المشروع على السيرفر، وحرّر الملفات النصية، وأنشئ مجلدات، وارفع ملفات جديدة. متاح للإدارة
          والمصمّم فقط، وكل عملية تُسجَّل في سجل التدقيق.
        </p>
      </header>

      <div className="panel p-4">
        <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="مسار المجلد">
          <Link href={crumbBase} className="rounded px-1.5 py-0.5 font-bold text-brand-strong hover:bg-surface-3">
            جذر المشروع
          </Link>
          {segments.map((seg, i) => {
            const target = segments.slice(0, i + 1).join("/");
            const last = i === segments.length - 1;
            return (
              <span key={target} className="flex items-center gap-1">
                <span className="text-ink-muted">/</span>
                {last ? (
                  <span className="rounded px-1.5 py-0.5 font-bold text-ink">{seg}</span>
                ) : (
                  <Link
                    href={`${crumbBase}?dir=${encodeURIComponent(target)}`}
                    className="rounded px-1.5 py-0.5 font-bold text-brand-strong hover:bg-surface-3"
                  >
                    {seg}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <form action={createFolderAction} className="panel flex flex-wrap items-end gap-2 p-4">
          <input type="hidden" name="parent" value={dir} />
          <label htmlFor="new-folder" className="w-full text-xs font-bold text-ink-muted">
            إنشاء مجلد جديد داخل: {dir || "جذر المشروع"}
          </label>
          <input id="new-folder" name="name" required placeholder="اسم المجلد" className="input-base flex-1 text-sm" />
          <button type="submit" className="btn-primary text-sm">
            + مجلد
          </button>
        </form>

        <form action={uploadFilesAction} className="panel flex flex-wrap items-end gap-2 p-4">
          <input type="hidden" name="dir" value={dir} />
          <label htmlFor="upload-input" className="w-full text-xs font-bold text-ink-muted">
            رفع ملفات إلى: {dir || "جذر المشروع"} (حتى 64 ميجابايت للملف)
          </label>
          <input
            id="upload-input"
            name="files"
            type="file"
            multiple
            required
            className="input-base flex-1 text-sm file:me-2 file:rounded file:border-0 file:bg-brand/15 file:px-2 file:py-1 file:text-xs file:font-bold file:text-brand-strong"
          />
          <button type="submit" className="btn-primary text-sm">
            ⬆ رفع
          </button>
        </form>
      </div>

      {editing ? (
        <form action={saveFileAction} className="panel space-y-3 border-2 border-brand/50 p-4">
          <input type="hidden" name="path" value={editing.rel} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-black text-ink" dir="ltr">
              {editing.rel}
            </p>
            <Link href={`${crumbBase}?dir=${encodeURIComponent(dir)}`} className="text-xs font-bold text-ink-muted hover:text-ink">
              ✕ إغلاق
            </Link>
          </div>
          {editing.binary ? (
            <p className="rounded-lg border border-amber-400/50 bg-amber-400/10 p-3 text-xs font-bold text-amber-700">
              هذا الملف يبدو ثنائيًا (Binary) ولا يصلح للتحرير النصي. يمكنك تنزيله بدلًا من ذلك.
            </p>
          ) : (
            <>
              {editing.truncated ? (
                <p className="rounded-lg border border-amber-400/50 bg-amber-400/10 p-3 text-xs font-bold text-amber-700">
                  الملف أكبر من {formatBytes(MAX_EDIT_BYTES)} — يُعرض الجزء الأول فقط ولن تُحفظ عليه إلا عند الحفظ.
                </p>
              ) : null}
              <textarea
                name="content"
                rows={22}
                dir="ltr"
                defaultValue={editing.content}
                className="input-base w-full font-mono text-xs leading-6"
                spellCheck={false}
              />
              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary text-sm">
                  💾 حفظ الملف
                </button>
                <span className="text-xs text-ink-muted">الحجم الأصلي: {formatBytes(editing.size)}</span>
              </div>
            </>
          )}
        </form>
      ) : null}

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-3 text-xs font-black text-ink-muted">
            <tr>
              <th className="px-3 py-2 text-right">الاسم</th>
              <th className="px-3 py-2 text-right">الحجم</th>
              <th className="px-3 py-2 text-right">آخر تعديل</th>
              <th className="px-3 py-2 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {dir ? (
              <tr className="border-t border-line">
                <td className="px-3 py-2" colSpan={4}>
                  <Link
                    href={`${crumbBase}${segments.length > 1 ? `?dir=${encodeURIComponent(segments.slice(0, -1).join("/"))}` : ""}`}
                    className="font-bold text-brand-strong hover:underline"
                  >
                    ⬆ المجلد الأعلى
                  </Link>
                </td>
              </tr>
            ) : null}

            {listing.entries.map((entry) => {
              const isDir = entry.type === "dir";
              return (
                <tr key={entry.rel} className="border-t border-line align-top">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">{isDir ? "📁" : entry.editable ? "📝" : "📄"}</span>
                      {isDir ? (
                        <Link href={`${crumbBase}?dir=${encodeURIComponent(entry.rel)}`} className="font-bold text-brand-strong hover:underline">
                          {entry.name}
                        </Link>
                      ) : entry.editable ? (
                        <Link
                          href={`${crumbBase}?dir=${encodeURIComponent(dir)}&edit=${encodeURIComponent(entry.rel)}`}
                          className="font-bold text-brand-strong hover:underline"
                          dir="ltr"
                        >
                          {entry.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-ink" dir="ltr">
                          {entry.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-muted">{isDir ? "—" : formatBytes(entry.size)}</td>
                  <td className="px-3 py-2 text-xs text-ink-muted">{formatDate(entry.mtime)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.downloadable ? (
                        <a
                          href={`/api/admin/download?type=file&path=${encodeURIComponent(entry.rel)}`}
                          className="rounded-lg border border-line px-2 py-1 text-[11px] font-bold text-ink-muted hover:border-brand/50 hover:text-brand-strong"
                        >
                          ⬇ تنزيل
                        </a>
                      ) : null}

                      <details className="inline-block">
                        <summary className="cursor-pointer list-none rounded-lg border border-line px-2 py-1 text-[11px] font-bold text-ink-muted hover:border-brand/50 hover:text-brand-strong">
                          ✎ إعادة تسمية
                        </summary>
                        <form action={renameEntryAction} className="mt-2 flex flex-wrap items-center gap-2">
                          <input type="hidden" name="path" value={entry.rel} />
                          <input name="newName" defaultValue={entry.name} required className="input-base w-40 text-xs" dir="ltr" />
                          <button type="submit" className="btn-primary text-[11px]">
                            حفظ
                          </button>
                        </form>
                      </details>

                      <ConfirmForm
                        action={deleteEntryAction}
                        message={`تأكيد حذف «${entry.name}» نهائيًا؟`}
                      >
                        <input type="hidden" name="path" value={entry.rel} />
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
              );
            })}

            {listing.entries.length === 0 ? (
              <tr className="border-t border-line">
                <td className="px-3 py-8 text-center text-sm text-ink-muted" colSpan={4}>
                  هذا المجلد فارغ.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-muted">
        ملاحظات: مجلدات <span dir="ltr">node_modules</span> و<span dir="ltr">.next</span> مخفية وغير قابلة للتعديل. لا
        يمكن تعديل ملف قاعدة البيانات مباشرةً — استخدم النسخ الاحتياطي. بعد تغيير كود المشروع قد تحتاج لإعادة البناء
        والنشر ليظهر التغيير.
      </p>
    </div>
  );
}

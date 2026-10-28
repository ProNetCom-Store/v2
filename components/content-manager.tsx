"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "color" | "lines";
  placeholder?: string;
  options?: { value: string; label: string }[];
  help?: string;
  dir?: "ltr" | "rtl";
  /** حقل يمتد على عرض الصف كاملًا. */
  wide?: boolean;
  /** حقل إنجليزي (يُعرض عليه وسم EN). */
  english?: boolean;
  rows?: number;
}

export interface ItemRecord {
  id: string;
  [key: string]: unknown;
}

/** الحالة الحالية لنموذج الإضافة/النسخ. */
interface Draft {
  mode: "new" | "copy";
  values: Record<string, unknown>;
  sourceTitle?: string;
  /** مفتاح لإعادة إنشاء النموذج عند تبديل البيانات. */
  key: number;
}

function toInputValue(value: unknown, type: FieldDef["type"]): string {
  if (type === "lines") return Array.isArray(value) ? value.join("\n") : String(value ?? "");
  if (value === null || value === undefined) return "";
  return String(value);
}

/** النص القابل للبحث عن عنصر (كل الحقول النصية + المعرّف). */
function haystack(item: Record<string, unknown>, fields: FieldDef[]): string {
  const parts: string[] = [String(item.id ?? "")];
  for (const f of fields) {
    const v = item[f.name];
    if (Array.isArray(v)) parts.push(v.join(" "));
    else if (v !== null && v !== undefined) parts.push(String(v));
  }
  return parts.join(" ").toLowerCase();
}

function Field({ field, value, idPrefix }: { field: FieldDef; value: unknown; idPrefix: string }) {
  const inputId = `${idPrefix}-${field.name}`;
  const common = "input-base text-sm";

  return (
    <div className={field.wide ? "md:col-span-2" : undefined}>
      <label htmlFor={inputId} className="mb-1 block text-xs font-bold text-ink-muted">
        {field.label}
        {field.english ? (
          <span className="ms-2 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-black text-brand-strong">EN</span>
        ) : null}
      </label>

      {field.type === "textarea" || field.type === "lines" ? (
        <textarea
          id={inputId}
          name={field.name}
          rows={field.rows ?? (field.type === "lines" ? 4 : 6)}
          placeholder={field.placeholder}
          defaultValue={toInputValue(value, field.type)}
          dir={field.dir}
          className={common}
        />
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">
          <input id={inputId} name={field.name} type="checkbox" defaultChecked={Boolean(value)} className="h-4 w-4" />
          {field.placeholder ?? field.label}
        </label>
      ) : field.type === "select" ? (
        <select id={inputId} name={field.name} defaultValue={toInputValue(value, "text")} className={common}>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={field.name}
          type={field.type === "number" ? "number" : field.type === "color" ? "color" : "text"}
          step={field.type === "number" ? "any" : undefined}
          placeholder={field.placeholder}
          defaultValue={toInputValue(value, field.type)}
          dir={field.dir}
          className={common}
        />
      )}

      {field.help ? <p className="mt-1 text-[11px] text-ink-muted">{field.help}</p> : null}
    </div>
  );
}

export function ContentManager<T extends { id: string }>({
  items,
  fields,
  saveAction,
  deleteAction,
  newDefaults = {},
  titleField,
  addLabel,
  emptyLabel,
  deleteConfirm,
  newItemId = "new",
  searchPlaceholder = "ابحث بالاسم أو الرمز أو أي بيانات…",
  copyLabel = "نسخ إلى عنصر جديد",
  initialCopy = null,
  initialCopyTitle,
}: {
  items: T[];
  fields: FieldDef[];
  saveAction: (formData: FormData) => Promise<void>;
  deleteAction?: (formData: FormData) => Promise<void>;
  newDefaults?: Record<string, unknown>;
  titleField: string;
  addLabel: string;
  emptyLabel: string;
  deleteConfirm: string;
  newItemId?: string;
  searchPlaceholder?: string;
  copyLabel?: string;
  /** عند تمرير بيانات عنصر، يُفتح نموذج النسخ مباشرةً مع تركيز على الاسم. */
  initialCopy?: Record<string, unknown> | null;
  initialCopyTitle?: string;
}) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(() =>
    initialCopy
      ? {
          mode: "copy",
          values: { ...initialCopy },
          sourceTitle: initialCopyTitle ?? String(initialCopy[titleField] ?? ""),
          key: Date.now(),
        }
      : null,
  );
  const formRef = useRef<HTMLFormElement | null>(null);

  // عند فتح نموذج النسخ: مرّر إليه وركّز على حقل الاسم لتغييره بسهولة.
  useEffect(() => {
    if (draft?.mode !== "copy") return;
    const form = formRef.current;
    if (!form) return;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    const el = form.querySelector<HTMLElement>(`[name="${titleField}"]`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.select();
    }
  }, [draft, titleField]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => haystack(item as unknown as Record<string, unknown>, fields).includes(q));
  }, [items, fields, query]);

  function openNew() {
    setDraft((d) => (d ? null : { mode: "new", values: { ...newDefaults }, key: Date.now() }));
  }

  function openCopy(item: T) {
    const rec = item as unknown as Record<string, unknown>;
    setDraft({
      mode: "copy",
      values: { ...rec },
      sourceTitle: String(rec[titleField] ?? item.id),
      key: Date.now(),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <button type="button" onClick={openNew} className="btn-primary shrink-0 text-sm">
          {draft ? "− إغلاق النموذج" : `+ ${addLabel}`}
        </button>

        <div className="relative flex-1">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-muted">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-base ps-9 text-sm"
            aria-label="بحث"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute inset-y-0 end-2 flex items-center px-2 text-xs font-bold text-ink-muted hover:text-ink"
              aria-label="مسح البحث"
            >
              ✕
            </button>
          ) : null}
        </div>

        <p className="shrink-0 text-xs font-bold text-ink-muted">
          {query ? `${filtered.length} من ${items.length}` : `${items.length} عنصرًا`}
        </p>
      </div>

      {draft ? (
        <form
          key={draft.key}
          ref={formRef}
          action={saveAction}
          className="panel grid gap-3 border-2 border-brand/50 p-4 md:grid-cols-2"
        >
          <input type="hidden" name="id" value="" />

          {draft.mode === "copy" ? (
            <p className="rounded-lg border border-amber-400/50 bg-amber-400/10 p-3 text-xs font-bold text-amber-700 md:col-span-2">
              ⚠️ تم نسخ بيانات «{draft.sourceTitle}». عدّل الاسم (وأي حقول أخرى) ثم اضغط «إنشاء نسخة» لإضافة عنصر جديد.
            </p>
          ) : null}

          <p className="text-sm font-black text-ink md:col-span-2">
            {draft.mode === "copy" ? `نسخة من: ${draft.sourceTitle}` : addLabel}
          </p>

          {fields.map((f) => (
            <Field key={f.name} field={f} value={draft.values[f.name]} idPrefix={`${newItemId}-${draft.key}`} />
          ))}

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button type="submit" className="btn-primary text-sm">
              {draft.mode === "copy" ? "إنشاء نسخة" : "إنشاء"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink-muted hover:text-ink"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : null}

      {items.length === 0 ? <p className="panel p-8 text-center text-sm text-ink-muted">{emptyLabel}</p> : null}

      {items.length > 0 && filtered.length === 0 ? (
        <p className="panel p-8 text-center text-sm text-ink-muted">لا توجد نتائج مطابقة لـ «{query}».</p>
      ) : null}

      <ul className="space-y-2">
        {filtered.map((item) => {
          const rec = item as unknown as Record<string, unknown>;
          const title = String(rec[titleField] ?? item.id);
          const active = rec.active === true;
          return (
            <li key={item.id}>
              <details className="panel overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-black text-ink">{title || item.id}</span>
                    {typeof rec.active === "boolean" ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                          active ? "bg-emerald-400/15 text-emerald-600" : "bg-rose-400/15 text-rose-500"
                        }`}
                      >
                        {active ? "معروض" : "مخفي"}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        openCopy(item);
                      }}
                      title={copyLabel}
                      className="rounded-lg border border-line px-2 py-1 text-[11px] font-bold text-ink-muted hover:border-brand/50 hover:text-brand-strong"
                    >
                      ⧉ نسخ
                    </button>
                    <span aria-hidden="true" className="text-xs text-ink-muted">
                      تعديل ▾
                    </span>
                  </span>
                </summary>

                <div className="border-t border-line p-4">
                  <form action={saveAction} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={item.id} />
                    {fields.map((f) => (
                      <Field key={f.name} field={f} value={rec[f.name]} idPrefix={item.id} />
                    ))}
                    <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                      <button type="submit" className="btn-primary text-sm">
                        حفظ التعديلات
                      </button>
                    </div>
                  </form>

                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() => openCopy(item)}
                      className="rounded-lg border border-brand/50 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand-strong hover:bg-brand/20"
                    >
                      ⧉ {copyLabel}
                    </button>

                    {deleteAction ? (
                      <form
                        action={deleteAction}
                        onSubmit={(e) => {
                          if (!window.confirm(deleteConfirm)) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-rose-400/50 bg-rose-400/10 px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-400/20"
                        >
                          🗑 حذف نهائي
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

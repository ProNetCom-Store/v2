import { canAccessTab, requireUser } from "@/lib/auth";
import { getBusinessAreas, getCategoryList } from "@/lib/queries";
import { ContentManager, type FieldDef } from "@/components/content-manager";
import { deleteAreaAction, saveAreaAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminAreasPage() {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية إدارة مجالات العمل.</p>;
  }

  const areas = getBusinessAreas({ includeInactive: true });
  const categories = getCategoryList(true);

  const FIELDS: FieldDef[] = [
    { name: "title", label: "اسم المجال (عربي)", type: "text" },
    { name: "titleEn", label: "الاسم (إنجليزي)", type: "text", english: true },
    { name: "icon", label: "رمز/إيموجي", type: "text", placeholder: "🖥️" },
    {
      name: "categoryFilter",
      label: "ربط بفئة المتجر",
      type: "select",
      options: [{ value: "", label: "بدون ربط" }, ...categories.map((c) => ({ value: c.name, label: c.name }))],
      help: "عند الضغط على «تصفّح القسم» ينتقل الزائر لهذه الفئة.",
    },
    { name: "desc", label: "الوصف (عربي)", type: "textarea", rows: 3, wide: true },
    { name: "descEn", label: "الوصف (إنجليزي)", type: "textarea", rows: 3, wide: true, english: true },
    { name: "sort", label: "الترتيب", type: "number" },
    { name: "active", label: "معروض", type: "checkbox", placeholder: "إظهار المجال على الموقع" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">مجالات العمل والخدمات</h1>
        <p className="mt-1 text-sm text-ink-muted">حرّر مجالات العمل الظاهرة في الصفحة الرئيسية وصفحة الخدمات.</p>
      </header>

      <ContentManager
        items={areas}
        fields={FIELDS}
        saveAction={saveAreaAction}
        deleteAction={deleteAreaAction}
        newDefaults={{ active: true, sort: areas.length }}
        titleField="title"
        addLabel="مجال عمل جديد"
        emptyLabel="لا توجد مجالات عمل بعد."
        deleteConfirm="هل تريد حذف هذا المجال نهائيًا؟"
      />
    </div>
  );
}

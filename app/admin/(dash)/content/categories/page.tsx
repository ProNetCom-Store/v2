import { canAccessTab, requireUser } from "@/lib/auth";
import { getCategoryList } from "@/lib/queries";
import { ContentManager, type FieldDef } from "@/components/content-manager";
import { deleteCategoryAction, saveCategoryAction } from "../actions";

export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "name", label: "اسم الفئة (عربي)", type: "text", help: "يُستخدم أيضًا كمفتاح ربط الأصناف بالفئة." },
  { name: "nameEn", label: "اسم الفئة (إنجليزي)", type: "text", english: true },
  { name: "icon", label: "رمز/إيموجي", type: "text", placeholder: "💻" },
  { name: "image", label: "رابط صورة الفئة", type: "text", dir: "ltr" },
  { name: "sort", label: "الترتيب", type: "number" },
  { name: "active", label: "معروضة", type: "checkbox", placeholder: "إظهار الفئة في المتجر" },
];

export default async function AdminCategoriesPage() {
  const user = await requireUser();
  if (!canAccessTab(user, "categories")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية إدارة الفئات.</p>;
  }
  const categories = getCategoryList(true);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">فئات المتجر</h1>
        <p className="mt-1 text-sm text-ink-muted">
          أضف وحرّر فئات المتجر. تنبيه: تغيير اسم الفئة لا يعيد ربط الأصناف تلقائيًا — عدّل الصنف من صفحة الأصناف بعد
          التغيير.
        </p>
      </header>

      <ContentManager
        items={categories}
        fields={FIELDS}
        saveAction={saveCategoryAction}
        deleteAction={deleteCategoryAction}
        newDefaults={{ active: true, sort: categories.length }}
        titleField="name"
        addLabel="فئة جديدة"
        emptyLabel="لا توجد فئات بعد."
        deleteConfirm="هل تريد حذف هذه الفئة نهائيًا؟ (لن تُحذف الأصناف المرتبطة)"
      />
    </div>
  );
}

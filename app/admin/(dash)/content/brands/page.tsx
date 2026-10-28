import { canAccessTab, requireUser } from "@/lib/auth";
import { getBrandList } from "@/lib/queries";
import { ContentManager, type FieldDef } from "@/components/content-manager";
import { deleteBrandAction, saveBrandAction } from "../actions";

export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "name", label: "اسم الماركة/الوكالة (عربي)", type: "text" },
  { name: "nameEn", label: "الاسم (إنجليزي)", type: "text", english: true },
  { name: "logo", label: "رابط الشعار", type: "text", dir: "ltr", placeholder: "/assets/brands/....png", help: "اتركه فارغًا لعرض الأحرف الأولى بشكل أنيق." },
  { name: "website", label: "الموقع الرسمي", type: "text", dir: "ltr", placeholder: "https://..." },
  { name: "isAgent", label: "وكيل رسمي معتمد", type: "checkbox", placeholder: "إظهار شارة «وكيل معتمد»" },
  { name: "description", label: "وصف مختصر (عربي)", type: "textarea", rows: 3, wide: true },
  { name: "descriptionEn", label: "وصف مختصر (إنجليزي)", type: "textarea", rows: 3, wide: true, english: true },
  { name: "sort", label: "الترتيب", type: "number" },
  { name: "active", label: "معروضة", type: "checkbox", placeholder: "إظهارها في شريط الماركات" },
];

export default async function AdminBrandsPage() {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية إدارة الماركات والوكلاء.</p>;
  }
  const brands = getBrandList(true);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">الماركات والوكلاء المعتمدون</h1>
        <p className="mt-1 text-sm text-ink-muted">
          تحكّم في محتوى شريط الماركات/الوكلاء الظاهر في الصفحة الرئيسية: الشعارات، الوصف، وشارة الوكيل الرسمي.
        </p>
      </header>

      <ContentManager
        items={brands}
        fields={FIELDS}
        saveAction={saveBrandAction}
        deleteAction={deleteBrandAction}
        newDefaults={{ active: true, isAgent: false, sort: brands.length }}
        titleField="name"
        addLabel="ماركة / وكالة جديدة"
        emptyLabel="لا توجد ماركات بعد."
        deleteConfirm="هل تريد حذف هذه الماركة نهائيًا؟"
      />
    </div>
  );
}

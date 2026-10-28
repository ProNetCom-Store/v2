import { canAccessTab, requireUser } from "@/lib/auth";
import { getProjects } from "@/lib/queries";
import { ContentManager, type FieldDef } from "@/components/content-manager";
import { deleteProjectAction, saveProjectAction } from "../actions";

export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "title", label: "عنوان المشروع (عربي)", type: "text" },
  { name: "titleEn", label: "العنوان (إنجليزي)", type: "text", english: true },
  { name: "category", label: "التصنيف", type: "text", placeholder: "شبكات / مراقبة / توريد" },
  { name: "location", label: "الموقع", type: "text", placeholder: "عدن — المنصورة" },
  { name: "desc", label: "الوصف (عربي)", type: "textarea", rows: 3, wide: true },
  { name: "descEn", label: "الوصف (إنجليزي)", type: "textarea", rows: 3, wide: true, english: true },
  { name: "image", label: "رابط الصورة", type: "text", dir: "ltr", wide: true },
  { name: "sort", label: "الترتيب", type: "number" },
  { name: "active", label: "معروض", type: "checkbox", placeholder: "إظهار المشروع على الموقع" },
];

export default async function AdminProjectsPage() {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية إدارة المشاريع.</p>;
  }
  const projects = getProjects({ includeInactive: true });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">المشاريع والمناقصات</h1>
        <p className="mt-1 text-sm text-ink-muted">أضف وحرّر المشاريع المنفّذة الظاهرة في الموقع.</p>
      </header>

      <ContentManager
        items={projects}
        fields={FIELDS}
        saveAction={saveProjectAction}
        deleteAction={deleteProjectAction}
        newDefaults={{ active: true, sort: projects.length }}
        titleField="title"
        addLabel="مشروع جديد"
        emptyLabel="لا توجد مشاريع بعد."
        deleteConfirm="هل تريد حذف هذا المشروع نهائيًا؟"
      />
    </div>
  );
}

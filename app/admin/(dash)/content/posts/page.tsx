import { canAccessTab, requireUser } from "@/lib/auth";
import { getPosts } from "@/lib/queries";
import { ContentManager, type FieldDef } from "@/components/content-manager";
import { deletePostAction, savePostAction } from "../actions";

export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "title", label: "العنوان (عربي)", type: "text", placeholder: "عنوان المقال" },
  { name: "titleEn", label: "العنوان (إنجليزي)", type: "text", english: true },
  { name: "tag", label: "التصنيف/الوسم", type: "text", placeholder: "نصائح تقنية" },
  { name: "tagEn", label: "التصنيف (إنجليزي)", type: "text", english: true },
  { name: "date", label: "التاريخ", type: "text", dir: "ltr", placeholder: "2026-01-01" },
  { name: "image", label: "رابط الصورة", type: "text", dir: "ltr", placeholder: "/assets/..." },
  { name: "excerpt", label: "مقتطف (عربي)", type: "textarea", rows: 3, wide: true },
  { name: "excerptEn", label: "مقتطف (إنجليزي)", type: "textarea", rows: 3, wide: true, english: true },
  { name: "content", label: "المحتوى الكامل (عربي)", type: "textarea", rows: 10, wide: true },
  { name: "contentEn", label: "المحتوى الكامل (إنجليزي)", type: "textarea", rows: 10, wide: true, english: true },
  { name: "sort", label: "الترتيب", type: "number", help: "الأعلى يظهر أولًا" },
  { name: "active", label: "منشور", type: "checkbox", placeholder: "معروض على الموقع" },
];

export default async function AdminPostsPage() {
  const user = await requireUser();
  if (!canAccessTab(user, "posts")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية إدارة المنشورات.</p>;
  }

  const posts = getPosts({ includeInactive: true });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">المقالات والنصائح التقنية والعروض</h1>
        <p className="mt-1 text-sm text-ink-muted">
          أضف وحرّر المنشورات التي تظهر في «المدونة والعروض» وعلى الصفحة الرئيسية. الحقول المعلّمة بـ EN تظهر
          للزوّار الإنجليز، وعند تركها فارغة يُعرض النص العربي.
        </p>
      </header>

      <ContentManager
        items={posts}
        fields={FIELDS}
        saveAction={savePostAction}
        deleteAction={deletePostAction}
        newDefaults={{ date: new Date().toISOString().slice(0, 10), active: true, sort: 0 }}
        titleField="title"
        addLabel="مقال / عرض جديد"
        emptyLabel="لا توجد منشورات بعد. ابدأ بإضافة أول مقال."
        deleteConfirm="هل تريد حذف هذا المنشور نهائيًا؟"
      />
    </div>
  );
}

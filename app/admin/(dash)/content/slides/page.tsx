import { canAccessTab, requireUser } from "@/lib/auth";
import { getSlides } from "@/lib/queries";
import { ContentManager, type FieldDef } from "@/components/content-manager";
import { deleteSlideAction, saveSlideAction } from "../actions";

export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "title", label: "العنوان الرئيسي (عربي)", type: "text", wide: true },
  { name: "titleEn", label: "العنوان الرئيسي (إنجليزي)", type: "text", wide: true, english: true },
  { name: "badge", label: "الشارة العلوية (عربي)", type: "text" },
  { name: "badgeEn", label: "الشارة العلوية (إنجليزي)", type: "text", english: true },
  { name: "subtitle", label: "الوصف (عربي)", type: "textarea", rows: 3, wide: true },
  { name: "subtitleEn", label: "الوصف (إنجليزي)", type: "textarea", rows: 3, wide: true, english: true },
  { name: "image", label: "رابط صورة الخلفية", type: "text", dir: "ltr", placeholder: "/assets/hero_banner.jpg", wide: true, help: "مسار داخل المجلد public أو رابط كامل." },
  { name: "imageAlt", label: "وصف الصورة (لإمكانية الوصول)", type: "text", wide: true },
  { name: "ctaLabel", label: "نص زر الإجراء (عربي)", type: "text" },
  { name: "ctaLabelEn", label: "نص زر الإجراء (إنجليزي)", type: "text", english: true },
  { name: "ctaHref", label: "رابط زر الإجراء", type: "text", dir: "ltr", placeholder: "/store" },
  { name: "sort", label: "ترتيب الشريحة", type: "number" },
  { name: "active", label: "معروضة", type: "checkbox", placeholder: "عرض هذه الشريحة في الصفحة الرئيسية" },
];

export default async function AdminSlidesPage() {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية إدارة لوحة العرض.</p>;
  }
  const slides = getSlides({ includeInactive: true });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">لوحة العرض التلقائية (الصفحة الرئيسية)</h1>
        <p className="mt-1 text-sm text-ink-muted">
          أضف وحرّر شرائح السلايدر: الصورة، النصوص بالعربية والإنجليزية، وزر الإجراء. الترتيب يحدّد تتابع العرض.
        </p>
      </header>

      <ContentManager
        items={slides}
        fields={FIELDS}
        saveAction={saveSlideAction}
        deleteAction={deleteSlideAction}
        newDefaults={{ active: true, ctaHref: "/store", sort: slides.length }}
        titleField="title"
        addLabel="شريحة عرض جديدة"
        emptyLabel="لا توجد شرائح. أضف أول شريحة لعرضها في الصفحة الرئيسية."
        deleteConfirm="هل تريد حذف هذه الشريحة نهائيًا؟"
      />
    </div>
  );
}

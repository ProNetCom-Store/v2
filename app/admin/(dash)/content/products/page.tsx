import { canAccessTab, requireUser } from "@/lib/auth";
import { getBrandList, getCategoryList, getProducts } from "@/lib/queries";
import { ContentManager, type FieldDef } from "@/components/content-manager";
import { deleteProductAction, saveProductAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ copy?: string }>;

export default async function AdminContentProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  if (!canAccessTab(user, "products")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية إدارة الأصناف.</p>;
  }

  const sp = await searchParams;
  const products = getProducts({ includeInactive: true, sort: "name", limit: 500 });
  const categories = getCategoryList(true);
  const brands = getBrandList(true);
  const canEditPrices = user.roleKey === "designer" || user.canEditPrices;

  const copyId = sp.copy?.trim();
  const copySource = copyId ? products.find((p) => p.id === copyId) ?? null : null;
  const copyItem = copySource ? (copySource as unknown as Record<string, unknown>) : null;

  const categoryOptions = [{ value: "", label: "بدون فئة" }, ...categories.map((c) => ({ value: c.name, label: c.name }))];
  const brandOptions = [{ value: "", label: "بدون ماركة" }, ...brands.map((b) => ({ value: b.name, label: b.name }))];

  const FIELDS: FieldDef[] = [
    { name: "name", label: "اسم الصنف (عربي)", type: "text", wide: true },
    { name: "nameEn", label: "اسم الصنف (إنجليزي)", type: "text", wide: true, english: true },
    { name: "sku", label: "الرمز SKU", type: "text", dir: "ltr" },
    { name: "brandCode", label: "كود الماركة", type: "text", dir: "ltr" },
    { name: "model", label: "الموديل", type: "text", dir: "ltr" },
    { name: "iconType", label: "نوع الأيقونة", type: "text", dir: "ltr", placeholder: "box / laptop / printer..." },
    { name: "category", label: "الفئة", type: "select", options: categoryOptions },
    { name: "brand", label: "الماركة", type: "select", options: brandOptions },
    { name: "price", label: "السعر ($)", type: "number", help: canEditPrices ? undefined : "حسابك لا يملك صلاحية تعديل الأسعار." },
    { name: "oldPrice", label: "السعر قبل الخصم ($)", type: "number" },
    { name: "badge", label: "الشارة (عربي)", type: "text" },
    { name: "badgeEn", label: "الشارة (إنجليزي)", type: "text", english: true },
    { name: "specs", label: "المواصفات (سطر لكل مواصفة)", type: "lines", wide: true, rows: 4 },
    { name: "specsEn", label: "المواصفات بالإنجليزية (سطر لكل مواصفة)", type: "lines", wide: true, rows: 4, english: true },
    { name: "description", label: "الوصف (عربي)", type: "textarea", rows: 4, wide: true },
    { name: "descriptionEn", label: "الوصف (إنجليزي)", type: "textarea", rows: 4, wide: true, english: true },
    { name: "imageUrl", label: "رابط الصورة", type: "text", dir: "ltr", wide: true },
    { name: "officialSpecUrl", label: "رابط المواصفات الرسمية", type: "text", dir: "ltr", wide: true },
    { name: "hidePrice", label: "إخفاء السعر", type: "checkbox", placeholder: "عرض «السعر عند الطلب»" },
    { name: "featured", label: "مميّز", type: "checkbox", placeholder: "إبرازه في الصفحة الرئيسية" },
    { name: "active", label: "معروض", type: "checkbox", placeholder: "إظهاره في المتجر" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">إضافة وتحرير الأصناف</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {products.length} صنفًا. تحرير كامل لبيانات الصنف ومواصفاته وترجمته الإنجليزية. لتعديل سريع للسعر والشارة فقط
          استخدم صفحة «الأصناف».
        </p>
      </header>

      <ContentManager
        items={products}
        fields={FIELDS}
        saveAction={saveProductAction}
        deleteAction={deleteProductAction}
        newDefaults={{ active: true, featured: false, hidePrice: false, iconType: "box", price: 0 }}
        titleField="name"
        addLabel="صنف جديد"
        emptyLabel="لا توجد أصناف بعد."
        deleteConfirm="هل تريد حذف هذا الصنف نهائيًا؟"
        initialCopy={copyItem}
        initialCopyTitle={copySource?.name}
      />
    </div>
  );
}

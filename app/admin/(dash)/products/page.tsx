import { canAccessTab, requireUser } from "@/lib/auth";
import { getBrands, getCategories, getProducts, type ProductFilters } from "@/lib/queries";
import { formatUsd } from "@/lib/format";
import Link from "next/link";
import { updateProduct } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; category?: string; brand?: string }>;

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const sp = await searchParams;

  const filters: ProductFilters = {
    search: sp.q?.trim() || undefined,
    category: sp.category || undefined,
    brand: sp.brand || undefined,
    sort: "name",
    // اللوحة تعرض غير المعروض أيضًا حتى يمكن إعادة تفعيله
    includeInactive: true,
  };
  const products = getProducts(filters);

  const canEditPrices = user.roleKey === "designer" || user.canEditPrices;
  const canEditVisibility = canAccessTab(user, "products") || user.canDeleteItems;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">إدارة الأصناف</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {products.length} صنفًا
          {products.some((p) => !p.active)
            ? ` (منها ${products.filter((p) => !p.active).length} مخفي عن المتجر)`
            : ""}
          . التعديلات تُحفظ في قاعدة البيانات على الخادم مباشرة.
          {!canEditPrices ? " (حسابك لا يملك صلاحية تعديل الأسعار — الحقل معطّل)" : ""}
        </p>
      </header>

      <form method="get" className="panel grid gap-3 p-4 md:grid-cols-4">
        <div>
          <label htmlFor="q" className="mb-1 block text-xs font-bold text-ink-muted">
            بحث
          </label>
          <input id="q" name="q" type="search" defaultValue={sp.q ?? ""} className="input-base text-sm" />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-xs font-bold text-ink-muted">
            القسم
          </label>
          <select id="category" name="category" defaultValue={sp.category ?? ""} className="input-base text-sm">
            <option value="">كل الأقسام</option>
            {getCategories().map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="brand" className="mb-1 block text-xs font-bold text-ink-muted">
            الماركة
          </label>
          <select id="brand" name="brand" defaultValue={sp.brand ?? ""} className="input-base text-sm">
            <option value="">كل الماركات</option>
            {getBrands().map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full text-sm">
            تصفية
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {products.map((p) => (
          <form key={p.id} action={updateProduct} className="panel grid gap-3 p-4 lg:grid-cols-12">
            <input type="hidden" name="id" value={p.id} />

            <div className="lg:col-span-4">
              <p className="text-sm font-bold leading-6 text-ink">
                {p.name}
                {!p.active ? (
                  <span className="ms-2 rounded-lg border border-rose-400/50 bg-rose-400/10 px-2 py-0.5 text-[10px] font-bold text-rose-200">
                    مخفي عن المتجر
                  </span>
                ) : null}
              </p>
              <p className="mt-1 font-mono text-[11px] text-ink-muted" dir="ltr">
                {p.sku} • {p.model}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">{p.category}</p>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor={`price-${p.id}`} className="mb-1 block text-xs font-bold text-ink-muted">
                السعر ($)
              </label>
              <input
                id={`price-${p.id}`}
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={p.price}
                disabled={!canEditPrices}
                className="input-base text-sm disabled:opacity-50"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor={`old-${p.id}`} className="mb-1 block text-xs font-bold text-ink-muted">
                السعر قبل الخصم ($)
              </label>
              <input
                id={`old-${p.id}`}
                name="oldPrice"
                type="number"
                min={0}
                step="0.01"
                defaultValue={p.oldPrice ?? ""}
                disabled={!canEditPrices}
                className="input-base text-sm disabled:opacity-50"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor={`badge-${p.id}`} className="mb-1 block text-xs font-bold text-ink-muted">
                الشارة
              </label>
              <input
                id={`badge-${p.id}`}
                name="badge"
                defaultValue={p.badge ?? ""}
                maxLength={40}
                placeholder="مثال: عرض خاص"
                className="input-base text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-ink-soft">
                <input type="checkbox" name="featured" defaultChecked={p.featured} className="h-4 w-4" />
                مميّز
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-ink-soft">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={p.active}
                  disabled={!canEditVisibility}
                  className="h-4 w-4 disabled:opacity-50"
                />
                معروض
              </label>
              <button type="submit" className="btn-primary w-full text-xs">
                حفظ
              </button>
              <Link
                href={`/admin/content/products?copy=${encodeURIComponent(p.id)}`}
                className="rounded-lg border border-brand/50 bg-brand/10 px-3 py-1.5 text-center text-xs font-bold text-brand-strong hover:bg-brand/20"
                title="نسخ بيانات الصنف إلى صنف جديد"
              >
                ⧉ نسخ
              </Link>
            </div>
          </form>
        ))}

        {products.length === 0 ? (
          <p className="panel p-8 text-center text-sm text-ink-muted">لا توجد أصناف مطابقة.</p>
        ) : null}
      </div>

      <p className="text-center text-xs text-ink-muted">
        إجمالي قيمة المعروض:{" "}
        <span className="font-bold text-ink">
          {formatUsd(products.reduce((s, p) => s + p.price, 0))}
        </span>{" "}
        (مجموع أسعار الأصناف المعروضة أعلاه)
      </p>
    </div>
  );
}

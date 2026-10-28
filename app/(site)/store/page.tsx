import { ProductCard } from "@/components/product-card";
import { StoreBrandsFilterStrip } from "@/components/brands-bar";
import {
  countProducts,
  getBrandList,
  getBrandProductCounts,
  getCategoryList,
  getProducts,
  getSettings,
  type ProductFilters,
} from "@/lib/queries";
import { getServerLocale } from "@/lib/server-locale";
import { pick } from "@/lib/types";

type SearchParams = Promise<{ q?: string; category?: string; brand?: string; sort?: string }>;

export default async function StorePage({ searchParams }: { searchParams: SearchParams }) {
  const { locale, dict } = await getServerLocale();
  const sp = await searchParams;
  const settings = getSettings();
  const categories = getCategoryList();
  const brands = getBrandList();
  const brandCounts = getBrandProductCounts();
  const totalProductsCount = countProducts();

  const sort = (["default", "price-asc", "price-desc", "name"] as const).includes(sp.sort as never)
    ? (sp.sort as ProductFilters["sort"])
    : "default";

  const filters: ProductFilters = {
    search: sp.q?.trim() || undefined,
    category: sp.category || undefined,
    brand: sp.brand || undefined,
    sort,
  };
  const products = getProducts(filters);

  const activeFilters = [sp.q, sp.category, sp.brand].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-4">
        <h1 className="text-3xl font-black text-ink">{dict.store.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{dict.store.intro}</p>
      </header>

      {/* شريط الماركات التفاعلي بالألوان والشعارات ولافتة الماركة المختارة */}
      <div className="mb-6">
        <StoreBrandsFilterStrip
          brands={brands}
          activeBrand={sp.brand}
          category={sp.category}
          search={sp.q}
          sort={sort}
          locale={locale}
          productCounts={brandCounts}
          totalProductsCount={totalProductsCount}
        />
      </div>

      {/* فلترة على الخادم: تعمل حتى بدون JavaScript، وكل تركيبة لها رابط قابل للمشاركة */}
      <form method="get" className="panel mb-6 grid gap-4 p-4 md:grid-cols-4" aria-label={dict.store.filterAria}>
        <div>
          <label htmlFor="q" className="mb-1 block text-xs font-bold text-ink-muted">
            {dict.store.search}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={sp.q ?? ""}
            placeholder={dict.store.searchPlaceholder}
            className="input-base text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-xs font-bold text-ink-muted">
            {dict.store.category}
          </label>
          <select id="category" name="category" defaultValue={sp.category ?? ""} className="input-base text-sm">
            <option value="">{dict.store.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {pick(locale, c.name, c.nameEn)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="brand" className="mb-1 block text-xs font-bold text-ink-muted">
            {dict.store.brand}
          </label>
          <select id="brand" name="brand" defaultValue={sp.brand ?? ""} className="input-base text-sm">
            <option value="">{dict.store.allBrands}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {pick(locale, b.name, b.nameEn)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="mb-1 block text-xs font-bold text-ink-muted">
            {dict.store.sortLabel}
          </label>
          <select id="sort" name="sort" defaultValue={sort} className="input-base text-sm">
            <option value="default">{dict.store.sortDefault}</option>
            <option value="price-asc">{dict.store.sortPriceAsc}</option>
            <option value="price-desc">{dict.store.sortPriceDesc}</option>
            <option value="name">{dict.store.sortName}</option>
          </select>
        </div>

        <div className="flex gap-3 md:col-span-4">
          <button type="submit" className="btn-primary text-sm">
            {dict.store.applyFilters}
          </button>
          {activeFilters > 0 ? (
            <a href="/store" className="btn-ghost text-sm">
              {dict.store.removeFilters}
            </a>
          ) : null}
        </div>
      </form>

      {/* عنوان قسم (h2) قبل بطاقات الأصناف (h3) — يحفظ تسلسل العناوين لاختبار الوصولية */}
      <section aria-labelledby="listing-heading">
        <h2 id="listing-heading" className="mb-4 text-xl font-black text-ink">
          {dict.store.listing} ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-lg font-bold text-ink">{dict.store.noResults}</p>
            <p className="mt-2 text-sm text-ink-muted">{dict.store.noResultsHint}</p>
            <a href="/store" className="btn-ghost mt-4 inline-block text-sm">
              {dict.store.viewAllProducts}
            </a>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} showPrices={settings.showPricesGlobal} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

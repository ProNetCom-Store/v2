import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { JsonLd, breadcrumbSchema, productSchema } from "@/components/json-ld";
import { Badge } from "@/components/badge";
import { ProductIcon, badgeTone } from "@/components/product-icon";
import { getProduct, getProducts, getSettings } from "@/lib/queries";
import { truncate } from "@/lib/format";
import { getServerLocale } from "@/lib/server-locale";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return {};

  const description = product.description || product.specs.join(" | ") || product.name;
  return {
    openGraph: {
      type: "website",
      title: product.name,
      description: truncate(description, 200),
      images: product.imageUrl ? [product.imageUrl] : ["/assets/hero_banner.jpg"],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const { dict } = await getServerLocale();
  const product = getProduct(id);
  if (!product) notFound();

  const settings = getSettings();
  const siteUrl = process.env.PRONET_SITE_URL || "http://localhost:3000";

  const related = getProducts({ category: product.category, limit: 5 }).filter((p) => p.id !== product.id).slice(0, 4);

  const hasDiscount = product.oldPrice !== null && product.oldPrice > product.price;
  const discountPct = hasDiscount && product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={productSchema({
          name: product.name,
          sku: product.sku,
          brand: product.brand,
          description: product.description,
          imageUrl: product.imageUrl,
          price: product.price,
          inStock: true,
          url: `${siteUrl}/product/${product.id}`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: dict.nav.home, url: siteUrl },
          { name: dict.nav.store, url: `${siteUrl}/store` },
          { name: product.category, url: `${siteUrl}/store?category=${encodeURIComponent(product.category)}` },
          { name: product.name, url: `${siteUrl}/product/${product.id}` },
        ])}
      />

      {/* مسار التنقل — مفقود في المشروع القديم ويُحسّن الفهرسة والتنقل */}
      <nav aria-label={dict.product.breadcrumbAria} className="mb-5 text-xs text-ink-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-brand-strong">
              {dict.nav.home}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/store" className="hover:text-brand-strong">
              {dict.nav.store}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/store?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-strong">
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-bold text-ink-soft">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="panel flex items-center justify-center bg-surface-2 p-8">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="max-h-80 w-auto object-contain" />
          ) : (
            <ProductIcon type={product.iconType} className="h-40 w-40 text-brand-strong" />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={product.category} tone="slate" />
            {product.badge ? <Badge label={product.badge} tone={badgeTone(product.badge)} /> : null}
          </div>

          <h1 className="mt-3 text-2xl font-black leading-9 text-ink sm:text-3xl">{product.name}</h1>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="panel p-3">
              <dt className="text-xs font-bold text-ink-muted">{dict.product.brand}</dt>
              <dd className="mt-0.5 font-bold text-ink">{product.brand}</dd>
            </div>
            <div className="panel p-3">
              <dt className="text-xs font-bold text-ink-muted">{dict.product.model}</dt>
              <dd className="mt-0.5 font-mono font-bold text-ink" dir="ltr">
                {product.model || "—"}
              </dd>
            </div>
            <div className="panel col-span-2 p-3">
              <dt className="text-xs font-bold text-ink-muted">{dict.product.skuLabel}</dt>
              <dd className="mt-0.5 font-mono font-bold text-ink" dir="ltr">
                {product.sku}
              </dd>
            </div>
          </dl>

          {settings.showPricesGlobal && !product.hidePrice ? (
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-black text-ink">${product.price.toLocaleString("en-US")}</span>
              {hasDiscount ? (
                <>
                  <span className="text-lg font-semibold text-ink-muted line-through">
                    ${(product.oldPrice as number).toLocaleString("en-US")}
                  </span>
                  <Badge label={`${dict.product.save} ${discountPct}%`} tone="gold" />
                </>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 text-lg font-black text-gold">{dict.product.priceOnRequestLong}</p>
          )}

          <div className="mt-6">
            <AddToCart product={product} whatsappNumber={settings.whatsappNumber} />
          </div>

          {product.officialSpecUrl ? (
            <p className="mt-4 text-xs text-ink-muted">
              {dict.product.officialSpecLabel}{" "}
              <a
                href={product.officialSpecUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-bold text-brand-strong hover:underline"
              >
                {dict.product.officialSpecLink}
              </a>
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6" aria-labelledby="specs-heading">
          <h2 id="specs-heading" className="text-lg font-black text-ink">
            {dict.product.specsTitle}
          </h2>
          {product.specs.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {product.specs.map((spec, i) => (
                <li key={i} className="flex gap-2 text-sm leading-6 text-ink-soft">
                  <span aria-hidden="true" className="text-brand">
                    ▪
                  </span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">{dict.product.noSpecs}</p>
          )}
        </section>

        <section className="panel p-6" aria-labelledby="desc-heading">
          <h2 id="desc-heading" className="text-lg font-black text-ink">
            {dict.product.aboutTitle}
          </h2>
          <p className="rich-text mt-3 text-sm text-ink-soft">{product.description || "—"}</p>
        </section>
      </div>

      {related.length > 0 ? (
        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-5 text-xl font-black text-ink">
            {dict.product.related}
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id}>
                <Link href={`/product/${p.id}`} className="panel flex h-full flex-col gap-2 p-4 hover:border-brand/60">
                  <ProductIcon type={p.iconType} className="h-10 w-10 text-brand-strong" />
                  <span className="text-sm font-bold leading-6 text-ink">{p.name}</span>
                  <span className="mt-auto font-black text-brand-strong">${p.price.toLocaleString("en-US")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useStore, formatMoney } from "./store-provider";
import { usePreferences } from "./preferences-provider";
import { Badge } from "./badge";
import { ProductIcon, badgeTone } from "./product-icon";
import { pick, type Product } from "@/lib/types";

export function toCartLine(product: Product) {
  return {
    productId: product.id,
    name: product.nameEn || product.name,
    sku: product.sku,
    priceUsd: product.price,
  };
}

export function ProductCard({ product, showPrices }: { product: Product; showPrices: boolean }) {
  const { addToCart, currency, rates } = useStore();
  const { locale, dict } = usePreferences();

  const hasDiscount = product.oldPrice !== null && product.oldPrice > product.price;
  const discountPct = hasDiscount && product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const canShowPrice = showPrices && !product.hidePrice;
  const name = pick(locale, product.name, product.nameEn);
  const badge = pick(locale, product.badge ?? "", product.badgeEn);

  return (
    <article className="panel flex flex-col overflow-hidden transition hover:border-brand/60">
      <div className="relative flex h-36 items-center justify-center border-b border-line bg-surface-2">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={name}
            className="h-full w-full object-contain p-3"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <ProductIcon type={product.iconType} className="h-16 w-16 text-brand-strong" />
        )}
        {badge ? (
          <span className="absolute top-2 start-2">
            <Badge label={badge} tone={badgeTone(badge)} />
          </span>
        ) : null}
        {hasDiscount ? (
          <span className="absolute top-2 end-2">
            <Badge label={locale === "en" ? `Save ${discountPct}%` : `وفّر ${discountPct}%`} tone="gold" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[11px] font-bold text-brand-strong">{product.brand}</p>
        <h3 className="text-sm font-bold leading-6">
          <Link href={`/product/${product.id}`} className="hover:text-brand-strong">
            {name}
          </Link>
        </h3>
        <p className="mt-1 font-mono text-[11px] text-ink-muted" dir="ltr">
          {product.sku}
        </p>

        <div className="mt-3 flex-1" />

        {canShowPrice ? (
          <div className="mb-3 flex items-end gap-2">
            <span className="text-xl font-black text-ink">{formatMoney(product.price, currency, rates)}</span>
            {hasDiscount ? (
              <span className="text-sm font-semibold text-ink-muted line-through">
                {formatMoney(product.oldPrice as number, currency, rates)}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mb-3 text-sm font-bold text-gold">{dict.product.priceOnRequest}</p>
        )}

        <div className="flex gap-2">
          <button type="button" className="btn-primary flex-1 text-sm" onClick={() => addToCart(toCartLine(product))}>
            {dict.product.addToCart}
          </button>
          <Link href={`/product/${product.id}`} className="btn-ghost text-sm" aria-label={`${dict.cta.details} ${name}`}>
            {dict.cta.details}
          </Link>
        </div>
      </div>
    </article>
  );
}

"use client";

import { useState } from "react";
import { formatMoney, useStore } from "./store-provider";
import { usePreferences } from "./preferences-provider";
import type { Product } from "@/lib/types";
import { whatsappLink } from "@/lib/format";

export function AddToCart({ product, whatsappNumber }: { product: Product; whatsappNumber: string }) {
  const { addToCart, currency, rates, toast } = useStore();
  const { dict } = usePreferences();
  const [qty, setQty] = useState(1);

  const line = { productId: product.id, name: product.name, sku: product.sku, priceUsd: product.price };

  const message = [
    dict.product.whatsappGreeting,
    `• ${product.name}`,
    `• ${dict.product.whatsappSku}: ${product.sku}`,
    `• ${dict.product.whatsappQty}: ${qty}`,
    `• ${dict.product.whatsappPrice}: ${formatMoney(product.price * qty, currency, rates)}`,
  ].join("\n");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-bold text-ink-muted">
          {dict.product.quantity}
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn-ghost px-3 py-1 text-lg leading-none"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label={dict.cart.decreaseQty}
          >
            −
          </button>
          <input
            id="qty"
            type="number"
            min={1}
            max={999}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
            className="input-base w-20 text-center text-sm"
          />
          <button
            type="button"
            className="btn-ghost px-3 py-1 text-lg leading-none"
            onClick={() => setQty((q) => Math.min(999, q + 1))}
            aria-label={dict.cart.increaseQty}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary text-sm" onClick={() => addToCart(line, qty)}>
          🛒 {dict.product.addToCart}
        </button>
        <a
          href={whatsappLink(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-sm"
          onClick={() => toast(dict.product.whatsappOpening)}
        >
          💬 {dict.product.orderViaWhatsapp}
        </a>
      </div>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Currency } from "@/lib/types";

export interface CartLine {
  productId: string;
  name: string;
  sku: string;
  priceUsd: number;
  qty: number;
}

interface StoreContextValue {
  ready: boolean;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: { USD: number; YER: number; SAR: number };
  cart: CartLine[];
  cartCount: number;
  cartTotalUsd: number;
  addToCart: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toast: (message: string) => void;
  toastMessage: string | null;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "pronet_cart_v3";
const CURRENCY_KEY = "pronet_currency_v3";

function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l): l is CartLine => !!l && typeof l === "object" && typeof (l as CartLine).productId === "string")
      .map((l) => ({
        productId: String(l.productId),
        name: String(l.name ?? ""),
        sku: String(l.sku ?? ""),
        priceUsd: Number(l.priceUsd ?? 0),
        qty: Math.max(1, Math.floor(Number(l.qty ?? 1))),
      }));
  } catch {
    return [];
  }
}

export function StoreProvider({
  children,
  rateYER,
  rateSAR,
  defaultCurrency,
}: {
  children: React.ReactNode;
  rateYER: number;
  rateSAR: number;
  defaultCurrency: Currency;
}) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // القراءة من التخزين المحلي بعد التركيب فقط (لتجنّب اختلاف الترطيب)
  useEffect(() => {
    setCart(readCart());
    try {
      const stored = window.localStorage.getItem(CURRENCY_KEY);
      if (stored === "USD" || stored === "YER" || stored === "SAR") setCurrencyState(stored);
    } catch {
      /* تجاهل */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* تجاهل */
    }
  }, [cart, ready]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(CURRENCY_KEY, c);
    } catch {
      /* تجاهل */
    }
  }, []);

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const addToCart = useCallback(
    (line: Omit<CartLine, "qty">, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((l) => l.productId === line.productId);
        if (existing) {
          return prev.map((l) => (l.productId === line.productId ? { ...l, qty: l.qty + qty } : l));
        }
        return [...prev, { ...line, qty }];
      });
      toast(`تمت إضافة «${line.name}» إلى السلة ✅`);
    },
    [toast],
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, qty: Math.floor(qty) } : l)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<StoreContextValue>(() => {
    const cartCount = cart.reduce((s, l) => s + l.qty, 0);
    const cartTotalUsd = cart.reduce((s, l) => s + l.qty * l.priceUsd, 0);
    return {
      ready,
      currency,
      setCurrency,
      rates: { USD: 1, YER: rateYER, SAR: rateSAR },
      cart,
      cartCount,
      cartTotalUsd,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toast,
      toastMessage,
    };
  }, [ready, currency, setCurrency, rateYER, rateSAR, cart, addToCart, setQty, removeFromCart, clearCart, toast, toastMessage]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      {/* منطقة إشعارات حيّة لقارئات الشاشة */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {toastMessage ?? ""}
      </div>
      {toastMessage ? (
        <div className="no-print fixed bottom-5 start-5 z-50 max-w-xs rounded-2xl border-2 border-brand bg-surface px-4 py-3 text-sm font-bold text-ink shadow-2xl">
          {toastMessage}
        </div>
      ) : null}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** تنسيق السعر حسب العملة المختارة. */
export function formatMoney(valueUsd: number, currency: Currency, rates: { YER: number; SAR: number }): string {
  const n = Number.isFinite(valueUsd) ? valueUsd : 0;
  if (currency === "YER") return `${Math.round(n * rates.YER).toLocaleString("en-US")} ر.ي`;
  if (currency === "SAR") return `${(n * rates.SAR).toLocaleString("en-US", { maximumFractionDigits: 2 })} ر.س`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

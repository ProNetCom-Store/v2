"use client";

import Link from "next/link";
import { useState } from "react";
import { formatMoney, useStore } from "./store-provider";
import { usePreferences } from "./preferences-provider";
import { BankPaymentLogoSvg, CopyAccountButton, getBankVisualTheme } from "./bank-accounts-section";
import type { BankAccount } from "@/lib/types";

interface CreatedOrder {
  orderNo: string;
  totalUsd: number;
  itemsCount: number;
}

export function CartClient({ bankAccounts, whatsappNumber }: { bankAccounts: BankAccount[]; whatsappNumber: string }) {
  const { ready, cart, setQty, removeFromCart, clearCart, currency, rates, cartTotalUsd, cartCount } = useStore();
  const { dict, locale } = usePreferences();

  const CASH = "نقداً عند الاستلام"; // قيمة ثابتة تُخزَّن في الطلب
  const QUOTE = "عرض سعر رسمي للشركات والمناقصات";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState(CASH);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<CreatedOrder | null>(null);

  const paymentOptions = [
    {
      value: CASH,
      label: dict.cart.cashOnDelivery,
      sub: locale === "en" ? "Pay upon receiving in Aden" : "الدفع عند الاستلام داخل عدن",
      iconKey: CASH,
      bank: null as BankAccount | null,
    },
    ...bankAccounts.map((b) => {
      const value = `${b.bankName}${b.accounts[0] ? ` — ${b.accounts[0].number}` : ""}`;
      return {
        value,
        label: b.bankName,
        sub: b.accounts.map((a) => `${a.label}: ${a.number}`).join(" | "),
        iconKey: `${b.id} ${b.bankName}`,
        bank: b,
      };
    }),
    {
      value: QUOTE,
      label: locale === "en" ? "Official Corporate Quotation" : "عرض سعر رسمي للشركات والمناقصات",
      sub: locale === "en" ? "Proforma invoice & bank transfer" : "فاتورة عرض سعر رسمية مختومة",
      iconKey: QUOTE,
      bank: null as BankAccount | null,
    },
  ];

  const selectedOption = paymentOptions.find((o) => o.value === payment) || paymentOptions[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError(dict.cart.errEmpty);
      return;
    }
    if (name.trim().length < 2) {
      setError(dict.cart.errName);
      return;
    }
    if (phone.replace(/[^0-9]/g, "").length < 7) {
      setError(dict.cart.errPhone);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // أرسل المُعرّف والكمية فقط — الخادم يعيد حساب الأسعار من قاعدة البيانات
        body: JSON.stringify({
          type: "store",
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerAddress: address.trim() || null,
          paymentMethod: payment,
          notes: notes.trim() || null,
          currency,
          items: cart.map((l) => ({ productId: l.productId, qty: l.qty })),
        }),
      });

      const data = (await res.json()) as { ok?: boolean; order?: CreatedOrder; error?: string };
      if (!res.ok || !data.ok || !data.order) {
        setError(data.error || dict.cart.errorGeneric);
        return;
      }

      setDone(data.order);
      clearCart();
    } catch {
      setError(dict.cart.errConnection);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const summary = [
      `${dict.cart.successTitle} — ${done.orderNo}`,
      `${dict.cart.fullName}: ${name}`,
      `${dict.cart.phone}: ${phone}`,
      `${dict.cart.payment}: ${payment}`,
      `${dict.cart.itemsCount}: ${done.itemsCount}`,
      `${dict.cart.totalEstimated}: ${formatMoney(done.totalUsd, currency, rates)}`,
    ].join("\n");

    return (
      <div className="panel mx-auto max-w-2xl p-8 text-center">
        <span aria-hidden="true" className="text-5xl">
          ✅
        </span>
        <h2 className="mt-4 text-2xl font-black text-ink">{dict.cart.successTitle}</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {dict.cart.successBody} <span className="font-mono font-black text-brand-strong">{done.orderNo}</span>
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {dict.cart.successContactPrefix} <span dir="ltr">{phone}</span> {dict.cart.successContactSuffix}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(summary)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            💬 {dict.cart.confirmWhatsapp}
          </a>
          <Link href="/store" className="btn-ghost text-sm">
            {dict.cta.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <p className="panel p-6 text-center text-sm text-ink-muted" role="status">
        {dict.cart.loading}
      </p>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <span aria-hidden="true" className="text-5xl">
          🛒
        </span>
        <h2 className="mt-4 text-xl font-black text-ink">{dict.cart.empty}</h2>
        <p className="mt-2 text-sm text-ink-muted">{dict.cart.emptyHint}</p>
        <Link href="/store" className="btn-primary mt-5 inline-block text-sm">
          {dict.cart.goToStore}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-3 text-lg font-black text-ink">
          {dict.cart.itemsInCart}{" "}
          <span className="text-sm font-semibold text-ink-muted">
            ({cartCount} {dict.cart.pieces})
          </span>
        </h2>

        <ul className="space-y-3">
          {cart.map((line) => (
            <li key={line.productId} className="panel flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-6 text-ink">{line.name}</p>
                <p className="mt-1 font-mono text-xs text-ink-muted" dir="ltr">
                  {line.sku}
                </p>
                <p className="mt-1 text-sm font-black text-brand-strong">
                  {formatMoney(line.priceUsd, currency, rates)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="btn-ghost px-3 py-1 text-lg leading-none"
                  onClick={() => setQty(line.productId, line.qty - 1)}
                  aria-label={`${dict.cart.decreaseQty} ${line.name}`}
                >
                  −
                </button>
                <span className="w-12 text-center font-black text-ink" aria-label={`${dict.cart.qty} ${line.qty}`}>
                  {line.qty}
                </span>
                <button
                  type="button"
                  className="btn-ghost px-3 py-1 text-lg leading-none"
                  onClick={() => setQty(line.productId, line.qty + 1)}
                  aria-label={`${dict.cart.increaseQty} ${line.name}`}
                >
                  +
                </button>
              </div>

              <p className="w-28 text-end text-sm font-black text-ink">
                {formatMoney(line.priceUsd * line.qty, currency, rates)}
              </p>

              <button
                type="button"
                className="btn-ghost text-xs text-rose-500"
                onClick={() => removeFromCart(line.productId)}
                aria-label={`${dict.cart.removeItem} ${line.name}`}
              >
                🗑️ {dict.cart.remove}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={clearCart}
          className="mt-4 text-xs font-bold text-ink-muted underline hover:text-rose-500"
        >
          {dict.cart.emptyCartAll}
        </button>
      </div>

      <div className="space-y-4">
        <div className="panel p-5">
          <h2 className="text-lg font-black text-ink">{dict.cart.orderData}</h2>

          <div className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="custName" className="mb-1 block text-xs font-bold text-ink-muted">
                {dict.cart.fullName} <span className="text-rose-500">*</span>
              </label>
              <input
                id="custName"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base text-sm"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="custPhone" className="mb-1 block text-xs font-bold text-ink-muted">
                {dict.cart.phoneLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                id="custPhone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-base text-sm"
                inputMode="tel"
                dir="ltr"
                autoComplete="tel"
                placeholder="7XXXXXXXX"
              />
            </div>

            <div>
              <label htmlFor="custAddress" className="mb-1 block text-xs font-bold text-ink-muted">
                {dict.cart.addressLabel}
              </label>
              <input
                id="custAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-base text-sm"
                autoComplete="street-address"
              />
            </div>

            {/* اختيار وسيلة الدفع والبنك بتصميم عصري مع الشعارات */}
            <div>
              <label htmlFor="custPayment" className="mb-1.5 block text-xs font-bold text-ink-muted">
                {dict.cart.payment}
              </label>
              <select
                id="custPayment"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="sr-only"
              >
                {paymentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="space-y-2" role="radiogroup" aria-label={dict.cart.payment}>
                {paymentOptions.map((opt) => {
                  const active = payment === opt.value;
                  const theme = getBankVisualTheme(opt.iconKey);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPayment(opt.value)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-start transition-all ${
                        active
                          ? "bg-surface-2 shadow-md ring-2"
                          : "border-line bg-surface-2/50 hover:border-brand/40 hover:bg-surface-2"
                      }`}
                      style={{
                        borderColor: active ? theme.primary : undefined,
                      }}
                    >
                      <BankPaymentLogoSvg bankIdOrName={opt.iconKey} className="h-10 w-10 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-black text-ink sm:text-sm">{opt.label}</p>
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${
                              active
                                ? "border-brand bg-brand text-slate-950"
                                : "border-line bg-surface text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-ink-muted" dir="auto">
                          {opt.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* تفاصيل الحساب البنكي المختار مع زر نسخ مباشر */}
              {selectedOption?.bank ? (
                <div className="mt-2.5 rounded-xl border border-brand/40 bg-surface-2 p-3 text-xs">
                  <p className="mb-2 font-bold text-ink-soft">
                    {locale === "en" ? "Account holder:" : "باسم:"}{" "}
                    <span className="font-black text-ink">{selectedOption.bank.accountHolder}</span>
                  </p>
                  <div className="space-y-1.5">
                    {selectedOption.bank.accounts.map((acc) => (
                      <div
                        key={acc.number}
                        className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5"
                      >
                        <div>
                          <span className="block text-[10px] text-ink-muted">{acc.label}</span>
                          <span dir="ltr" className="font-mono text-sm font-black text-brand-strong">
                            {acc.number}
                          </span>
                        </div>
                        <CopyAccountButton accountNumber={acc.number} locale={locale} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="custNotes" className="mb-1 block text-xs font-bold text-ink-muted">
                {dict.cart.notesLabel}
              </label>
              <textarea
                id="custNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-base text-sm"
              />
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-black text-ink">{dict.cart.summary}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{dict.cart.itemsCountLabel}</dt>
              <dd className="font-bold text-ink">{cartCount}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <dt className="font-bold text-ink">{dict.cart.totalEstimated}</dt>
              <dd className="font-black text-brand-strong">{formatMoney(cartTotalUsd, currency, rates)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] leading-5 text-ink-muted">{dict.cart.totalNote}</p>

          {error ? (
            <p role="alert" className="mt-3 rounded-xl border border-rose-500/50 bg-rose-950/50 p-3 text-xs font-bold text-rose-200">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={busy} className="btn-primary mt-4 w-full text-sm">
            {busy ? dict.cart.submitting : dict.cart.submitToAdmin}
          </button>
        </div>
      </div>
    </form>
  );
}

import type { Currency } from "./types";

export function formatUsd(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrency(valueUsd: number, currency: Currency, rateYER: number, rateSAR: number): string {
  const n = Number.isFinite(valueUsd) ? valueUsd : 0;
  switch (currency) {
    case "YER":
      return `${Math.round(n * rateYER).toLocaleString("en-US")} ر.ي`;
    case "SAR":
      return `${(n * rateSAR).toLocaleString("en-US", { maximumFractionDigits: 2 })} ر.س`;
    default:
      return formatUsd(n);
  }
}

/** تنسيق تاريخ بصيغة يوم-شهر-سنة ميلادية. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z")) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z")) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** يبني رابط واتساب مع نص مُرمَّز. */
export function whatsappLink(phone: string, message: string): string {
  const clean = String(phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function truncate(text: string, max = 140): string {
  const t = String(text || "").trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + "…";
}

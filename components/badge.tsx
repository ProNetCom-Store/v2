import { badgeStyle } from "@/lib/types";
import { badgeTone } from "./product-icon";

/** شارة نصية بألوان مطابقة لمعايير الوصولية (WCAG AA). */
export function Badge({
  label,
  tone,
  className = "",
}: {
  label: string;
  tone?: string | null;
  className?: string;
}) {
  const color = tone ?? badgeTone(label);
  return (
    <span
      className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold leading-none ${badgeStyle(color)} ${className}`}
    >
      {label}
    </span>
  );
}

export function CategoryChip({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-muted">
      {label}
    </span>
  );
}

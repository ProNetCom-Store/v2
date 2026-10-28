import type { SVGProps } from "react";

export type IconType = "router" | "laptop" | "printer" | "camera" | "starlink" | "ups" | "storage" | "box";

const PATHS: Record<IconType, React.ReactNode> = {
  router: (
    <>
      <path d="M5 14h14v5H5z" />
      <path d="M8 14V9m8 5V9" />
      <path d="M6.5 6.5a5 5 0 0 1 11 0" />
      <path d="M9.5 9.2a2 2 0 0 1 5 0" />
      <circle cx="8.5" cy="16.5" r=".6" fill="currentColor" stroke="none" />
      <circle cx="11" cy="16.5" r=".6" fill="currentColor" stroke="none" />
    </>
  ),
  laptop: (
    <>
      <path d="M6 6h12v9H6z" />
      <path d="M3 18h18l-1.5-3H4.5z" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V4h10v5" />
      <path d="M5 9h14a2 2 0 0 1 2 2v5h-4v4H7v-4H3v-5a2 2 0 0 1 2-2z" />
      <path d="M7 14h10v6H7z" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3z" />
      <path d="M16 12l5-3v6z" />
      <circle cx="8" cy="12" r="2.2" />
    </>
  ),
  starlink: (
    <>
      <path d="M4 17h16" />
      <path d="M12 17V9" />
      <path d="M7 9a6 6 0 0 1 10 0" />
      <path d="M9.5 9a3.2 3.2 0 0 1 5 0" />
      <path d="M5 20h14" />
    </>
  ),
  ups: (
    <>
      <path d="M4 8h13l3 4v4H4z" />
      <path d="M8 8V5h5v3" />
      <path d="M11 11l-1.5 3h2L10 17l3.5-4h-2L13 11z" fill="currentColor" stroke="none" />
    </>
  ),
  storage: (
    <>
      <ellipse cx="12" cy="6.5" rx="7" ry="2.8" />
      <path d="M5 6.5v11c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-11" />
      <path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
    </>
  ),
  box: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </>
  ),
};

export function ProductIcon({
  type,
  className = "h-10 w-10",
  ...rest
}: { type?: string | null; className?: string } & SVGProps<SVGSVGElement>) {
  const key = (type && (type as IconType) in PATHS ? type : "box") as IconType;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[key]}
    </svg>
  );
}

/** ربط شارة النص بلون آمن للتباين (نص داكن على خلفية فاتحة). */
export function badgeTone(badge?: string | null): "cyan" | "gold" | "green" | "purple" | "slate" {
  const b = (badge ?? "").trim();
  if (b.includes("عرض") || b.includes("خصم")) return "gold";
  if (b.includes("حديث") || b.includes("جديد")) return "cyan";
  if (b.includes("محدودة")) return "purple";
  if (b.includes("متوفر")) return "green";
  return "slate";
}

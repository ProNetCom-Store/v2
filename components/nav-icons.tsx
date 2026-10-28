import type { SVGProps } from "react";

export type NavIconName =
  | "home"
  | "store"
  | "services"
  | "projects"
  | "posts"
  | "about"
  | "contact"
  | "cart"
  | "phone"
  | "whatsapp"
  | "menu"
  | "close";

type Props = SVGProps<SVGSVGElement> & { name: NavIconName };

/**
 * أيقونات خطية موحّدة (24×24) لأقسام الموقع — تُستخدم في التنقل الرئيسي
 * والقائمة المتنقلة، وتأخذ اللون من النص المحيط عبر currentColor.
 */
const MARKUP: Record<NavIconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.6 12 3.4l9 7.2" />
      <path d="M5.2 9.6V20a1 1 0 0 0 1 1h3.6v-6h4.4v6h3.6a1 1 0 0 0 1-1V9.6" />
    </>
  ),
  store: (
    <>
      <path d="M4.6 8h14.8l-.9 12.2a1.6 1.6 0 0 1-1.6 1.5H7.1a1.6 1.6 0 0 1-1.6-1.5z" />
      <path d="M9 8V6.2a3 3 0 0 1 6 0V8" />
    </>
  ),
  services: (
    <>
      <path d="M14.6 6.3a4.6 4.6 0 0 0 6 5.9l-6.2 6.2-3.6-3.6z" />
      <path d="M10.8 14.8 5.4 20.2a1.9 1.9 0 0 1-2.7-2.7l5.4-5.4" />
      <path d="M12.9 10.2 16 13.3" />
    </>
  ),
  projects: (
    <>
      <path d="M3.2 8.4h17.6v10.4a1.4 1.4 0 0 1-1.4 1.4H4.6a1.4 1.4 0 0 1-1.4-1.4z" />
      <path d="M8.8 8.4V6.6a1.4 1.4 0 0 1 1.4-1.4h3.6a1.4 1.4 0 0 1 1.4 1.4v1.8" />
      <path d="M3.2 13h17.6" />
    </>
  ),
  posts: (
    <>
      <path d="M5 4.2h11.6a1.4 1.4 0 0 1 1.4 1.4v13a1.4 1.4 0 0 1-1.4 1.4H6.4A1.4 1.4 0 0 1 5 18.6z" />
      <path d="M18 8.4h1.6a1.4 1.4 0 0 1 1.4 1.4v8.8a1.4 1.4 0 0 1-1.4 1.4" />
      <path d="M8.2 8.6h6.2M8.2 12.2h6.2M8.2 15.8h3.8" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.4" />
      <path d="M12 7.7h.01" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5.2" width="18" height="13.6" rx="2" />
      <path d="m3.6 6.6 8.4 6 8.4-6" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4.6h2.2l2.2 10.4a1.6 1.6 0 0 0 1.6 1.3h7.9a1.6 1.6 0 0 0 1.6-1.3l1.6-7.3H6.1" />
      <circle cx="9.6" cy="19.4" r="1.5" />
      <circle cx="16.8" cy="19.4" r="1.5" />
    </>
  ),
  phone: (
    <path d="M5.2 3.6h3.1l1.5 4-2 1.4a12.4 12.4 0 0 0 5.6 5.6l1.4-2 4 1.5v3.1a1.7 1.7 0 0 1-1.9 1.7A16.6 16.6 0 0 1 3.5 5.5a1.7 1.7 0 0 1 1.7-1.9z" />
  ),
  whatsapp: (
    <>
      <path d="M3.6 20.2 5 16.6a8.2 8.2 0 1 1 3 3z" />
      <path d="M9.1 9.4c.4 2.7 2.7 5 5.4 5.4l1-1.5 1.8.9v1.7c-3.9.6-8.4-3.9-7.8-7.8h1.7l.9 1.8z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" />,
};

export function NavIcon({ name, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {MARKUP[name]}
    </svg>
  );
}

import Link from "next/link";
import { pick, type Locale, type StoreSettings } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

export function SiteFooter({
  settings,
  locale,
  dict,
}: {
  settings: StoreSettings;
  locale: Locale;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();
  const brandName = pick(locale, settings.brandName, settings.brandNameEn);
  const slogan = pick(locale, settings.slogan, settings.sloganEn);
  const address = pick(locale, settings.address, settings.addressEn);
  const workingHours = pick(locale, settings.workingHours, settings.workingHoursEn);
  const ceoTitle = pick(locale, settings.ceoTitle, settings.ceoTitleEn);
  const footerNote = pick(locale, settings.footerNote, settings.footerNoteEn);

  const links = [
    { href: "/store", label: dict.nav.store },
    { href: "/services", label: dict.nav.services },
    { href: "/projects", label: dict.nav.projects },
    { href: "/posts", label: dict.nav.posts },
    { href: "/about", label: dict.nav.about },
    { href: "/contact", label: dict.nav.contact },
  ];

  const socials = Array.isArray(settings.socialLinks) ? settings.socialLinks : [];

  return (
    <footer className="no-print mt-16 border-t border-line bg-surface-3">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-black text-ink">{brandName}</p>
          <p className="mt-1 text-sm font-semibold text-brand-strong">{slogan}</p>
          <p className="mt-3 text-sm text-ink-soft">{address}</p>
          {footerNote ? <p className="mt-3 text-xs text-ink-muted">{footerNote}</p> : null}
          {socials.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.url + s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-xs font-bold text-ink-soft transition hover:text-brand"
                  >
                    <span aria-hidden="true">{s.icon || "🔗"}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label={dict.footer.quickLinks}>
          <h2 className="mb-3 text-sm font-black text-ink">{dict.footer.quickLinks}</h2>
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink-soft hover:text-brand-strong">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-sm font-black text-ink">{dict.footer.contactUs}</h2>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>
              {dict.footer.showroomPhone}:{" "}
              <a href={`tel:${settings.landline.replace(/[^0-9+]/g, "")}`} className="hover:text-brand-strong" dir="ltr">
                {settings.landline}
              </a>
            </li>
            <li>
              {dict.footer.email}:{" "}
              <a href={`mailto:${settings.email}`} className="hover:text-brand-strong" dir="ltr">
                {settings.email}
              </a>
            </li>
            <li>
              {dict.footer.whatsapp}:{" "}
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-500"
                dir="ltr"
              >
                {settings.whatsappNumber}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-black text-ink">{dict.contact.workingHours}</h2>
          <p className="text-sm text-ink-soft">{workingHours}</p>
          <p className="mt-4 text-sm text-ink-muted">
            {settings.ceoName}
            <br />
            {ceoTitle}
          </p>
          <Link
            href="/admin/login"
            className="mt-4 inline-block text-xs font-semibold text-ink-muted hover:text-brand-strong"
          >
            {dict.admin.adminEntry}
          </Link>
        </div>
      </div>

      <div className="border-t border-line px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-7xl text-center text-xs text-ink-muted">
          © {year} {brandName} — {locale === "en" ? dict.footer.rights : `جميع الحقوق محفوظة.`}
        </p>
      </div>
    </footer>
  );
}

import { getSettings, getSupportTickets } from "@/lib/queries";
import { getServerLocale } from "@/lib/server-locale";
import { pick } from "@/lib/types";

export default async function AboutPage() {
  const { locale, dict } = await getServerLocale();
  const settings = getSettings();
  const tickets = getSupportTickets();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-black text-ink">{dict.pages.aboutTitle}</h1>
        <p className="mt-3 text-base leading-8 text-ink-soft">
          {pick(locale, settings.heroSubtitle, settings.heroSubtitleEn)}
        </p>
      </header>

      <section className="panel mt-8 p-6">
        <h2 className="text-xl font-black text-ink">{dict.pages.aboutVisionTitle}</h2>
        <p className="mt-3 leading-8 text-ink-soft">{dict.pages.aboutVisionBody}</p>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-xl font-black text-ink">{dict.pages.aboutOfferTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-ink-soft">
            {dict.pages.aboutOffers.map((item) => (
              <li key={item}>▪ {item}</li>
            ))}
          </ul>
        </div>

        <div className="panel p-6">
          <h2 className="text-xl font-black text-ink">{dict.pages.aboutLeadershipTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-ink-soft">
            <span className="block font-black text-ink">{settings.ceoName}</span>
            <span className="block text-brand-strong">
              {pick(locale, settings.ceoTitle, settings.ceoTitleEn)}
            </span>
          </p>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-bold text-ink-muted">{dict.pages.aboutAddressLabel}:</dt>
              <dd className="text-ink-soft">{pick(locale, settings.address, settings.addressEn)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-bold text-ink-muted">{dict.pages.aboutPhoneLabel}:</dt>
              <dd dir="ltr" className="text-ink-soft">
                {settings.landline}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-bold text-ink-muted">{dict.pages.aboutEmailLabel}:</dt>
              <dd dir="ltr" className="text-ink-soft">
                {settings.email}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {tickets.length > 0 ? (
        <section className="panel mt-6 p-6">
          <h2 className="text-xl font-black text-ink">{dict.pages.aboutSupportTitle}</h2>
          <p className="mt-2 text-sm text-ink-muted">{dict.pages.aboutSupportBody}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {tickets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-ink-soft">{t.title}</span>
                <span className="text-xs text-ink-muted">
                  {t.client} — {t.status} — {t.engineer}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

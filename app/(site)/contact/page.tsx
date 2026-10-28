import Link from "next/link";
import { JsonLd, organizationSchema } from "@/components/json-ld";
import { BankAccountsSection } from "@/components/bank-accounts-section";
import { getBankAccounts, getSettings } from "@/lib/queries";
import { getServerLocale } from "@/lib/server-locale";
import { pick } from "@/lib/types";

export default async function ContactPage() {
  const { locale, dict } = await getServerLocale();
  const settings = getSettings();
  const banks = getBankAccounts();
  const siteUrl = process.env.PRONET_SITE_URL || "http://localhost:3000";

  const waLink = (phone: string, text: string) =>
    `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;

  const contacts = [
    {
      label: dict.pages.contactLandlineLabel,
      value: settings.landline,
      href: `tel:${settings.landline.replace(/[^0-9+]/g, "")}`,
      icon: "☎️",
    },
    { label: dict.pages.contactEmailLabel, value: settings.email, href: `mailto:${settings.email}`, icon: "✉️" },
    { label: dict.pages.contactAddressLabel, value: pick(locale, settings.address, settings.addressEn), href: null, icon: "📍" },
  ];

  const whatsappChannels = [
    { label: dict.pages.contactSalesLabel, value: settings.whatsappNumber },
    { label: dict.pages.contactSalesAltLabel, value: settings.secondarySalesWhatsapp },
    { label: dict.pages.contactMgmtLabel, value: settings.mgmtWhatsapp1 },
    { label: dict.pages.contactMgmtAltLabel, value: settings.mgmtWhatsapp2 },
  ].filter((c) => c.value);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <JsonLd
        data={organizationSchema({
          brandName: settings.brandName,
          slogan: settings.slogan,
          email: settings.email,
          landline: settings.landline,
          address: settings.address,
          logo: "/assets/ProNet_Logo.png",
          siteUrl,
        })}
      />

      <header>
        <h1 className="text-3xl font-black text-ink">{dict.pages.contactTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-muted">{dict.pages.contactIntro}</p>
      </header>

      {/* الحسابات البنكية المعتمدة ووسائل الدفع بشعاراتها وأيقوناتها الرسمية */}
      <BankAccountsSection
        banks={banks}
        title={dict.pages.banksTitle}
        intro={dict.pages.banksIntro}
        holderPrefix={dict.pages.bankHolderPrefix}
        cashNote={dict.pages.cashNote}
        locale={locale}
      />

      {/* بيانات التواصل وقنوات واتساب */}
      <section className="panel p-6 sm:p-8" aria-labelledby="contact-info">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 id="contact-info" className="text-xl font-black text-ink">
              {dict.pages.contactInfoTitle}
            </h2>
            <ul className="mt-5 space-y-4">
              {contacts.map((c) => (
                <li key={c.label} className="flex items-start gap-3.5 rounded-xl border border-line bg-surface-2 p-3.5">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-xl">
                    {c.icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-ink-muted">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="mt-0.5 block font-bold text-ink hover:text-brand-strong" dir="auto">
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 font-bold text-ink">{c.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-black text-ink">{dict.pages.contactChannelsTitle}</h3>
            <p className="mt-1 text-xs text-ink-muted">
              {locale === "en"
                ? "Direct WhatsApp lines for sales, technical inquiries, and sending transfer receipts."
                : "قنوات تواصل مباشرة عبر واتساب للمبيعات والاستشارات الفنية وإرسال إشعارات التحويل البنكي."}
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {whatsappChannels.map((c) => (
                <li key={c.label}>
                  <a
                    href={waLink(c.value, dict.pages.contactWhatsappMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost flex items-center justify-between gap-2 w-full text-xs font-extrabold py-3.5 px-4"
                  >
                    <span>💬 {c.label}</span>
                    <span dir="ltr" className="font-mono text-brand-strong">
                      {c.value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel brand-gradient flex flex-col items-center gap-4 p-8 text-center">
        <h2 className="text-2xl font-black text-[#062633]">{dict.pages.contactCtaTitle}</h2>
        <p className="max-w-2xl text-sm font-semibold leading-7 text-[#062633]">{dict.pages.contactCtaBody}</p>
        <Link href="/store" className="rounded-xl bg-[#062633] px-6 py-3 text-sm font-black text-[#ffffff]">
          {dict.pages.contactCtaBtn}
        </Link>
      </section>
    </div>
  );
}

import Link from "next/link";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
import { getProjects, getSettings } from "@/lib/queries";
import { getServerLocale } from "@/lib/server-locale";
import { pick } from "@/lib/types";

const CATEGORY_EN_MAP: Record<string, string> = {
  "مشاريع المنظمات الدولية والمؤسسات": "International NGOs & Development Institutions",
  "مشاريع الفنادق والمنشآت السياحية والضيافة": "Hotels, Resorts & Hospitality Projects",
  "مشاريع الطاقة والشركات والمصانع والملاحة": "Solar Energy, Industrial & Maritime Projects",
  "مشاريع الجامعات والمستشفيات والمطارات والمراكز التجارية": "Universities, Healthcare, Airports & Commercial Centers",
};

function parseProjectContent(rawDesc: string) {
  const parts = (rawDesc || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let summary = "";
  let tags: string[] = [];
  const details: string[] = [];

  for (const line of parts) {
    if (line.startsWith("TAGS:")) {
      tags = line
        .replace("TAGS:", "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      details.push(line.replace(/^[•\-*]\s*/, "").trim());
    } else if (!summary) {
      summary = line;
    } else {
      details.push(line);
    }
  }

  return { summary, tags, details };
}

export default async function ProjectsPage() {
  const { locale, dict } = await getServerLocale();
  const settings = getSettings();
  const projects = getProjects();
  const siteUrl = process.env.PRONET_SITE_URL || "http://localhost:3000";

  const grouped = new Map<string, typeof projects>();
  for (const p of projects) {
    const key = p.category || dict.pages.projectsGeneral;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }

  const moreLabel = locale === "en" ? "More project details" : "المزيد عن المشروع";
  const coverageBanner =
    locale === "en"
      ? "In addition to numerous technical projects, network deployments, and security installations executed across Aden, Lahj, Al-Dhalea, and Taiz (City & Al-Turbah)."
      : "بالإضافة إلى العديد من الأعمال والمشاريع التقنية والهندسية المتفرقة التي قمنا بتنفيذها في مدينة عدن، لحج، مدينة الضالع، وتعز (المدينة ومدينة التربة).";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={breadcrumbSchema([
          { name: dict.nav.home, url: siteUrl },
          { name: dict.pages.projectsTitle, url: `${siteUrl}/projects` },
        ])}
      />

      <header>
        <h1 className="text-3xl font-black text-ink">{dict.pages.projectsTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-muted">{dict.pages.projectsIntro}</p>
      </header>

      <div className="mt-8 space-y-12">
        {[...grouped.entries()].map(([category, items]) => {
          const displayCategory =
            locale === "en" ? CATEGORY_EN_MAP[category] || category : category;

          return (
            <section key={category} aria-labelledby={`cat-${category}`}>
              <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
                <h2 id={`cat-${category}`} className="text-xl font-black text-brand-strong">
                  {displayCategory}
                </h2>
                <span className="rounded-full border border-brand/40 bg-brand/15 px-3 py-0.5 text-xs font-black text-brand-strong">
                  {items.length} {locale === "en" ? "Projects" : "مشاريع"}
                </span>
              </div>

              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => {
                  const rawText = pick(locale, p.desc, p.descEn);
                  const { summary, tags, details } = parseProjectContent(rawText);

                  return (
                    <li
                      key={p.id}
                      className="panel flex flex-col justify-between p-6 transition hover:border-brand/60"
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-2 text-xs font-bold text-ink-muted">
                          <span>📍 {p.location}</span>
                          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-extrabold text-emerald-400">
                            {locale === "en" ? "Completed ✓" : "منفّذ ✓"}
                          </span>
                        </div>

                        <h3 className="text-base font-black leading-6 text-ink">
                          {pick(locale, p.title, p.titleEn)}
                        </h3>

                        <p className="mt-2.5 text-sm leading-7 text-ink-soft">{summary}</p>

                        {tags.length > 0 ? (
                          <div className="mt-3.5 flex flex-wrap gap-1.5" dir="ltr">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md border border-brand/30 bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-brand-strong"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {details.length > 0 ? (
                        <details className="group mt-4 border-t border-line pt-3">
                          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-black text-brand-strong hover:underline">
                            <span className="inline-flex items-center gap-1.5">
                              <span>➕</span>
                              <span>{moreLabel}</span>
                            </span>
                            <span className="transition-transform duration-200 group-open:rotate-180">
                              ▾
                            </span>
                          </summary>
                          <ul className="mt-3 space-y-2 border-t border-line/60 pt-3 text-xs leading-6 text-ink-soft">
                            {details.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="font-black text-brand-strong">▪</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="panel mt-10 border-brand/40 bg-surface-2 p-5 text-center text-sm font-bold leading-7 text-ink-soft">
        🌍 {coverageBanner}
      </div>

      <section className="panel mt-10 p-8 text-center">
        <h2 className="text-2xl font-black text-ink">{dict.pages.projectsCtaTitle}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-ink-soft">
          {dict.pages.projectsCtaBody}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-primary text-sm">
            {dict.pages.projectsCtaBtn}
          </Link>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(dict.pages.projectsWhatsappMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-sm"
          >
            💬 {dict.pages.whatsapp}
          </a>
        </div>
      </section>
    </div>
  );
}

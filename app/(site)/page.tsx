import Link from "next/link";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";
import { BrandsBar } from "@/components/brands-bar";
import { JsonLd, organizationSchema } from "@/components/json-ld";
import {
  getBrandList,
  getBrandProductCounts,
  getBusinessAreas,
  getPosts,
  getProducts,
  getProjects,
  getSettings,
  getSlides,
  countProducts,
} from "@/lib/queries";
import { getServerLocale } from "@/lib/server-locale";
import { pick } from "@/lib/types";
import { truncate } from "@/lib/format";

export default async function HomePage() {
  const { locale, dict } = await getServerLocale();
  const settings = getSettings();
  const slides = getSlides();
  const featured = getProducts({ featuredOnly: true, limit: 8 });
  const areas = getBusinessAreas();
  const projects = getProjects().slice(0, 3);
  const posts = getPosts().slice(0, 3);
  const brands = getBrandList();
  const brandCounts = getBrandProductCounts();
  const total = countProducts();

  const siteUrl = process.env.PRONET_SITE_URL || "http://localhost:3000";

  const trust = [
    { icon: "🛡️", title: dict.home.trustWarrantyTitle, desc: dict.home.trustWarrantyDesc },
    { icon: "🚚", title: dict.home.trustDeliveryTitle, desc: dict.home.trustDeliveryDesc },
    { icon: "📦", title: dict.home.trustShippingTitle, desc: dict.home.trustShippingDesc },
    { icon: "🧰", title: dict.home.trustSupportTitle, desc: dict.home.trustSupportDesc },
  ];

  const brandBarTitle =
    pick(locale, settings.brandBarTitle, settings.brandBarTitleEn) || dict.home.brandsHeadingFallback;
  const brandBarSubtitle =
    pick(locale, settings.brandBarSubtitle, settings.brandBarSubtitleEn) || dict.home.brandsSubFallback;

  const identityTitle =
    pick(locale, settings.identityTitle, settings.identityTitleEn) || dict.home.identityHeadingFallback;
  const identityText = pick(locale, settings.identityText, settings.identityTextEn);
  const visionTitle = pick(locale, settings.visionTitle, settings.visionTitleEn) || dict.home.visionHeadingFallback;
  const visionText = pick(locale, settings.visionText, settings.visionTextEn);

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-8 sm:px-6">
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

      <HeroCarousel slides={slides} />

      <section aria-label={locale === "en" ? "Why ProNet Computer" : "لماذا برونت كمبيوتر"}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trust.map((t) => (
            <li key={t.title} className="panel flex flex-col items-center gap-1 p-4 text-center">
              <span aria-hidden="true" className="text-2xl">
                {t.icon}
              </span>
              <p className="text-sm font-black text-ink">{t.title}</p>
              <p className="text-xs text-ink-muted">{t.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* شريط الماركات والوكلاء المعتمدين — مكان بارز بعد شرائح الثقة */}
      <BrandsBar
        brands={brands}
        title={brandBarTitle}
        subtitle={brandBarSubtitle}
        locale={locale}
        officialAgentLabel={dict.home.officialAgent}
        productCounts={brandCounts}
      />

      <section aria-labelledby="featured-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="featured-heading" className="text-2xl font-black text-ink">
              {dict.home.featuredHeading}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {total} {dict.home.productsAvailable}
            </p>
          </div>
          <Link href="/store" className="btn-ghost text-sm">
            {dict.home.allStore}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} showPrices={settings.showPricesGlobal} />
          ))}
        </div>
      </section>

      <section aria-labelledby="areas-heading">
        <h2 id="areas-heading" className="mb-5 text-2xl font-black text-ink">
          {dict.home.areasHeading}
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((a) => (
            <li key={a.id} className="panel p-5">
              <span aria-hidden="true" className="text-3xl">
                {a.icon}
              </span>
              <h3 className="mt-3 text-base font-black text-ink">{pick(locale, a.title, a.titleEn)}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{pick(locale, a.desc, a.descEn)}</p>
              {a.categoryFilter ? (
                <Link
                  href={`/store?category=${encodeURIComponent(a.categoryFilter)}`}
                  className="mt-3 inline-block text-sm font-bold text-brand-strong hover:underline"
                >
                  {dict.home.browseSection} ←
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {identityText || visionText ? (
        <section aria-label={locale === "en" ? "Identity and leadership" : "الهوية والريادة"} className="grid gap-4 md:grid-cols-2">
          {identityText ? (
            <article className="panel p-6">
              <h2 className="text-xl font-black text-ink">{identityTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{identityText}</p>
            </article>
          ) : null}
          {visionText ? (
            <article className="panel p-6">
              <h2 className="text-xl font-black text-ink">{visionTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{visionText}</p>
            </article>
          ) : null}
        </section>
      ) : null}

      <section aria-labelledby="projects-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 id="projects-heading" className="text-2xl font-black text-ink">
            {dict.home.completedProjects}
          </h2>
          <Link href="/projects" className="btn-ghost text-sm">
            {dict.nav.projects}
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {projects.map((p) => {
            const rawDesc = pick(locale, p.desc, p.descEn);
            const firstLine = (rawDesc || "").split(/\r?\n/)[0] || "";
            return (
              <li key={p.id} className="panel flex flex-col justify-between p-5">
                <div>
                  <p className="text-xs font-bold text-brand-strong">📍 {p.location}</p>
                  <h3 className="mt-2 text-base font-black leading-6 text-ink">{pick(locale, p.title, p.titleEn)}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{firstLine}</p>
                </div>
                <Link href="/projects" className="mt-4 inline-block text-xs font-black text-brand-strong hover:underline">
                  {locale === "en" ? "More project details ←" : "المزيد عن المشروع ←"}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="posts-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 id="posts-heading" className="text-2xl font-black text-ink">
            {dict.home.postsHeading}
          </h2>
          <Link href="/posts" className="btn-ghost text-sm">
            {dict.home.allPosts}
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id} className="panel flex flex-col p-5">
              <p className="text-xs font-bold text-gold">{pick(locale, post.tag, post.tagEn)}</p>
              <h3 className="mt-2 text-base font-black leading-6 text-ink">
                <Link href={`/posts/${post.id}`} className="hover:text-brand-strong">
                  {pick(locale, post.title, post.titleEn)}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">
                {truncate(pick(locale, post.excerpt || post.content, post.excerptEn || post.contentEn), 120)}
              </p>
              <p className="mt-3 text-xs text-ink-muted">{post.date}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel brand-gradient flex flex-col items-center gap-4 p-8 text-center">
        <h2 className="text-2xl font-black text-[#062633]">{dict.home.ctaTitle}</h2>
        <p className="max-w-2xl text-sm font-semibold leading-7 text-[#062633]">{dict.home.ctaBody}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(dict.home.whatsappQuoteMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#062633] px-5 py-3 text-sm font-black text-[#ffffff]"
          >
            💬 {dict.home.ctaWhatsapp}
          </a>
          <Link
            href="/contact"
            className="rounded-xl border-2 border-[#062633] px-5 py-3 text-sm font-black text-[#062633]"
          >
            {dict.home.ctaPayment}
          </Link>
        </div>
      </section>
    </div>
  );
}

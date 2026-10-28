"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePreferences } from "./preferences-provider";
import { pick, type Slide } from "@/lib/types";

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const { locale, dict } = usePreferences();
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => window.clearInterval(timer);
  }, [count]);

  if (count === 0) return null;
  const slide = slides[Math.min(index, count - 1)];

  const title = pick(locale, slide.title, slide.titleEn);
  const subtitle = pick(locale, slide.subtitle, slide.subtitleEn);
  const badge = pick(locale, slide.badge, slide.badgeEn);
  const ctaLabel = pick(locale, slide.ctaLabel, slide.ctaLabelEn) || dict.cta.shopNow;
  const ctaHref = slide.ctaHref || "/store";

  return (
    <section
      aria-label={locale === "en" ? "Featured offers" : "أبرز العروض"}
      className="relative overflow-hidden rounded-3xl border border-line"
    >
      <div className="relative h-[380px] sm:h-[440px]">
        {slides.map((s, i) => (
          <Image
            key={s.id}
            src={s.image}
            alt={i === index ? s.imageAlt || title : ""}
            fill
            sizes="100vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {/* تعتيم دائم فوق الصورة ليبقى النص الفاتح مقروءًا في الوضعين */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#0d1b2a]/95 via-[#0d1b2a]/85 to-[#0d1b2a]/60" />

        <div className="relative flex h-full flex-col justify-center gap-4 p-6 sm:p-12">
          {badge ? (
            <p className="inline-block w-fit rounded-full border border-[#38b6ff]/60 bg-[#0d1b2a]/80 px-4 py-1.5 text-xs font-bold text-[#8fd6ff]">
              {badge}
            </p>
          ) : null}
          <h1 className="max-w-3xl text-3xl font-black leading-tight text-[#ffffff] sm:text-5xl">{title}</h1>
          {subtitle ? (
            <p className="max-w-2xl text-sm leading-7 text-[#dfe7f2] sm:text-base">{subtitle}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href={ctaHref} className="btn-primary text-sm sm:text-base">
              {ctaLabel} 🛒
            </Link>
            <Link
              href="/services"
              className="rounded-xl border border-[#ffffff]/40 bg-[#ffffff]/10 px-5 py-2.5 text-sm font-bold text-[#ffffff] transition hover:bg-[#ffffff]/20 sm:text-base"
            >
              {dict.nav.services}
            </Link>
          </div>
        </div>
      </div>

      {count > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={
                locale === "en" ? `Show slide ${i + 1} of ${count}` : `عرض الشريحة ${i + 1} من ${count}`
              }
              aria-current={i === index}
              // هدف لمس 36×36 يفي بالحد الأدنى للوصولية (24×24) رغم صغر النقطة الظاهرة
              className="flex h-9 w-9 items-center justify-center rounded-full"
            >
              <span
                aria-hidden="true"
                className={`h-3 w-3 rounded-full border-2 transition ${
                  i === index ? "border-[#ffffff] bg-[#38b6ff]" : "border-[#cbd5e1] bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

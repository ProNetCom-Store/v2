import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, articleSchema, breadcrumbSchema } from "@/components/json-ld";
import { getPost, getPosts, getSettings } from "@/lib/queries";
import { truncate } from "@/lib/format";
import { getServerLocale } from "@/lib/server-locale";
import { pick } from "@/lib/types";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const { locale } = await getServerLocale();
  const post = getPost(id);
  if (!post) return {};

  const title = pick(locale, post.title, post.titleEn);
  const content = pick(locale, post.content, post.contentEn);
  return {
    openGraph: {
      type: "article",
      title,
      description: truncate(content, 200),
      publishedTime: post.date || undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { id } = await params;
  const { locale, dict } = await getServerLocale();
  const post = getPost(id);
  if (!post) notFound();

  const settings = getSettings();
  const siteUrl = process.env.PRONET_SITE_URL || "http://localhost:3000";
  const others = getPosts().filter((p) => p.id !== post.id).slice(0, 3);

  const title = pick(locale, post.title, post.titleEn);
  const content = pick(locale, post.content, post.contentEn);
  const tag = pick(locale, post.tag, post.tagEn);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={articleSchema({
          title,
          description: truncate(content, 200),
          datePublished: post.date,
          url: `${siteUrl}/posts/${post.id}`,
          publisherName: settings.brandName,
          publisherLogo: "/assets/ProNet_Logo.png",
          siteUrl,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: dict.nav.home, url: siteUrl },
          { name: dict.pages.postsTitle, url: `${siteUrl}/posts` },
          { name: title, url: `${siteUrl}/posts/${post.id}` },
        ])}
      />

      <nav aria-label={dict.product.breadcrumbAria} className="mb-5 text-xs text-ink-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-brand-strong">
              {dict.nav.home}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/posts" className="hover:text-brand-strong">
              {dict.pages.postsTitle}
            </Link>
          </li>
        </ol>
      </nav>

      <article>
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-pronet-gold/50 bg-pronet-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">
              {tag}
            </span>
            <time className="text-xs text-ink-muted">{post.date}</time>
          </div>
          <h1 className="mt-4 text-3xl font-black leading-11 text-ink">{title}</h1>
        </header>

        <div className="rich-text mt-6 space-y-4 text-base leading-8 text-ink-soft">
          {content
            .split(/\n{2,}/)
            .filter((para) => para.trim().length > 0)
            .map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
        </div>
      </article>

      <div className="panel mt-8 flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm font-bold text-ink">{dict.pages.postHelpTitle}</p>
        <a
          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`${dict.pages.postAskPrefix} ${title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm"
        >
          💬 {dict.pages.postAskTeam}
        </a>
      </div>

      {others.length > 0 ? (
        <section className="mt-12" aria-labelledby="more-posts">
          <h2 id="more-posts" className="mb-4 text-xl font-black text-ink">
            {dict.pages.postMorePosts}
          </h2>
          <ul className="space-y-3">
            {others.map((p) => (
              <li key={p.id}>
                <Link href={`/posts/${p.id}`} className="panel block p-4 hover:border-brand/60">
                  <p className="text-sm font-bold leading-6 text-ink">{pick(locale, p.title, p.titleEn)}</p>
                  <p className="mt-1 text-xs text-ink-muted">{p.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

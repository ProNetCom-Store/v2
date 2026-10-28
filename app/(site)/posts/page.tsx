import Link from "next/link";
import { getPosts } from "@/lib/queries";
import { truncate } from "@/lib/format";
import { getServerLocale } from "@/lib/server-locale";
import { pick } from "@/lib/types";

export default async function PostsPage() {
  const { locale, dict } = await getServerLocale();
  const posts = getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-black text-ink">{dict.pages.postsTitle}</h1>
        <p className="mt-3 text-sm leading-7 text-ink-muted">{dict.pages.postsIntro}</p>
      </header>

      {posts.length === 0 ? (
        <p className="panel mt-8 p-8 text-center text-sm text-ink-muted">{dict.pages.postsEmpty}</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="panel p-6 transition hover:border-brand/60">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg border border-pronet-gold/50 bg-pronet-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">
                    {pick(locale, post.tag, post.tagEn)}
                  </span>
                  <time className="text-xs text-ink-muted">{post.date}</time>
                </div>
                <h2 className="mt-3 text-xl font-black leading-8 text-ink">
                  <Link href={`/posts/${post.id}`} className="hover:text-brand-strong">
                    {pick(locale, post.title, post.titleEn)}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-7 text-ink-soft">
                  {truncate(pick(locale, post.excerpt, post.excerptEn) || post.content, 220)}
                </p>
                <Link
                  href={`/posts/${post.id}`}
                  className="mt-4 inline-block text-sm font-bold text-brand-strong hover:underline"
                >
                  {dict.pages.readFull} ←
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

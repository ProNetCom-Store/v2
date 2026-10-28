import { getDictionary } from "@/lib/i18n";
import { truncate } from "@/lib/format";
import { getPost, getProduct, getSettings } from "@/lib/queries";
import { pick, type Locale } from "@/lib/types";

export type PageMeta = {
  title: string;
  description: string;
  canonical: string;
};

/**
 * يبني عنوان الصفحة ووصفها (SEO) بناءً على المسار الحالي واللغة.
 *
 * السبب في هذا المسار غير المعتاد: في Next 15 تخرج وسوم metadata من
 * `generateMetadata` داخل `<body>` عند العرض الديناميكي (المتجر/المدونة
 * يتغيّران من اللوحة)، فتتجاههاها محرّكات البحث. لذلك نحقن `<title>`
 * و`<meta name="description">` يدويًا داخل `<head>` من الـ layout الجذري
 * عبر ترويسة `x-pathname` التي يضبطها middleware.
 */
export function metaFor(pathname: string, locale: Locale): PageMeta {
  const settings = getSettings();
  const meta = getDictionary(locale).meta;
  const brand = pick(locale, settings.brandName, settings.brandNameEn) || settings.brandName;
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const sep = " | ";
  const notFound = { title: `${meta.home}${sep}${brand}`, description: meta.homeDesc, canonical: "/" };

  if (path === "/") {
    return { title: `${brand}${sep}${meta.home}`, description: meta.homeDesc, canonical: "/" };
  }

  const staticPages: Record<string, { title: string; desc: string }> = {
    "/store": { title: meta.store, desc: meta.storeDesc },
    "/services": { title: meta.services, desc: meta.servicesDesc },
    "/projects": { title: meta.projects, desc: meta.projectsDesc },
    "/posts": { title: meta.posts, desc: meta.postsDesc },
    "/about": { title: meta.about, desc: meta.aboutDesc },
    "/contact": { title: meta.contact, desc: meta.contactDesc },
    "/cart": { title: meta.cart, desc: meta.cartDesc },
  };
  const staticPage = staticPages[path];
  if (staticPage) {
    return {
      title: `${staticPage.title}${sep}${brand}`,
      description: staticPage.desc,
      canonical: path,
    };
  }

  const postMatch = path.match(/^\/posts\/(.+)$/);
  if (postMatch) {
    const post = getPost(decodeURIComponent(postMatch[1]));
    if (post) {
      const title = pick(locale, post.title, post.titleEn);
      const body = pick(locale, post.content, post.contentEn);
      const excerpt = pick(locale, post.excerpt, post.excerptEn);
      return {
        title: `${title}${sep}${brand}`,
        description: truncate(excerpt || body || meta.postsDesc, 300),
        canonical: path,
      };
    }
    return { title: `${meta.posts}${sep}${brand}`, description: meta.postsDesc, canonical: "/posts" };
  }

  const productMatch = path.match(/^\/product\/(.+)$/);
  if (productMatch) {
    const product = getProduct(decodeURIComponent(productMatch[1]));
    if (product) {
      const name = pick(locale, product.name, product.nameEn);
      const description = pick(locale, product.description, product.descriptionEn);
      return {
        title: `${name} — ${product.brand}${sep}${brand}`,
        description: truncate(description || product.specs.join(" | ") || meta.product, 300),
        canonical: path,
      };
    }
    return { title: `${meta.store}${sep}${brand}`, description: meta.storeDesc, canonical: "/store" };
  }

  if (path.startsWith("/admin")) {
    return { title: `${meta.admin}${sep}${brand}`, description: meta.admin, canonical: "" };
  }

  return notFound;
}

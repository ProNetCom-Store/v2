/**
 * بيانات منظمة (JSON-LD) — لم تكن موجودة إطلاقًا في المشروع القديم.
 * تساعد محركات البحث على فهم المتجر والمنتجات.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // المحتوى مُولَّد داخليًا من قاعدة البيانات ولا يحتوي مدخلات مستخدم
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationSchema(settings: {
  brandName: string;
  slogan: string;
  email: string;
  landline: string;
  address: string;
  logo: string;
  siteUrl: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: settings.brandName,
    description: settings.slogan,
    image: `${settings.siteUrl}${settings.logo}`,
    logo: `${settings.siteUrl}${settings.logo}`,
    url: settings.siteUrl,
    email: settings.email,
    telephone: settings.landline,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "عدن",
      addressCountry: "YE",
    },
    areaServed: { "@type": "Country", name: "اليمن" },
    currenciesAccepted: "USD, YER, SAR",
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  datePublished: string;
  url: string;
  publisherName: string;
  publisherLogo: string;
  siteUrl: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
    author: { "@type": "Organization", name: article.publisherName },
    publisher: {
      "@type": "Organization",
      name: article.publisherName,
      logo: { "@type": "ImageObject", url: `${article.siteUrl}${article.publisherLogo}` },
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productSchema(product: {
  name: string;
  sku: string;
  brand: string;
  description: string;
  imageUrl: string | null;
  price: number;
  inStock: boolean;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: product.url,
    },
  };
}

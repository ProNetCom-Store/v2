import type { MetadataRoute } from "next";

const SITE_URL = process.env.PRONET_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // لوحة التحكم والسلة وواجهات API لا تُفهرس أبدًا
        disallow: ["/admin", "/admin/", "/cart", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

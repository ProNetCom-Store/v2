import type { NextConfig } from "next";

/**
 * ترويسات أمنية مطبّقة على كل الردود.
 * ملاحظة: script-src يسمح بـ 'unsafe-inline' لأن Next.js يضمّن بيانات التهيئة داخل HTML.
 * لا نعرض أي HTML قادم من المستخدم (نعرض نصًّا فقط وReact يهرّبه)، لذا الخطورة محدودة.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "font-src 'self' data:",
      "connect-src 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // node:sqlite مدمج في Node ويُستخدم في طبقة البيانات — نبقيه خارج الحزمة
  serverExternalPackages: ["node:sqlite"],
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  experimental: {
    // رفع الحد الأقصى لحجم الطلبات في إجراءات الخادم للسماح برفع الملفات والنسخ الاحتياطية
    serverActions: { bodySizeLimit: "64mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

import { NextRequest, NextResponse } from "next/server";

/**
 * يمرّر مسار الطلب الحالي إلى الـ layout الجذري عبر ترويسة `x-pathname`
 * حتى يتمكّن من إخراج عنوان ووصف الصفحة داخل `<head>` (SEO).
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)"],
};

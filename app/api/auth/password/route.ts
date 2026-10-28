import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  changeOwnPassword,
  createSessionToken,
  getCurrentUser,
  updateOwnProfile,
} from "@/lib/auth";
import { audit } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "الجلسة منتهية. يرجى تسجيل الدخول مجددًا." }, { status: 401 });
  }

  const limit = rateLimit(`password:${clientKey(request.headers)}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "محاولات كثيرة. حاول لاحقًا." }, { status: 429 });
  }

  let body: {
    action?: string;
    currentPassword?: string;
    newPassword?: string;
    displayName?: string;
    username?: string;
    phone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  if (body.action === "profile") {
    const res = updateOwnProfile(user.id, {
      displayName: String(body.displayName ?? ""),
      username: String(body.username ?? ""),
      phone: String(body.phone ?? ""),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, user: res.user });
  }

  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const result = changeOwnPassword(user.id, currentPassword, newPassword);
  if (!result.ok) {
    audit(user.id, "password_change_failed", null);
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  audit(user.id, "password_change_success", null);

  // تغيير كلمة المرور يُنهي كل الجلسات — ننشئ جلسة جديدة للمستخدم الحالي
  const { token, expiresAt } = createSessionToken(user.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return response;
}

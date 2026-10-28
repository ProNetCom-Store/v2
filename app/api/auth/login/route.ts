import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken, verifyCredentials } from "@/lib/auth";
import { audit } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_MAX_AGE = 8 * 60 * 60; // 8 ساعات

export async function POST(request: Request) {
  // حماية من هجمات تجريب كلمات المرور
  const limit = rateLimit(`login:${clientKey(request.headers)}`, 6, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: `محاولات دخول كثيرة. يرجى المحاولة بعد ${limit.retryAfterSeconds} ثانية.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let username = "";
  let password = "";
  try {
    const body = (await request.json()) as { username?: unknown; password?: unknown };
    username = typeof body.username === "string" ? body.username.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "يرجى إدخال اسم المستخدم وكلمة المرور." }, { status: 400 });
  }

  // لا يوجد أي مسار دخول بدون كلمة مرور — خلافًا للإصدار القديم.
  const user = verifyCredentials(username, password);
  if (!user) {
    audit(null, "login_failed", { username });
    return NextResponse.json({ ok: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة." }, { status: 401 });
  }

  const { token, expiresAt } = createSessionToken(user.id);
  audit(user.id, "login_success", { username: user.username });

  const response = NextResponse.json({
    ok: true,
    user: { username: user.username, displayName: user.displayName, roleKey: user.roleKey },
    mustChangePassword: user.mustChangePassword,
  });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

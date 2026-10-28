import { NextResponse } from "next/server";
import { requestPasswordResetOtp, verifyOtpAndResetPassword } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = rateLimit(`forgot:${clientKey(request.headers)}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: `محاولات كثيرة. حاول مجددًا بعد ${limit.retryAfterSeconds} ثانية.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: {
    action?: string;
    identifier?: string;
    phone?: string;
    code?: string;
    newPassword?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const action = String(body.action ?? "request");
  const identifier = String(body.identifier ?? "").trim();
  const phone = body.phone ? String(body.phone).trim() : undefined;

  if (!identifier && !phone) {
    return NextResponse.json(
      { ok: false, error: "يرجى إدخال اسم المستخدم أو رقم الهاتف المرتبط بالحساب." },
      { status: 400 },
    );
  }

  if (action === "request") {
    const res = await requestPasswordResetOtp(identifier || phone || "", phone);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    }
    return NextResponse.json(res);
  }

  if (action === "reset") {
    const code = String(body.code ?? "").trim();
    const newPassword = String(body.newPassword ?? "");
    const res = await verifyOtpAndResetPassword(identifier || phone || "", code, newPassword, phone);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, username: res.username });
  }

  return NextResponse.json({ ok: false, error: "عملية غير معروفة." }, { status: 400 });
}

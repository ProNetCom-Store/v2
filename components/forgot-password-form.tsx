"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OtpResponse {
  ok: true;
  username: string;
  displayName: string;
  maskedPhone: string;
  phoneDigits: string;
  expiresInMinutes: number;
  deliveryChannel: "sms_gateway" | "instant_verification";
  verificationCodePreview?: string;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInfo, setOtpInfo] = useState<OtpResponse | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() && !phoneInput.trim()) {
      setError("يرجى إدخال اسم المستخدم أو رقم الهاتف المرتبط بالحساب.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "request",
          identifier: identifier.trim(),
          phone: phoneInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "تعذّر إرسال كود التحقق.");
        return;
      }
      setOtpInfo(data as OtpResponse);
      setStep(2);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setError("يرجى إدخال كود التحقق المكوّن من 6 أرقام.");
      return;
    }
    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن لا تقل عن 6 خانات.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          identifier: otpInfo?.username || identifier.trim(),
          phone: phoneInput.trim() || undefined,
          code: code.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "فشل التحقق من الكود.");
        return;
      }
      setStep(3);
      setTimeout(() => {
        router.replace("/admin/login");
      }, 2200);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
  }

  if (step === 3) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl">
          ✅
        </div>
        <h2 className="text-lg font-black text-ink">تم استعادة وتحديث كلمة المرور بنجاح!</h2>
        <p className="text-xs text-ink-muted">
          يمكنك الآن تسجيل الدخول إلى حسابك (<span className="font-mono font-bold text-ink">{otpInfo?.username}</span>) بكلمة المرور الجديدة.
        </p>
        <Link href="/admin/login" className="btn-primary block w-full py-3 text-center text-sm">
          الانتقال لصفحة تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label htmlFor="fp-identifier" className="mb-1 block text-xs font-bold text-ink-muted">
              اسم المستخدم (اختياري إذا أدخلت رقم الهاتف)
            </label>
            <input
              id="fp-identifier"
              type="text"
              dir="ltr"
              placeholder="designer / management / sales / support"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input-base text-sm"
            />
          </div>

          <div>
            <label htmlFor="fp-phone" className="mb-1 block text-xs font-bold text-ink-muted">
              رقم الهاتف المرتبط بالحساب (لإرسال كود التحقق)
            </label>
            <input
              id="fp-phone"
              type="tel"
              dir="ltr"
              placeholder="+967778163178"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="input-base text-sm"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              سيتم التحقق من تطابق رقم الهاتف مع الحساب وإرسال كود التحقق المكوّن من 6 أرقام إليه.
            </p>
          </div>

          {error ? (
            <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs font-bold text-rose-100">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3 text-sm">
            {busy ? "جارٍ إرسال كود التحقق…" : "إرسال كود التحقق إلى رقم الهاتف 📱"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="rounded-2xl border border-brand/40 bg-surface-2 p-3.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-ink">الحساب: {otpInfo?.displayName}</span>
              <span className="rounded-lg bg-brand/15 px-2 py-0.5 font-mono text-[11px] font-bold text-brand-strong">
                @{otpInfo?.username}
              </span>
            </div>
            <p className="mt-1.5 text-ink-soft">
              تم إرسال كود التحقق المكوّن من 6 أرقام إلى رقم الهاتف المرتبط:{" "}
              <strong dir="ltr" className="font-mono text-brand-strong">
                {otpInfo?.maskedPhone}
              </strong>{" "}
              (صالح لمدة {otpInfo?.expiresInMinutes ?? 10} دقائق).
            </p>

            {otpInfo?.deliveryChannel === "sms_gateway" ? (
              <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-center">
                <p className="text-sm font-bold text-emerald-200">
                  📲 تم إرسال رسالة برمز التحقق (OTP) إلى رقم واتساب الخاص بك.
                </p>
                <p className="mt-1.5 text-xs text-emerald-300/80">
                  يرجى تفقد رسائل الواتساب للحصول على الكود المكوّن من 6 أرقام.
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="fp-code" className="mb-1 block text-xs font-bold text-ink-muted">
              كود التحقق (6 أرقام)
            </label>
            <input
              id="fp-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              dir="ltr"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
              className="input-base text-center font-mono text-lg font-black tracking-widest"
            />
          </div>

          <div>
            <label htmlFor="fp-new-pass" className="mb-1 block text-xs font-bold text-ink-muted">
              كلمة المرور الجديدة (6 خانات على الأقل)
            </label>
            <div className="flex gap-2">
              <input
                id="fp-new-pass"
                type={showPass ? "text" : "password"}
                required
                minLength={6}
                dir="ltr"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-base text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="btn-ghost px-3 text-xs"
              >
                {showPass ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="fp-confirm-pass" className="mb-1 block text-xs font-bold text-ink-muted">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              id="fp-confirm-pass"
              type={showPass ? "text" : "password"}
              required
              minLength={6}
              dir="ltr"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base text-sm"
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs font-bold text-rose-100">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" disabled={busy} className="btn-primary flex-1 py-3 text-sm">
              {busy ? "جارٍ التحقق والحفظ…" : "تأكيد الكود وتعيين كلمة المرور الجديدة"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
              className="btn-ghost py-3 text-xs"
            >
              تغيير الحساب / إعادة الإرسال
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; mustChangePassword?: boolean };

      if (!res.ok || !data.ok) {
        setError(data.error || "تعذّر تسجيل الدخول.");
        setPassword("");
        return;
      }

      router.replace(data.mustChangePassword ? "/admin/password" : "/admin");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم. حاول مجددًا.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel w-full max-w-md p-7">
      <h1 className="text-xl font-black text-ink">دخول لوحة التحكم</h1>
      <p className="mt-2 text-xs leading-6 text-ink-muted">
        الوصول مخصّص للموظفين المصرّح لهم فقط. يمكنك الدخول باسم المستخدم أو رقم الهاتف المرتبط بالحساب.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-xs font-bold text-ink-muted">
            اسم المستخدم أو رقم الهاتف المرتبط
          </label>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            placeholder="designer أو +967778163178"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-base text-sm"
            dir="ltr"
            autoFocus
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-bold text-ink-muted">
              كلمة المرور
            </label>
            <Link
              href="/admin/forgot-password"
              className="text-xs font-bold text-brand-strong hover:underline"
            >
              نسيت كلمة المرور؟ استعادة عبر الهاتف 📱
            </Link>
          </div>
          <div className="flex gap-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base text-sm"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="btn-ghost px-3 text-xs"
              aria-pressed={showPassword}
            >
              {showPassword ? "إخفاء" : "إظهار"}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-rose-500/50 bg-rose-950/50 p-3 text-xs font-bold text-rose-200">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn-primary mt-6 w-full text-sm">
        {busy ? "جارٍ التحقق…" : "تسجيل الدخول"}
      </button>

      <div className="mt-4 border-t border-line pt-3 text-center">
        <Link
          href="/admin/forgot-password"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-brand-strong"
        >
          <span>🔑</span>
          <span>هل نسيت كلمة المرور؟ إرسال كود تحقق (OTP) إلى رقم هاتفك</span>
        </Link>
      </div>
    </form>
  );
}

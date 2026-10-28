"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminUser } from "@/lib/types";

export function ChangePasswordForm({ user }: { user?: AdminUser }) {
  const router = useRouter();

  // حالة تعديل بيانات الحساب الشخصي ورقم الهاتف
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // حالة تغيير كلمة المرور الخاصة
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileBusy(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "profile",
          displayName,
          username,
          phone,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setProfileMsg({ type: "err", text: data.error || "تعذّر حفظ بيانات الحساب." });
        return;
      }
      setProfileMsg({
        type: "ok",
        text: "✅ تم تحديث بيانات حسابك ورقم الهاتف المرتبط باستعادة كلمة المرور بنجاح.",
      });
      router.refresh();
    } catch {
      setProfileMsg({ type: "err", text: "تعذّر الاتصال بالخادم. حاول مجددًا." });
    } finally {
      setProfileBusy(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور الجديدتان غير متطابقتين.");
      return;
    }
    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "تعذّر تغيير كلمة المرور.");
        return;
      }
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم. حاول مجددًا.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {user ? (
        <form onSubmit={saveProfile} className="panel space-y-4 p-6">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-black text-ink">👤 بيانات الحساب ورقم الهاتف للاستعادة</h2>
            <p className="mt-1 text-xs text-ink-muted">
              يُستخدم رقم الهاتف المرتبط بحسابك لإرسال كود التحقق (OTP) في حال نسيان كلمة المرور.
            </p>
          </div>

          <div>
            <label htmlFor="prof-display" className="mb-1 block text-xs font-bold text-ink-muted">
              الاسم المعروض
            </label>
            <input
              id="prof-display"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-base text-sm"
            />
          </div>

          <div>
            <label htmlFor="prof-username" className="mb-1 block text-xs font-bold text-ink-muted">
              اسم المستخدم (لتسجيل الدخول)
            </label>
            <input
              id="prof-username"
              type="text"
              required
              dir="ltr"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-base font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="prof-phone" className="mb-1 block text-xs font-bold text-ink-muted">
              رقم الهاتف المرتبط بالحساب (لاستعادة كلمة المرور عبر كود التحقق 📱)
            </label>
            <input
              id="prof-phone"
              type="tel"
              required
              dir="ltr"
              placeholder="+967778163178"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-base font-mono text-sm"
            />
          </div>

          {profileMsg ? (
            <p
              role={profileMsg.type === "err" ? "alert" : "status"}
              className={`rounded-xl border p-3 text-xs font-bold ${
                profileMsg.type === "ok"
                  ? "border-emerald-500/50 bg-emerald-950/50 text-emerald-200"
                  : "border-rose-500/50 bg-rose-950/50 text-rose-200"
              }`}
            >
              {profileMsg.text}
            </p>
          ) : null}

          <button type="submit" disabled={profileBusy} className="btn-primary w-full text-sm">
            {profileBusy ? "جارٍ الحفظ…" : "حفظ بيانات الحساب ورقم الهاتف"}
          </button>
        </form>
      ) : null}

      <form onSubmit={submitPassword} className="panel space-y-4 p-6">
        <div className="border-b border-line pb-3">
          <h2 className="text-base font-black text-ink">🔐 تغيير كلمة المرور الخاصة بحسابك</h2>
          <p className="mt-1 text-xs text-ink-muted">
            تُحفظ كلمة المرور مُجزَّأة بخوارزمية <code className="text-brand-strong">scrypt</code> وتُنهى الجلسات الأخرى تلقائيًا.
          </p>
        </div>

        <div>
          <label htmlFor="currentPassword" className="mb-1 block text-xs font-bold text-ink-muted">
            كلمة المرور الحالية
          </label>
          <input
            id="currentPassword"
            type={showPass ? "text" : "password"}
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-base text-sm"
            dir="ltr"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-1 block text-xs font-bold text-ink-muted">
            كلمة المرور الجديدة (6 خانات على الأقل)
          </label>
          <div className="flex gap-2">
            <input
              id="newPassword"
              type={showPass ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-base text-sm"
              dir="ltr"
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
          <label htmlFor="confirmPassword" className="mb-1 block text-xs font-bold text-ink-muted">
            تأكيد كلمة المرور الجديدة
          </label>
          <input
            id="confirmPassword"
            type={showPass ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-base text-sm"
            dir="ltr"
          />
        </div>

        {done ? (
          <p role="status" className="rounded-xl border border-emerald-500/50 bg-emerald-950/50 p-3 text-xs font-bold text-emerald-200">
            ✅ تم تغيير كلمة المرور بنجاح، وتم تحديث جلستك الحالية.
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-xl border border-rose-500/50 bg-rose-950/50 p-3 text-xs font-bold text-rose-200">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className="btn-primary w-full text-sm">
          {busy ? "جارٍ الحفظ…" : "تغيير كلمة المرور"}
        </button>
      </form>
    </div>
  );
}

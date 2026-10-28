import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  const settings = getSettings();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/assets/ProNet_Logo.png"
          alt={`شعار ${settings.brandName}`}
          width={56}
          height={56}
          className="h-14 w-14 rounded-2xl object-contain"
        />
        <span>
          <span className="block text-lg font-black text-ink">{settings.brandName}</span>
          <span className="block text-xs font-semibold text-ink-muted">{settings.slogan}</span>
        </span>
      </Link>

      <div className="panel w-full max-w-md p-7">
        <div className="mb-5">
          <h1 className="text-xl font-black text-ink">استعادة كلمة المرور عبر رقم الهاتف 📱</h1>
          <p className="mt-1 text-xs leading-6 text-ink-muted">
            أدخل اسم المستخدم أو رقم الهاتف المرتبط بحسابك لإرسال كود التحقق المكوّن من 6 أرقام وتعيين كلمة مرور جديدة.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs">
          <Link href="/admin/login" className="font-bold text-brand-strong hover:underline">
            ← العودة لتسجيل الدخول
          </Link>
          <Link href="/" className="text-ink-muted hover:text-brand-strong">
            العودة إلى الموقع
          </Link>
        </div>
      </div>
    </div>
  );
}

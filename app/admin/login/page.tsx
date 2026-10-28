import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
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

      <AdminLoginForm />

      <Link href="/" className="text-xs font-bold text-ink-muted hover:text-brand-strong">
        ← العودة إلى الموقع
      </Link>
    </div>
  );
}

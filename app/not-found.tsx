import Link from "next/link";

// تُستخدم للروابط غير المطابقة خارج نطاق مجموعة الموقع (مثل /admin/xxx)
export default function GlobalNotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p aria-hidden="true" className="text-5xl">
        🔍
      </p>
      <h1 className="mt-6 text-2xl font-black text-ink">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm text-ink-muted">تأكد من الرابط، أو عد إلى الموقع الرئيسي.</p>
      <Link href="/" className="btn-primary mt-8 text-sm">
        العودة إلى الموقع
      </Link>
    </div>
  );
}

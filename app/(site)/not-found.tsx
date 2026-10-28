import Link from "next/link";

export default function SiteNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p aria-hidden="true" className="text-6xl">
        🧭
      </p>
      <h1 className="mt-6 text-3xl font-black text-ink">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm leading-7 text-ink-muted">
        يبدو أن الرابط الذي فتحته غير صحيح أو تم نقل الصفحة. يمكنك العودة إلى الرئيسية أو تصفّح المتجر.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary text-sm">
          الصفحة الرئيسية
        </Link>
        <Link href="/store" className="btn-ghost text-sm">
          المتجر الإلكتروني
        </Link>
        <Link href="/contact" className="btn-ghost text-sm">
          تواصل معنا
        </Link>
      </div>
    </div>
  );
}

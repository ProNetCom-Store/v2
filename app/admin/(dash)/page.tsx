import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { countProducts, getOrderStats, getOrders, getSupportTickets } from "@/lib/queries";
import { formatDateTime, formatUsd } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireUser();
  const stats = getOrderStats();
  const recentOrders = getOrders({ limit: 6 });
  const productCount = countProducts();
  const tickets = getSupportTickets();

  const cards = [
    { label: "إجمالي الطلبات", value: String(stats.total), tone: "text-ink" },
    { label: "طلبات جديدة", value: String(stats.new), tone: "text-brand-strong" },
    { label: "قيد المتابعة", value: String(stats.inProgress), tone: "text-amber-300" },
    { label: "تم التوريد", value: String(stats.delivered), tone: "text-emerald-300" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">مرحبًا، {user.displayName}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          هذه الطلبات الواردة فعليًا من الموقع — محفوظة على الخادم وليست في متصفح العميل.
        </p>
      </header>

      <section aria-label="مؤشرات الطلبات" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="panel p-4">
            <p className="text-xs font-bold text-ink-muted">{c.label}</p>
            <p className={`mt-1 text-3xl font-black ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <p className="text-xs font-bold text-ink-muted">إجمالي قيمة الطلبات (غير الملغاة)</p>
          <p className="mt-1 text-3xl font-black text-gold">{formatUsd(stats.totalUsd)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-bold text-ink-muted">أصناف المتجر النشطة</p>
          <p className="mt-1 text-3xl font-black text-ink">{productCount}</p>
          <Link href="/admin/products" className="mt-2 inline-block text-xs font-bold text-brand-strong hover:underline">
            إدارة الأصناف ←
          </Link>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="text-base font-black text-ink">أحدث الطلبات</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-brand-strong hover:underline">
            كل الطلبات ←
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-muted">لا توجد طلبات بعد.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-brand-strong" dir="ltr">
                    {o.orderNo}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-ink">{o.customerName}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {ORDER_TYPE_LABELS[o.type]} • {o.itemsCount} قطعة • {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-black text-ink">{formatUsd(o.totalUsd)}</p>
                  <p className="mt-0.5 text-xs font-bold text-ink-soft">{ORDER_STATUS_LABELS[o.status]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {tickets.length > 0 ? (
        <section className="panel p-5">
          <h2 className="text-base font-black text-ink">تذاكر الدعم الفني</h2>
          <ul className="mt-3 space-y-2">
            {tickets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-bold text-ink-soft">{t.title}</span>
                <span className="text-xs text-ink-muted">
                  {t.client} — {t.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

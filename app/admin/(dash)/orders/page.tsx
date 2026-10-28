import Link from "next/link";
import { canAccessTab, requireUser } from "@/lib/auth";
import { getOrders } from "@/lib/queries";
import { formatDateTime, formatUsd, whatsappLink } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, type Order, type OrderStatus } from "@/lib/types";
import { setOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ key: OrderStatus | "all"; label: string }> = [
  { key: "all", label: "الكل" },
  { key: "new", label: "جديدة" },
  { key: "in_progress", label: "قيد المتابعة" },
  { key: "delivered", label: "تم التوريد" },
  { key: "cancelled", label: "ملغية" },
];

const STATUS_TONES: Record<OrderStatus, string> = {
  new: "border-brand/50 bg-brand/10 text-brand-strong",
  in_progress: "border-amber-400/50 bg-amber-400/10 text-amber-200",
  delivered: "border-emerald-400/50 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-rose-400/50 bg-rose-400/10 text-rose-200",
};

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const sp = await searchParams;

  const statusFilter = STATUS_FILTERS.find((f) => f.key === sp.status)?.key ?? "all";
  const orders = getOrders({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: sp.q?.trim() || undefined,
  });

  const canManage = canAccessTab(user, "orders");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">الطلبات الواردة</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {orders.length} طلبًا — كل طلب هنا وصل من عميل حقيقي عبر الموقع وحُفظ على الخادم.
          </p>
        </div>
      </header>

      <form method="get" className="panel flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-40 flex-1">
          <label htmlFor="q" className="mb-1 block text-xs font-bold text-ink-muted">
            بحث برقم الطلب أو الاسم أو الهاتف
          </label>
          <input id="q" name="q" type="search" defaultValue={sp.q ?? ""} className="input-base text-sm" />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-bold text-ink-muted">
            الحالة
          </label>
          <select id="status" name="status" defaultValue={statusFilter} className="input-base text-sm">
            {STATUS_FILTERS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary text-sm">
          تصفية
        </button>
      </form>

      {orders.length === 0 ? (
        <p className="panel p-8 text-center text-sm text-ink-muted">لا توجد طلبات مطابقة.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-brand-strong" dir="ltr">
                      {order.orderNo}
                    </span>
                    <span
                      className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONES[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="rounded-lg border border-line px-2 py-0.5 text-[11px] font-bold text-ink-soft">
                      {ORDER_TYPE_LABELS[order.type]}
                    </span>
                    {order.source === "legacy-seed" ? (
                      <span className="rounded-lg border border-slate-500/40 px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                        بيانات تجريبية
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-base font-black text-ink">{order.customerName}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    <span dir="ltr">{order.customerPhone}</span>
                    {order.customerAddress ? ` • ${order.customerAddress}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">{formatDateTime(order.createdAt)}</p>
                  {order.paymentMethod ? (
                    <p className="mt-1 text-xs text-ink-soft">💳 {order.paymentMethod}</p>
                  ) : null}
                  {order.notes ? <p className="mt-1 text-xs text-ink-soft">📝 {order.notes}</p> : null}
                </div>

                <div className="text-end">
                  <p className="text-xl font-black text-ink">{formatUsd(order.totalUsd)}</p>
                  <p className="text-xs text-ink-muted">{order.itemsCount} قطعة</p>
                  <a
                    href={whatsappLink(order.customerPhone, `مرحبًا ${order.customerName}، بخصوص طلبكم رقم ${order.orderNo} من برونت كمبيوتر:`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost mt-2 inline-block text-xs"
                  >
                    💬 مراسلة العميل
                  </a>
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-line pt-3">
                {order.items.map((item, i) => (
                  <li key={`${order.id}-${i}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-ink-soft">
                      {item.qty}× {item.name}
                      {item.sku ? <span className="ms-2 font-mono text-[11px] text-ink-muted">({item.sku})</span> : null}
                    </span>
                    <span className="font-bold text-ink-soft">{formatUsd(item.priceUsd * item.qty)}</span>
                  </li>
                ))}
              </ul>

              {canManage ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                  {(["new", "in_progress", "delivered", "cancelled"] as OrderStatus[])
                    .filter((s) => s !== order.status)
                    .map((s) => (
                      <form key={s} action={setOrderStatus}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="status" value={s} />
                        <button type="submit" className="btn-ghost text-xs">
                          تعيين: {ORDER_STATUS_LABELS[s]}
                        </button>
                      </form>
                    ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-xs text-ink-muted">
        <Link href="/admin" className="hover:text-brand-strong">
          ← العودة إلى لوحة المعلومات
        </Link>
      </p>
    </div>
  );
}

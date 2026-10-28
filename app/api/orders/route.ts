import { NextResponse } from "next/server";
import { createOrder, getProduct } from "@/lib/queries";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import type { Currency, OrderItem, OrderType } from "@/lib/types";

// node:sqlite يحتاج بيئة Node وليس Edge
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingItem {
  productId?: unknown;
  qty?: unknown;
}

interface IncomingOrder {
  type?: unknown;
  customerName?: unknown;
  customerPhone?: unknown;
  customerAddress?: unknown;
  paymentMethod?: unknown;
  notes?: unknown;
  currency?: unknown;
  items?: unknown;
}

function asString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  // 10 طلبات كل 10 دقائق لكل عنوان — كافٍ لعميل حقيقي ومانع لإغراق آلي
  const limit = rateLimit(`orders:${clientKey(request.headers)}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: `تم إرسال طلبات كثيرة. يرجى المحاولة بعد ${limit.retryAfterSeconds} ثانية.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: IncomingOrder;
  try {
    body = (await request.json()) as IncomingOrder;
  } catch {
    return NextResponse.json({ ok: false, error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const customerName = asString(body.customerName, 120);
  const customerPhone = asString(body.customerPhone, 40);
  const customerAddress = asString(body.customerAddress, 250);
  const paymentMethod = asString(body.paymentMethod, 160);
  const notes = asString(body.notes, 1000);

  const type: OrderType = body.type === "rfq" ? "rfq" : body.type === "tender" ? "tender" : "store";
  const currency: Currency = body.currency === "YER" ? "YER" : body.currency === "SAR" ? "SAR" : "USD";

  if (customerName.length < 2) {
    return NextResponse.json({ ok: false, error: "يرجى إدخال اسم صحيح." }, { status: 400 });
  }
  if (customerPhone.replace(/[^0-9]/g, "").length < 7) {
    return NextResponse.json({ ok: false, error: "يرجى إدخال رقم هاتف صحيح." }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ ok: false, error: "لا يمكن إرسال طلب بدون أصناف." }, { status: 400 });
  }
  if (rawItems.length > 60) {
    return NextResponse.json({ ok: false, error: "عدد الأصناف في الطلب كبير جدًا." }, { status: 400 });
  }

  // مهم أمنيًا: لا نثق بالأسعار القادمة من المتصفح — نقرأها من قاعدة البيانات.
  const items: OrderItem[] = [];
  for (const raw of rawItems) {
    const productId = asString(raw.productId, 64);
    const qty = Math.max(1, Math.min(999, Math.floor(Number(raw.qty) || 1)));
    if (!productId) continue;

    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json({ ok: false, error: "أحد الأصناف لم يعد متوفرًا. يرجى تحديث السلة." }, { status: 400 });
    }
    items.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      priceUsd: product.price,
      qty,
    });
  }

  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "لا يمكن إرسال طلب بدون أصناف صحيحة." }, { status: 400 });
  }

  try {
    const order = createOrder({
      type,
      customerName,
      customerPhone,
      customerAddress: customerAddress || null,
      paymentMethod: paymentMethod || null,
      notes: notes || null,
      items,
      currency,
    });

    return NextResponse.json(
      {
        ok: true,
        order: { orderNo: order.orderNo, totalUsd: order.totalUsd, itemsCount: order.itemsCount },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[orders] create failed", error);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع أثناء حفظ الطلب." }, { status: 500 });
  }
}

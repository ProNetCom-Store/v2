/**
 * محدّد معدّل بسيط في الذاكرة — يمنع إغراق الطلبات من نفس المصدر.
 * ملاحظة: في نشر متعدد العمليات (multi-instance) يُستحسن استبداله بمخزن مشترك (Redis).
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // تنظيف دوري خفيف لمنع تضخّم الذاكرة
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
    }
    if (buckets.size > MAX_BUCKETS) buckets.clear();
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0, remaining: limit - 1 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
    };
  }
  return { allowed: true, retryAfterSeconds: 0, remaining: limit - existing.count };
}

/** استخراج عنوان العميل من الترويسات (يتوافق مع الوكلاء العكسيين). */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}

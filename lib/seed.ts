import type { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { generatePassword, hashPassword } from "./crypto";
import storeSeed from "@/data/seed/store.json";
import usersSeed from "@/data/seed/users.json";

/** يحوّل النصوص العربية لحالات داخلية مستقرة. */
function mapOrderType(raw: string): "store" | "rfq" | "tender" {
  if (!raw) return "store";
  if (raw.includes("مناقصة") || raw.includes("B2B")) return "tender";
  if (raw.includes("عرض")) return "rfq";
  return "store";
}

function mapOrderStatus(raw: string): "new" | "in_progress" | "delivered" | "cancelled" {
  if (!raw) return "new";
  if (raw.includes("تم التوريد")) return "delivered";
  if (raw.includes("قيد")) return "in_progress";
  if (raw.includes("ملغي") || raw.includes("ملغى")) return "cancelled";
  return "new";
}

function slugify(input: string, fallbackIndex: number): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "item"}-${fallbackIndex + 1}`;
}

function writeCredentialsFile(lines: string[]) {
  const file = path.resolve(process.cwd(), "data", "INITIAL_CREDENTIALS.txt");
  const banner = [
    "بيانات الدخول الأولية — برونت كمبيوتر",
    "=====================================",
    "هذا الملف يُنشأ عند تهيئة قاعدة البيانات.",
    "يمكنك تعديل بيانات المستخدمين وكلمات المرور وأرقام الهواتف من لوحة التحكم (/admin/users أو /admin/password)",
    "أو استعادة كلمة المرور عبر رقم الهاتف المرتبط بالحساب (/admin/forgot-password).",
    "",
    "الصفحة: /admin/login",
    "",
    ...lines,
    "",
    new Date().toISOString(),
  ].join("\n");
  try {
    fs.writeFileSync(file, banner, "utf8");
  } catch {
    // لا نُفشل التهيئة إذا تعذّرت الكتابة
  }
  // eslint-disable-next-line no-console
  console.log("\n" + banner + "\n");
}

export function seedIfEmpty(db: DatabaseSync): void {
  const settingsCount = db.prepare("SELECT COUNT(*) AS c FROM settings").get() as { c: number };
  if (settingsCount.c > 0) return;

  const seed = storeSeed as unknown as Record<string, unknown>;

  // ---------------- settings ----------------
  const settings = seed.settings as Record<string, unknown>;
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(settings)) {
    insertSetting.run(key, JSON.stringify(value));
  }
  insertSetting.run("data_version", JSON.stringify("3.2"));
  insertSetting.run("seeded_at", JSON.stringify(new Date().toISOString()));

  // ---------------- categories & brands ----------------
  const insertCategory = db.prepare(
    "INSERT INTO categories (id, name, sort, active) VALUES (?, ?, ?, 1)",
  );
  (seed.categories as string[]).forEach((name, i) => insertCategory.run(`cat-${i + 1}`, name, i));

  const insertBrand = db.prepare("INSERT INTO brands (id, name, sort, active) VALUES (?, ?, ?, 1)");
  (seed.brands as string[]).forEach((name, i) => insertBrand.run(slugify(name, i), name, i));

  // ---------------- products ----------------
  const insertProduct = db.prepare(`
    INSERT INTO products (id, sku, brand_code, model, name, category, brand, price, old_price,
      hide_price, badge, icon_type, featured, specs, description, image_url, official_spec_url, stock, active, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const products = seed.products as Array<Record<string, unknown>>;
  products.forEach((p, i) => {
    insertProduct.run(
      String(p.id),
      p.sku ? String(p.sku) : null,
      p.brand_code ? String(p.brand_code) : null,
      p.model ? String(p.model) : null,
      String(p.name ?? ""),
      p.category ? String(p.category) : null,
      p.brand ? String(p.brand) : null,
      Number(p.price ?? 0),
      p.oldPrice === null || p.oldPrice === undefined ? null : Number(p.oldPrice),
      p.hidePrice ? 1 : 0,
      p.badge ? String(p.badge) : null,
      p.iconType ? String(p.iconType) : "box",
      p.featured ? 1 : 0,
      JSON.stringify(Array.isArray(p.specs) ? p.specs : []),
      p.desc ? String(p.desc) : null,
      p.imageUrl ? String(p.imageUrl) : null,
      p.official_spec_url ? String(p.official_spec_url) : null,
      null,
      i,
    );
  });

  // ---------------- slides ----------------
  const insertSlide = db.prepare(
    "INSERT INTO slides (id, badge, title, subtitle, image, cta_label, cta_href, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
  );
  (seed.slides as Array<Record<string, unknown>>).forEach((s, i) =>
    insertSlide.run(
      String(s.id),
      String(s.badge ?? ""),
      String(s.title ?? ""),
      String(s.subtitle ?? ""),
      String(s.image ?? ""),
      "تصفّح المتجر",
      "/store",
      i,
    ),
  );

  // ---------------- business areas ----------------
  const insertArea = db.prepare(
    "INSERT INTO business_areas (id, title, icon, category_filter, description, sort, active) VALUES (?, ?, ?, ?, ?, ?, 1)",
  );
  (seed.businessAreas as Array<Record<string, unknown>>).forEach((a, i) =>
    insertArea.run(String(a.id), String(a.title ?? ""), String(a.icon ?? ""), String(a.categoryFilter ?? ""), String(a.desc ?? ""), i),
  );

  // ---------------- projects ----------------
  const insertProject = db.prepare(
    "INSERT INTO projects (id, title, title_en, category, location, description, description_en, image, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)",
  );
  (seed.projects as Array<Record<string, unknown>>).forEach((p, i) =>
    insertProject.run(String(p.id), String(p.title ?? ""), String(p.titleEn ?? ""), String(p.category ?? ""), String(p.location ?? ""), String(p.desc ?? ""), String(p.descEn ?? ""), String(p.image ?? ""), i),
  );

  // ---------------- posts ----------------
  const insertPost = db.prepare(
    "INSERT INTO posts (id, title, tag, published, content, sort, active) VALUES (?, ?, ?, ?, ?, ?, 1)",
  );
  (seed.posts as Array<Record<string, unknown>>).forEach((p, i) =>
    insertPost.run(String(p.id), String(p.title ?? ""), String(p.tag ?? ""), String(p.date ?? ""), String(p.content ?? ""), i),
  );

  // ---------------- support tickets ----------------
  const insertTicket = db.prepare(
    "INSERT INTO support_tickets (id, title, client, status, engineer, sort) VALUES (?, ?, ?, ?, ?, ?)",
  );
  (seed.supportTickets as Array<Record<string, unknown>>).forEach((t, i) =>
    insertTicket.run(String(t.id), String(t.title ?? ""), String(t.client ?? ""), String(t.status ?? ""), String(t.engineer ?? ""), i),
  );

  // ---------------- bank accounts ----------------
  const insertBank = db.prepare(
    "INSERT INTO bank_accounts (id, bank_name, badge, badge_color, account_holder, col_span2, accounts, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  (seed.bankAccounts as Array<Record<string, unknown>>).forEach((b, i) =>
    insertBank.run(
      String(b.id),
      String(b.bankName ?? ""),
      String(b.badge ?? ""),
      String(b.badgeColor ?? "cyan"),
      String(b.accountHolder ?? ""),
      b.colSpan2 ? 1 : 0,
      JSON.stringify(Array.isArray(b.accounts) ? b.accounts : []),
      i,
    ),
  );

  // ---------------- users (كلمات مرور مُجزَّأة مع ربط رقم الهاتف لكل مستخدم) ----------------
  const envPassword = process.env.PRONET_SEED_ADMIN_PASSWORD?.trim();
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, display_name, phone, role_key, role_title, icon, badge_class, description,
      allowed_tabs, can_edit_prices, can_delete_items, can_export_site, active, password_hash, must_change_password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const credentialLines: string[] = [];
  for (const u of usersSeed as Array<Record<string, unknown>>) {
    const initialPass = typeof u.initialPassword === "string" && u.initialPassword.trim().length >= 6 ? u.initialPassword.trim() : "";
    const password = envPassword || initialPass || generatePassword(16);
    const phone = typeof u.phone === "string" ? u.phone.trim() : "";
    insertUser.run(
      String(u.id),
      String(u.username),
      String(u.displayName ?? u.username),
      phone,
      String(u.roleKey ?? "staff"),
      u.roleTitle ? String(u.roleTitle) : null,
      u.icon ? String(u.icon) : null,
      u.badgeClass ? String(u.badgeClass) : null,
      u.description ? String(u.description) : null,
      JSON.stringify(Array.isArray(u.allowedTabs) ? u.allowedTabs : []),
      u.canEditPrices ? 1 : 0,
      u.canDeleteItems ? 1 : 0,
      u.canExportSite ? 1 : 0,
      u.active === false ? 0 : 1,
      hashPassword(password),
      0,
    );
    credentialLines.push(
      `  المستخدم: ${String(u.username).padEnd(12)} | كلمة المرور: ${password.padEnd(18)} | الهاتف: ${phone.padEnd(14)} (${String(u.displayName ?? "")})`,
    );
  }
  writeCredentialsFile(credentialLines);

  // ---------------- sample orders (من بيانات المشروع القديم) ----------------
  const insertOrder = db.prepare(`
    INSERT INTO orders (order_no, type, customer_name, customer_phone, customer_address, payment_method,
      notes, items, items_count, total_usd, currency, status, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, 'legacy-seed', ?)
  `);
  (seed.orders as Array<Record<string, unknown>>).forEach((o) => {
    const itemsText = String(o.items ?? "");
    const total = Number(o.totalUSD ?? 0);
    insertOrder.run(
      String(o.orderNo ?? ""),
      mapOrderType(String(o.type ?? "")),
      String(o.customer ?? ""),
      String(o.phone ?? ""),
      null,
      o.payment ? String(o.payment) : null,
      null,
      JSON.stringify([{ productId: "", name: itemsText, sku: "", priceUsd: total, qty: 1 }]),
      1,
      total,
      mapOrderStatus(String(o.status ?? "")),
      String(o.date ?? new Date().toISOString()),
    );
  });
}

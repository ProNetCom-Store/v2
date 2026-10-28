import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { seedIfEmpty } from "./seed";

// ---------------------------------------------------------------------------
// اتصال واحد يُعاد استخدامه (مهم لتطوير Next.js مع إعادة التحميل الساخن)
// ---------------------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var __pronetDb: DatabaseSync | undefined;
}

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  name_en TEXT,
  icon    TEXT,
  image   TEXT,
  sort    INTEGER NOT NULL DEFAULT 0,
  active  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS brands (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  name_en        TEXT,
  logo           TEXT,
  is_agent       INTEGER NOT NULL DEFAULT 0,
  website        TEXT,
  description    TEXT,
  description_en TEXT,
  sort           INTEGER NOT NULL DEFAULT 0,
  active         INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS products (
  id                TEXT PRIMARY KEY,
  sku               TEXT,
  brand_code        TEXT,
  model             TEXT,
  name              TEXT NOT NULL,
  name_en           TEXT,
  category          TEXT,
  brand             TEXT,
  price             REAL NOT NULL DEFAULT 0,
  old_price         REAL,
  hide_price        INTEGER NOT NULL DEFAULT 0,
  badge             TEXT,
  badge_en          TEXT,
  icon_type         TEXT,
  featured          INTEGER NOT NULL DEFAULT 0,
  specs             TEXT NOT NULL DEFAULT '[]',
  specs_en          TEXT NOT NULL DEFAULT '[]',
  description       TEXT,
  description_en    TEXT,
  image_url         TEXT,
  official_spec_url TEXT,
  stock             INTEGER,
  active            INTEGER NOT NULL DEFAULT 1,
  sort              INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand    ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

CREATE TABLE IF NOT EXISTS slides (
  id          TEXT PRIMARY KEY,
  badge       TEXT,
  badge_en    TEXT,
  title       TEXT NOT NULL,
  title_en    TEXT,
  subtitle    TEXT,
  subtitle_en TEXT,
  image       TEXT,
  image_alt   TEXT,
  cta_label   TEXT,
  cta_label_en TEXT,
  cta_href    TEXT,
  sort        INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS business_areas (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  title_en        TEXT,
  icon            TEXT,
  category_filter TEXT,
  description     TEXT,
  description_en  TEXT,
  sort            INTEGER NOT NULL DEFAULT 0,
  active          INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS projects (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  title_en       TEXT,
  category       TEXT,
  location       TEXT,
  description    TEXT,
  description_en TEXT,
  image          TEXT,
  sort           INTEGER NOT NULL DEFAULT 0,
  active         INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS posts (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  title_en    TEXT,
  tag         TEXT,
  tag_en      TEXT,
  published   TEXT,
  excerpt     TEXT,
  excerpt_en  TEXT,
  content     TEXT,
  content_en  TEXT,
  image       TEXT,
  sort        INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id       TEXT PRIMARY KEY,
  title    TEXT NOT NULL,
  client   TEXT,
  status   TEXT,
  engineer TEXT,
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id             TEXT PRIMARY KEY,
  bank_name      TEXT NOT NULL,
  badge          TEXT,
  badge_color    TEXT,
  account_holder TEXT,
  col_span2      INTEGER NOT NULL DEFAULT 0,
  accounts       TEXT NOT NULL DEFAULT '[]',
  sort           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id                   TEXT PRIMARY KEY,
  username             TEXT NOT NULL UNIQUE,
  display_name         TEXT NOT NULL,
  phone                TEXT NOT NULL DEFAULT '',
  role_key             TEXT NOT NULL,
  role_title           TEXT,
  icon                 TEXT,
  badge_class          TEXT,
  description          TEXT,
  allowed_tabs         TEXT NOT NULL DEFAULT '[]',
  can_edit_prices      INTEGER NOT NULL DEFAULT 0,
  can_delete_items     INTEGER NOT NULL DEFAULT 0,
  can_export_site      INTEGER NOT NULL DEFAULT 0,
  active               INTEGER NOT NULL DEFAULT 1,
  password_hash        TEXT NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  last_login_at        TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS password_resets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone      TEXT NOT NULL,
  code_hash  TEXT NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);

CREATE TABLE IF NOT EXISTS orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no         TEXT NOT NULL UNIQUE,
  type             TEXT NOT NULL DEFAULT 'store',
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_address TEXT,
  payment_method   TEXT,
  notes            TEXT,
  items            TEXT NOT NULL DEFAULT '[]',
  items_count      INTEGER NOT NULL DEFAULT 0,
  total_usd        REAL NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'USD',
  status           TEXT NOT NULL DEFAULT 'new',
  source           TEXT NOT NULL DEFAULT 'website',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS admin_audit (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT,
  action     TEXT NOT NULL,
  details    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

// ---------------------------------------------------------------------------
// ترحيل خفيف: يضيف الأعمدة الجديدة لقواعد بيانات أُنشئت بنسخة أقدم
// (يعمل بشكل متكرّر بأمان — يتحقق من وجود العمود قبل إضافته)
// ---------------------------------------------------------------------------
function tableColumns(db: DatabaseSync, table: string): string[] {
  try {
    return (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((c) => c.name);
  } catch {
    return [];
  }
}

function addMissingColumns(db: DatabaseSync, table: string, columns: Record<string, string>): void {
  const existing = tableColumns(db, table);
  if (existing.length === 0) return;
  for (const [col, definition] of Object.entries(columns)) {
    if (!existing.includes(col)) {
      try {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${definition}`);
      } catch {
        /* تجاهل */
      }
    }
  }
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `item-${Math.random().toString(36).slice(2, 7)}`;
}

/** يعيد بناء جدول brands القديم (الذي كان مفتاحه الاسم) ليدعم الحقول التفصيلية. */
function rebuildBrandsIfNeeded(db: DatabaseSync): void {
  const cols = tableColumns(db, "brands");
  if (cols.length === 0 || cols.includes("id")) return;

  db.exec(`
    DROP TABLE IF EXISTS brands_new;
    CREATE TABLE brands_new (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      name_en        TEXT,
      logo           TEXT,
      is_agent       INTEGER NOT NULL DEFAULT 0,
      website        TEXT,
      description    TEXT,
      description_en TEXT,
      sort           INTEGER NOT NULL DEFAULT 0,
      active         INTEGER NOT NULL DEFAULT 1
    );
  `);
  const old = db.prepare("SELECT name, sort FROM brands ORDER BY sort").all() as Array<{ name: string; sort: number }>;
  const insert = db.prepare("INSERT INTO brands_new (id, name, sort, active) VALUES (?, ?, ?, 1)");
  old.forEach((r, i) => insert.run(slugify(String(r.name)) + `-${i + 1}`, r.name, Number(r.sort ?? i)));
  db.exec("DROP TABLE brands; ALTER TABLE brands_new RENAME TO brands;");
}

function migrate(db: DatabaseSync): void {
  addMissingColumns(db, "products", {
    name_en: "TEXT",
    badge_en: "TEXT",
    specs_en: "TEXT NOT NULL DEFAULT '[]'",
    description_en: "TEXT",
  });
  addMissingColumns(db, "categories", { name_en: "TEXT", icon: "TEXT", image: "TEXT", active: "INTEGER NOT NULL DEFAULT 1" });
  addMissingColumns(db, "slides", {
    badge_en: "TEXT",
    title_en: "TEXT",
    subtitle_en: "TEXT",
    image_alt: "TEXT",
    cta_label: "TEXT",
    cta_label_en: "TEXT",
    cta_href: "TEXT",
    active: "INTEGER NOT NULL DEFAULT 1",
  });
  addMissingColumns(db, "business_areas", { title_en: "TEXT", description_en: "TEXT", active: "INTEGER NOT NULL DEFAULT 1" });
  addMissingColumns(db, "projects", { title_en: "TEXT", description_en: "TEXT", image: "TEXT", active: "INTEGER NOT NULL DEFAULT 1" });
  addMissingColumns(db, "posts", {
    title_en: "TEXT",
    tag_en: "TEXT",
    excerpt: "TEXT",
    excerpt_en: "TEXT",
    content_en: "TEXT",
    image: "TEXT",
    active: "INTEGER NOT NULL DEFAULT 1",
  });
  addMissingColumns(db, "users", {
    phone: "TEXT NOT NULL DEFAULT ''",
  });

  // تعبئة أرقام الهواتف الافتراضية للحسابات الأساسية إذا كانت فارغة
  const defaultPhones: Record<string, string> = {
    designer: "+967778163178",
    management: "+967775043020",
    sales: "+967778163178",
    support: "+967782060054",
  };
  try {
    const updatePhoneStmt = db.prepare("UPDATE users SET phone = ? WHERE username = ? AND (phone IS NULL OR phone = '')");
    for (const [uname, phone] of Object.entries(defaultPhones)) {
      updatePhoneStmt.run(phone, uname);
    }
  } catch {
    /* تجاهل */
  }

  rebuildBrandsIfNeeded(db);
}

function resolveDbPath(): string {
  const configured = process.env.PRONET_DB_PATH?.trim();
  const target = configured ? path.resolve(process.cwd(), configured) : path.resolve(process.cwd(), "data", "pronet.db");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  return target;
}

export function getDb(): DatabaseSync {
  if (globalThis.__pronetDb) return globalThis.__pronetDb;

  const db = new DatabaseSync(resolveDbPath());
  db.exec(SCHEMA);

  // تهيئة أولية عند أول تشغيل فقط
  const seeded = db.prepare("SELECT value FROM settings WHERE key = 'seeded_at'").get() as { value: string } | undefined;
  if (!seeded) {
    seedIfEmpty(db);
  } else {
    // قواعد بيانات قائمة: نحضّر الأعمدة الجديدة دون فقدان أي بيانات
    migrate(db);
  }

  globalThis.__pronetDb = db;
  return db;
}

/** يُغلق الاتصال الحالي — يُستخدم قبل استبدال ملف قاعدة البيانات (استعادة نسخة احتياطية). */
export function closeDb(): void {
  if (globalThis.__pronetDb) {
    try {
      globalThis.__pronetDb.close();
    } catch {
      // تجاهل
    }
    globalThis.__pronetDb = undefined;
  }
}

export function audit(userId: string | null, action: string, details?: unknown) {
  try {
    getDb()
      .prepare("INSERT INTO admin_audit (user_id, action, details) VALUES (?, ?, ?)")
      .run(userId, action, details === undefined ? null : JSON.stringify(details));
  } catch {
    // التدقيق لا يجب أن يُفشل الطلب الأساسي
  }
}

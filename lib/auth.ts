import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { audit, getDb } from "./db";
import { hashPassword, randomToken, verifyPassword } from "./crypto";
import { getSettings } from "./queries";
import type { AdminUser } from "./types";

export const SESSION_COOKIE = "pronet_session";
const SESSION_TTL_HOURS = 8;
const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  phone: string | null;
  role_key: string;
  role_title: string | null;
  icon: string | null;
  badge_class: string | null;
  description: string | null;
  allowed_tabs: string;
  can_edit_prices: number;
  can_delete_items: number;
  can_export_site: number;
  active: number;
  must_change_password: number;
  last_login_at?: string | null;
}

function mapUser(r: UserRow): AdminUser {
  let tabs: string[] = [];
  try {
    tabs = JSON.parse(r.allowed_tabs) as string[];
  } catch {
    tabs = [];
  }
  return {
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    phone: r.phone ?? "",
    roleKey: r.role_key,
    roleTitle: r.role_title ?? "",
    icon: r.icon ?? "",
    badgeClass: r.badge_class ?? "",
    description: r.description ?? "",
    allowedTabs: tabs,
    canEditPrices: r.can_edit_prices === 1,
    canDeleteItems: r.can_delete_items === 1,
    canExportSite: r.can_export_site === 1,
    active: r.active === 1,
    mustChangePassword: r.must_change_password === 1,
    lastLoginAt: r.last_login_at ?? null,
  };
}

/** تطبيع رقم الهاتف للمقارنة المرنة (يدعم +967778163178 أو 967778163178 أو 0778163178 أو 778163178). */
export function normalizePhoneDigits(phone: string): string {
  const digits = String(phone || "").replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.startsWith("00967")) return digits.slice(5);
  if (digits.startsWith("967") && digits.length > 9) return digits.slice(3);
  if (digits.startsWith("0") && digits.length === 10) return digits.slice(1);
  return digits;
}

/** إخفاء جزء من رقم الهاتف للعرض الآمن (مثال: +967778***178). */
export function maskPhoneNumber(phone: string): string {
  const trimmed = String(phone || "").trim();
  if (trimmed.length <= 4) return trimmed;
  const keepStart = trimmed.startsWith("+") ? 7 : 3;
  const start = trimmed.slice(0, Math.min(keepStart, trimmed.length - 3));
  const end = trimmed.slice(-3);
  return `${start}***${end}`;
}

/** يُصدر رمز جلسة عشوائيًا ويخزّنه في قاعدة البيانات. */
export function createSessionToken(userId: string): { token: string; expiresAt: Date } {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
  getDb()
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, userId, expiresAt.toISOString());
  getDb().prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(userId);
  return { token, expiresAt };
}

export function destroySessionToken(token: string): void {
  try {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  } catch {
    // تجاهل
  }
}

export function purgeExpiredSessions(): void {
  try {
    getDb().prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString());
  } catch {
    // تجاهل
  }
}

function userBySessionToken(token: string): AdminUser | null {
  const r = getDb()
    .prepare(
      `SELECT u.* FROM users u
       JOIN sessions s ON s.user_id = u.id
       WHERE s.token = ? AND s.expires_at > ? AND u.active = 1`,
    )
    .get(token, new Date().toISOString()) as unknown as UserRow | undefined;
  return r ? mapUser(r) : null;
}

/** المستخدم الحالي من الكوكي — يُستخدم في مكوّنات الخادم ومسارات API. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return userBySessionToken(token);
}

/** يحمي صفحات اللوحة: يعيد التوجيه لصفحة الدخول إن لم توجد جلسة صالحة. */
export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/**
 * التحقق من بيانات الدخول (يدعم اسم المستخدم أو رقم الهاتف المرتبط إذا كان فريدًا).
 */
export function verifyCredentials(username: string, password: string): AdminUser | null {
  const clean = String(username || "").trim().toLowerCase();
  if (!clean || !password) return null;

  let r = getDb().prepare("SELECT * FROM users WHERE lower(username) = ?").get(clean) as
    | (UserRow & { password_hash: string })
    | undefined;

  if (!r) {
    const cleanDigits = normalizePhoneDigits(clean);
    if (cleanDigits.length >= 7) {
      const allActive = getDb()
        .prepare("SELECT * FROM users WHERE active = 1")
        .all() as unknown as Array<UserRow & { password_hash: string }>;
      const matches = allActive.filter((u) => normalizePhoneDigits(u.phone || "") === cleanDigits);
      if (matches.length === 1) {
        r = matches[0];
      }
    }
  }

  if (!r) {
    // تنفيذ عملية تجزئة وهمية للحفاظ على زمن استجابة ثابت
    verifyPassword(password, "scrypt$16384$8$1$00$00");
    return null;
  }
  if (!verifyPassword(password, r.password_hash)) return null;
  if (r.active !== 1) return null;
  return mapUser(r);
}

export function listUsers(): AdminUser[] {
  return getDb().prepare("SELECT * FROM users ORDER BY rowid").all().map((r) => mapUser(r as unknown as unknown as UserRow));
}

export function getUser(id: string): AdminUser | null {
  const r = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as unknown as UserRow | undefined;
  return r ? mapUser(r) : null;
}

export interface PasswordChangeResult {
  ok: boolean;
  error?: string;
}

export function changeOwnPassword(userId: string, currentPassword: string, newPassword: string): PasswordChangeResult {
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل." };
  }
  if (newPassword.length > 200) {
    return { ok: false, error: "كلمة المرور طويلة جدًا." };
  }
  const r = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(userId) as
    | { password_hash: string }
    | undefined;
  if (!r) return { ok: false, error: "المستخدم غير موجود." };
  if (!verifyPassword(currentPassword, r.password_hash)) {
    return { ok: false, error: "كلمة المرور الحالية غير صحيحة." };
  }
  getDb()
    .prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?")
    .run(hashPassword(newPassword), userId);
  // إنهاء كل الجلسات الأخرى بعد تغيير كلمة المرور
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  return { ok: true };
}

export function updateOwnProfile(
  userId: string,
  input: { displayName: string; username: string; phone: string },
): { ok: true; user: AdminUser } | { ok: false; error: string } {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as unknown as UserRow | undefined;
  if (!row) return { ok: false, error: "المستخدم غير موجود." };

  const displayName = String(input.displayName || "").trim();
  const username = String(input.username || "").trim().toLowerCase();
  const phone = String(input.phone || "").trim();

  if (!displayName) return { ok: false, error: "الاسم المعروض مطلوب." };
  if (!username || username.length < 3 || !/^[a-z0-9_.-]+$/.test(username)) {
    return { ok: false, error: "اسم المستخدم يجب أن يتكون من 3 أحرف إنجليزية أو أرقام على الأقل." };
  }
  if (!phone || normalizePhoneDigits(phone).length < 7) {
    return { ok: false, error: "يرجى إدخال رقم هاتف صحيح لربطه باستعادة كلمة المرور." };
  }

  const conflict = db
    .prepare("SELECT id FROM users WHERE lower(username) = ? AND id != ?")
    .get(username, userId) as { id: string } | undefined;
  if (conflict) {
    return { ok: false, error: "اسم المستخدم مستخدم بالفعل لحساب آخر." };
  }

  db.prepare("UPDATE users SET display_name = ?, username = ?, phone = ? WHERE id = ?").run(
    displayName,
    username,
    phone,
    userId,
  );
  audit(userId, "profile_updated", { username, displayName, phone });

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as unknown as unknown as UserRow;
  return { ok: true, user: mapUser(updated) };
}

/** هل يملك المستخدم صلاحية الوصول لتبويب معيّن؟ */
export function canAccessTab(user: AdminUser | null, tab: string): boolean {
  if (!user) return false;
  if (user.roleKey === "designer" || user.allowedTabs.includes("all")) return true;
  return user.allowedTabs.includes(tab);
}

/** صلاحية الوصول لأدوات النظام (مدير الملفات والنسخ الاحتياطي) — للإدارة والمصمّم فقط. */
export function canManageSystem(user: AdminUser | null): boolean {
  return Boolean(user && (user.roleKey === "management" || user.roleKey === "designer"));
}

export function canManageUsers(user: AdminUser | null): boolean {
  if (!user) return false;
  return user.roleKey === "designer" || user.roleKey === "management" || canAccessTab(user, "users");
}

export interface AdminUserMutationInput {
  username: string;
  displayName: string;
  phone: string;
  roleKey: string;
  roleTitle: string;
  icon?: string;
  badgeClass?: string;
  description?: string;
  allowedTabs: string[];
  canEditPrices: boolean;
  canDeleteItems: boolean;
  canExportSite: boolean;
  active: boolean;
  password?: string;
}

export function adminCreateUser(
  actor: AdminUser,
  input: AdminUserMutationInput,
): { ok: true; user: AdminUser } | { ok: false; error: string } {
  if (!canManageUsers(actor)) {
    return { ok: false, error: "ليست لديك صلاحية إدارة المستخدمين." };
  }

  const username = String(input.username || "").trim().toLowerCase();
  const displayName = String(input.displayName || "").trim();
  const phone = String(input.phone || "").trim();
  const password = String(input.password || "").trim();

  if (!displayName) return { ok: false, error: "الاسم المعروض مطلوب." };
  if (!username || username.length < 3 || !/^[a-z0-9_.-]+$/.test(username)) {
    return { ok: false, error: "اسم المستخدم يجب أن يتكون من 3 أحرف إنجليزية أو أرقام على الأقل." };
  }
  if (!phone || normalizePhoneDigits(phone).length < 7) {
    return { ok: false, error: "رقم الهاتف مطلوب لربط الحساب بخدمة استعادة كلمة المرور." };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: "كلمة المرور يجب أن لا تقل عن 6 خانات." };
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE lower(username) = ?").get(username) as { id: string } | undefined;
  if (existing) {
    return { ok: false, error: "اسم المستخدم مسجل مسبقًا، اختر اسمًا آخر." };
  }

  const id = `u_${username}_${Date.now().toString(36)}`;
  const roleKey = input.roleKey || "sales";
  const badgeDefaults: Record<string, string> = {
    designer: "bg-cyan-500 text-white",
    management: "bg-amber-500 text-slate-950",
    sales: "bg-emerald-500 text-white",
    support: "bg-purple-500 text-white",
  };
  const badgeClass = input.badgeClass || badgeDefaults[roleKey] || "bg-cyan-500 text-white";
  const icon = input.icon?.trim() || "👤";
  const tabs = input.allowedTabs.length > 0 ? input.allowedTabs : ["products", "orders", "profile"];

  db.prepare(
    `INSERT INTO users (
      id, username, display_name, phone, role_key, role_title, icon, badge_class,
      description, allowed_tabs, can_edit_prices, can_delete_items, can_export_site, active, password_hash, must_change_password
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
  ).run(
    id,
    username,
    displayName,
    phone,
    roleKey,
    input.roleTitle.trim() || displayName,
    icon,
    badgeClass,
    (input.description ?? "").trim(),
    JSON.stringify(tabs),
    input.canEditPrices ? 1 : 0,
    input.canDeleteItems ? 1 : 0,
    input.canExportSite ? 1 : 0,
    input.active ? 1 : 0,
    hashPassword(password),
  );

  audit(actor.id, "user_created", { id, username, roleKey, phone });
  const created = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as unknown as UserRow;
  return { ok: true, user: mapUser(created) };
}

export function adminUpdateUser(
  actor: AdminUser,
  targetUserId: string,
  input: AdminUserMutationInput,
): { ok: true; user: AdminUser } | { ok: false; error: string } {
  if (!canManageUsers(actor)) {
    return { ok: false, error: "ليست لديك صلاحية تعديل المستخدمين." };
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(targetUserId) as unknown as UserRow | undefined;
  if (!existing) return { ok: false, error: "المستخدم غير موجود." };

  if (existing.role_key === "designer" && actor.roleKey !== "designer") {
    return { ok: false, error: "لا يمكن تعديل حساب مصمم النظام إلا بواسطة المصمم نفسه." };
  }

  const username = String(input.username || "").trim().toLowerCase();
  const displayName = String(input.displayName || "").trim();
  const phone = String(input.phone || "").trim();

  if (!displayName) return { ok: false, error: "الاسم المعروض مطلوب." };
  if (!username || username.length < 3 || !/^[a-z0-9_.-]+$/.test(username)) {
    return { ok: false, error: "اسم المستخدم يجب أن يتكون من 3 أحرف إنجليزية أو أرقام على الأقل." };
  }
  if (!phone || normalizePhoneDigits(phone).length < 7) {
    return { ok: false, error: "رقم الهاتف مطلوب لربط الحساب بخدمة استعادة كلمة المرور." };
  }

  const conflict = db
    .prepare("SELECT id FROM users WHERE lower(username) = ? AND id != ?")
    .get(username, targetUserId) as { id: string } | undefined;
  if (conflict) {
    return { ok: false, error: "اسم المستخدم مستخدم بالفعل لحساب آخر." };
  }

  const isPrimaryDesigner = existing.id === "u_designer" || existing.id === "u-designer";
  const roleKey = isPrimaryDesigner ? "designer" : input.roleKey || existing.role_key;
  const tabs = input.allowedTabs.length > 0 ? input.allowedTabs : ["products", "orders", "profile"];
  const active = isPrimaryDesigner ? true : input.active;

  db.prepare(
    `UPDATE users
     SET username = ?, display_name = ?, phone = ?, role_key = ?, role_title = ?, icon = ?,
         description = ?, allowed_tabs = ?, can_edit_prices = ?, can_delete_items = ?,
         can_export_site = ?, active = ?
     WHERE id = ?`,
  ).run(
    username,
    displayName,
    phone,
    roleKey,
    input.roleTitle.trim() || existing.role_title,
    input.icon?.trim() || existing.icon,
    (input.description ?? existing.description ?? "").trim(),
    JSON.stringify(tabs),
    input.canEditPrices ? 1 : 0,
    input.canDeleteItems ? 1 : 0,
    input.canExportSite ? 1 : 0,
    active ? 1 : 0,
    targetUserId,
  );

  const newPassword = String(input.password || "").trim();
  if (newPassword) {
    if (newPassword.length < 6) {
      return { ok: false, error: "كلمة المرور الجديدة يجب أن لا تقل عن 6 خانات." };
    }
    db.prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?").run(
      hashPassword(newPassword),
      targetUserId,
    );
    audit(actor.id, "admin_password_reset", { targetUserId, username });
  }

  audit(actor.id, "user_updated", { targetUserId, username, phone, roleKey, active });
  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(targetUserId) as unknown as UserRow;
  return { ok: true, user: mapUser(updated) };
}

export function adminDeleteUser(
  actor: AdminUser,
  targetUserId: string,
): { ok: true } | { ok: false; error: string } {
  if (!canManageUsers(actor)) {
    return { ok: false, error: "ليست لديك صلاحية حذف المستخدمين." };
  }
  if (targetUserId === "u_designer" || targetUserId === "u-designer" || targetUserId === actor.id) {
    return { ok: false, error: "لا يمكن حذف حساب مصمم النظام الأساسي أو حسابك الحالي." };
  }
  const db = getDb();
  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(targetUserId) as unknown as UserRow | undefined;
  if (!existing) return { ok: false, error: "المستخدم غير موجود." };
  if (existing.role_key === "designer") {
    return { ok: false, error: "لا يمكن حذف حساب مصمم النظام." };
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(targetUserId);
  audit(actor.id, "user_deleted", { targetUserId, username: existing.username });
  return { ok: true };
}

/** البحث عن مستخدم عبر اسم المستخدم أو رقم الهاتف (أو كليهما). */
function findUserForRecovery(identifier: string, phoneInput?: string): UserRow | undefined {
  const db = getDb();
  const cleanId = String(identifier || "").trim().toLowerCase();
  const idDigits = normalizePhoneDigits(identifier);
  const phoneDigits = phoneInput ? normalizePhoneDigits(phoneInput) : "";

  if (cleanId) {
    const byUsername = db
      .prepare("SELECT * FROM users WHERE lower(username) = ? AND active = 1")
      .get(cleanId) as unknown as UserRow | undefined;
    if (byUsername) {
      if (phoneDigits && normalizePhoneDigits(byUsername.phone || "") !== phoneDigits) {
        return undefined;
      }
      return byUsername;
    }
  }

  const targetDigits = phoneDigits || idDigits;
  if (targetDigits.length >= 7) {
    const allActive = db.prepare("SELECT * FROM users WHERE active = 1").all() as unknown as unknown as UserRow[];
    const matches = allActive.filter((u) => normalizePhoneDigits(u.phone || "") === targetDigits);
    if (matches.length >= 1) {
      return matches[0];
    }
  }
  return undefined;
}

/**
 * طلب إرسال كود تحقق (OTP) من 6 أرقام إلى رقم الهاتف المرتبط بالمستخدم لاستعادة كلمة المرور.
 */
export async function requestPasswordResetOtp(
  identifier: string,
  phoneInput?: string,
): Promise<
  | {
      ok: true;
      username: string;
      displayName: string;
      maskedPhone: string;
      phoneDigits: string;
      expiresInMinutes: number;
      deliveryChannel: "sms_gateway" | "instant_verification";
      verificationCodePreview?: string;
    }
  | { ok: false; error: string }
> {
  const user = findUserForRecovery(identifier, phoneInput);
  if (!user) {
    return {
      ok: false,
      error: "لم يتم العثور على حساب نشط مطابق لاسم المستخدم أو رقم الهاتف المدخل.",
    };
  }

  if (!user.phone || normalizePhoneDigits(user.phone).length < 7) {
    return {
      ok: false,
      error: "هذا الحساب غير مرتبط برقم هاتف بعد. تواصل مع مصمم النظام لتحديث رقم الهاتف.",
    };
  }

  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);
  const code = String(100000 + (randomBytes[0] % 900000));
  const codeHash = hashPassword(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  const db = getDb();
  db.prepare("UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0").run(user.id);
  db.prepare(
    "INSERT INTO password_resets (user_id, phone, code_hash, attempts, expires_at, used) VALUES (?, ?, ?, 0, ?, 0)",
  ).run(user.id, user.phone, codeHash, expiresAt);

  audit(user.id, "password_reset_otp_requested", {
    username: user.username,
    maskedPhone: maskPhoneNumber(user.phone),
  });

  const settings = getSettings();
  const webhookUrl = settings.smsWebhookUrl || process.env.PRONET_SMS_WEBHOOK_URL;
  let sentViaGateway = false;
  
  if (webhookUrl) {
    try {
      const msg = `مرحباً،\nكود التحقق الخاص بك لاستعادة كلمة مرور لوحة تحكم برونت كمبيوتر لحساب (${user.username}) هو: *${code}*\n\nصالح لمدة ${OTP_TTL_MINUTES} دقائق.`;
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          to: user.phone,
          body: msg,
          message: msg,
          username: user.username,
          code: code
        }),
      });
      sentViaGateway = resp.ok;
    } catch {
      sentViaGateway = false;
    }
  }

  return {
    ok: true,
    username: user.username,
    displayName: user.display_name,
    maskedPhone: maskPhoneNumber(user.phone),
    phoneDigits: user.phone.replace(/\D+/g, ""),
    expiresInMinutes: OTP_TTL_MINUTES,
    deliveryChannel: "sms_gateway",
    verificationCodePreview: undefined,
  };
}

/**
 * التحقق من كود الـ OTP وتعيين كلمة المرور الجديدة للمستخدم.
 */
export async function verifyOtpAndResetPassword(
  identifier: string,
  otpCode: string,
  newPassword: string,
  phoneInput?: string,
): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  const cleanCode = String(otpCode || "").trim();
  if (!/^\d{6}$/.test(cleanCode)) {
    return { ok: false, error: "كود التحقق يجب أن يتكون من 6 أرقام." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "كلمة المرور الجديدة يجب أن لا تقل عن 6 خانات." };
  }

  const user = findUserForRecovery(identifier, phoneInput);
  if (!user) {
    return { ok: false, error: "بيانات الحساب غير صحيحة." };
  }

  const db = getDb();
  const resetRow = db
    .prepare(
      `SELECT * FROM password_resets
       WHERE user_id = ? AND used = 0
       ORDER BY id DESC LIMIT 1`,
    )
    .get(user.id) as
    | {
        id: number;
        user_id: string;
        phone: string;
        code_hash: string;
        attempts: number;
        expires_at: string;
        used: number;
      }
    | undefined;

  if (!resetRow) {
    return { ok: false, error: "لا يوجد طلب استعادة نشط لهذا الحساب. يرجى طلب كود تحقق جديد." };
  }

  if (new Date(resetRow.expires_at).getTime() < Date.now()) {
    db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(resetRow.id);
    return { ok: false, error: "انتهت صلاحية كود التحقق. يرجى طلب كود جديد." };
  }

  if (resetRow.attempts >= MAX_OTP_ATTEMPTS) {
    db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(resetRow.id);
    return { ok: false, error: "تم تجاوز الحد الأقصى لمحاولات إدخال الكود. يرجى طلب كود جديد." };
  }

  if (!verifyPassword(cleanCode, resetRow.code_hash)) {
    db.prepare("UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?").run(resetRow.id);
    const remaining = MAX_OTP_ATTEMPTS - (resetRow.attempts + 1);
    return {
      ok: false,
      error: remaining > 0 ? `كود التحقق غير صحيح (تبقى ${remaining} محاولات).` : "كود التحقق غير صحيح، يرجى طلب كود جديد.",
    };
  }

  const nextHash = hashPassword(newPassword);
  db.prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?").run(nextHash, user.id);
  db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(resetRow.id);
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);

  audit(user.id, "password_reset_completed", { username: user.username });

  return { ok: true, username: user.username };
}

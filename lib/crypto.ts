import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

/** يُخزّن كلمة المرور بصيغة scrypt$N$r$p$salt$hash — لا تُخزَّن كلمة المرور نصًّا أبدًا. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash.toString("hex")}`;
}

/** مقارنة بزمن ثابت لمنع هجمات توقيت الاستجابة. */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = String(stored).split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, salt, expectedHex] = parts;
  try {
    const derived = scryptSync(password, salt, KEY_LENGTH, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    const expected = Buffer.from(expectedHex, "hex");
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/** كلمة مرور قوية قابلة للقراءة والنسخ اليدوي. */
export function generatePassword(length = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;
  const bytes = randomBytes(length * 2);
  const pick = (set: string, i: number) => set[bytes[i] % set.length];
  const chars = [pick(upper, 0), pick(lower, 1), pick(digits, 2), pick(symbols, 3)];
  for (let i = 4; i < length; i++) chars.push(pick(all, i));
  // خلط بسيط بزمن ثابت
  for (let i = chars.length - 1; i > 0; i--) {
    const j = bytes[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

import fs from "node:fs";
import path from "node:path";
import { closeDb, getDb } from "./db";
import { createTar, extractTar, gzip, gunzip, type TarEntry } from "./tar";
import { BACKUP_DIR, PROJECT_ROOT, ensureDir, safeResolve } from "./files";

export type BackupKind = "db" | "full";

export interface BackupMeta {
  name: string;
  kind: BackupKind;
  size: number;
  mtime: number;
}

/** المجلدات/الملفات المستثناة من النسخ الكامل (قابلة لإعادة التوليد أو ثقيلة). */
const SKIP_NAMES = new Set(["node_modules", ".next", ".git"]);
const SKIP_RELS = new Set(["data/backups"]);

function shouldSkip(rel: string, name: string): boolean {
  if (SKIP_NAMES.has(name)) return true;
  if (SKIP_RELS.has(rel)) return true;
  // ملفات SQLite الجانبية — تُدار تلقائيًا وتُهمَل من النسخ/الاستعادة لتجنّب تلف القاعدة
  if (/^data\/pronet\.db-(wal|shm|journal)$/.test(rel)) return true;
  return false;
}

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export function isSafeBackupName(name: string): boolean {
  return /^[A-Za-z0-9._-]+\.tar\.gz$/.test(name) && !name.includes("..");
}

function backupPath(name: string): string {
  if (!isSafeBackupName(name)) throw new Error("اسم نسخة احتياطية غير صالح.");
  return path.join(BACKUP_DIR, name);
}

export function kindFromName(name: string): BackupKind {
  return name.includes("-full-") ? "full" : "db";
}

function meta(name: string): BackupMeta {
  const st = fs.statSync(backupPath(name));
  return { name, kind: kindFromName(name), size: st.size, mtime: st.mtimeMs };
}

/** يضمن تناسق قاعدة البيانات قبل قراءة ملفها. */
export function checkpointDb(): void {
  try {
    getDb().exec("PRAGMA wal_checkpoint(TRUNCATE);");
  } catch {
    // تجاهل — نكمل بالنسخ على أي حال
  }
}

function collectEntries(onlyDb: boolean): TarEntry[] {
  const entries: TarEntry[] = [];

  if (onlyDb) {
    const dbAbs = path.join(PROJECT_ROOT, "data", "pronet.db");
    if (fs.existsSync(dbAbs)) {
      const st = fs.statSync(dbAbs);
      entries.push({ name: "data/pronet.db", data: fs.readFileSync(dbAbs), mtime: st.mtimeMs, type: "file" });
    }
    return entries;
  }

  const stack: string[] = [PROJECT_ROOT];
  while (stack.length > 0) {
    const current = stack.pop()!;
    let dirents: fs.Dirent[];
    try {
      dirents = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const d of dirents) {
      const abs = path.join(current, d.name);
      const rel = path.relative(PROJECT_ROOT, abs).split(path.sep).join("/");
      if (shouldSkip(rel, d.name)) continue;
      if (d.isDirectory()) {
        entries.push({ name: rel, data: Buffer.alloc(0), type: "dir" });
        stack.push(abs);
      } else if (d.isFile()) {
        try {
          const st = fs.statSync(abs);
          entries.push({ name: rel, data: fs.readFileSync(abs), mtime: st.mtimeMs, type: "file" });
        } catch {
          // تجاهل الملفات غير القابلة للقراءة
        }
      }
    }
  }
  return entries;
}

export function createBackup(kind: BackupKind): BackupMeta {
  ensureDir(BACKUP_DIR);
  checkpointDb();

  const entries = collectEntries(kind === "db");
  const buffer = gzip(createTar(entries));

  const name = `backup-${kind}-${timestamp()}.tar.gz`;
  fs.writeFileSync(backupPath(name), buffer);
  return meta(name);
}

export function listBackups(): BackupMeta[] {
  ensureDir(BACKUP_DIR);
  const out: BackupMeta[] = [];
  for (const d of fs.readdirSync(BACKUP_DIR, { withFileTypes: true })) {
    if (!d.isFile() || !isSafeBackupName(d.name)) continue;
    try {
      out.push(meta(d.name));
    } catch {
      // تجاهل
    }
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}

export function deleteBackup(name: string): void {
  const p = backupPath(name);
  if (!fs.existsSync(p)) throw new Error("النسخة غير موجودة.");
  fs.rmSync(p, { force: true });
}

export function readBackupFile(name: string): Buffer {
  const p = backupPath(name);
  if (!fs.existsSync(p)) throw new Error("النسخة غير موجودة.");
  return fs.readFileSync(p);
}

/**
 * استعادة نسخة احتياطية.
 * - db: يستبدل ملف قاعدة البيانات فقط (مع إغلاق الاتصال أولًا).
 * - full: يستعيد ملفات المشروع (يتجاهل node_modules/.next/.git/backups).
 */
export function restoreBackup(name: string): { files: number; db: boolean } {
  const buffer = readBackupFile(name);
  const kind = kindFromName(name);
  const entries = extractTar(gunzip(buffer));

  const restoresDb = kind === "db" || entries.some((e) => e.name === "data/pronet.db" || e.name.startsWith("data/pronet.db"));
  if (restoresDb) closeDb();

  let count = 0;
  for (const entry of entries) {
    const rel = entry.name.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
    if (!rel) continue;
    if (shouldSkip(rel, path.basename(rel))) continue;

    if (kind === "db" && rel !== "data/pronet.db") continue;

    // قاعدة البيانات: نحذف الملفات المرتبطة (-wal/-shm) ثم نكتب الملف المستعاد
    if (rel === "data/pronet.db") {
      safeRemoveDb();
    }

    if (entry.type === "dir") {
      ensureDir(safeResolve(rel));
      continue;
    }

    const abs = safeResolve(rel);
    ensureDir(path.dirname(abs));
    fs.writeFileSync(abs, entry.data);
    count += 1;
  }

  return { files: count, db: restoresDb };
}

function safeRemoveDb(): void {
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    const p = path.join(PROJECT_ROOT, "data", `pronet.db${suffix}`);
    try {
      if (fs.existsSync(p)) fs.rmSync(p, { force: true });
    } catch {
      // تجاهل
    }
  }
}

/** حفظ ملف نسخة مُرفوع إلى مجلد النسخ ليظهر في القائمة. */
export function saveUploadedBackup(name: string, data: Buffer): BackupMeta {
  ensureDir(BACKUP_DIR);
  let safe = name.replace(/\\/g, "/").split("/").pop() ?? "";
  safe = safe.replace(/[^A-Za-z0-9._-]/g, "_");
  if (!/\.tar\.gz$/.test(safe)) safe = `${safe.replace(/\.(tgz|tar\.gz|gz)$/i, "")}.tar.gz`;
  if (!isSafeBackupName(safe)) safe = `backup-full-${timestamp()}.tar.gz`;
  if (fs.existsSync(path.join(BACKUP_DIR, safe))) {
    safe = safe.replace(/\.tar\.gz$/, `-${timestamp()}.tar.gz`);
  }
  fs.writeFileSync(path.join(BACKUP_DIR, safe), data);
  return meta(safe);
}


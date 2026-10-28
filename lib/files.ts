import fs from "node:fs";
import path from "node:path";

/**
 * طبقة آمنة للتعامل مع ملفات المشروع من داخل لوحة التحكم.
 * كل عملية مُقيّدة بجذر المشروع وتمنع الخروج عنه (Path Traversal) وتحمي الملفات الحرجة.
 */

export const PROJECT_ROOT = process.cwd();
export const BACKUP_DIR = path.join(PROJECT_ROOT, "data", "backups");

/** مجلدات تُخفى من العرض لأنها ثقيلة وقابلة لإعادة التوليد. */
export const HIDDEN_DIRS = new Set(["node_modules", ".next", ".git"]);

/** امتدادات الملفات النصية القابلة للتحرير داخل اللوحة. */
const TEXT_EXTENSIONS = new Set([
  "txt", "md", "json", "ts", "tsx", "js", "jsx", "mjs", "cjs", "css", "scss",
  "html", "htm", "svg", "xml", "yml", "yaml", "csv", "sql", "toml", "ini",
  "env", "example", "gitignore", "editorconfig", "conf", "sh", "bat", "ps1", "prisma",
]);

const TEXT_NAMES = new Set([".gitignore", ".env.example", ".env", ".editorconfig", "Dockerfile", "Procfile"]);

export const MAX_EDIT_BYTES = 512 * 1024; // 512KB
export const MAX_UPLOAD_BYTES = 64 * 1024 * 1024; // 64MB

export interface FileNode {
  name: string;
  rel: string;
  type: "file" | "dir";
  size: number;
  mtime: number;
  editable: boolean;
  downloadable: boolean;
}

/** يحوّل مسارًا نسبيًا إلى مسار مطلق داخل الجذر ويرفض أي خروج عنه. */
export function safeResolve(rel: string): string {
  const cleaned = String(rel ?? "")
    .replace(/\\/g, "/")
    .replace(/\0/g, "")
    .trim();

  const withoutLeading = cleaned.replace(/^\/+/, "");

  // رفض المسارات المطلقة (مثل C:\ أو //server)
  if (/^[a-zA-Z]:/.test(withoutLeading) || withoutLeading.startsWith("//")) {
    throw new Error("مسار غير مسموح به.");
  }

  const abs = path.resolve(PROJECT_ROOT, withoutLeading);
  const relToRoot = path.relative(PROJECT_ROOT, abs);

  if (relToRoot === "") return abs;
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
    throw new Error("مسار غير مسموح به.");
  }
  return abs;
}

/** المسار النسبي (بفواصل /) من جذر المشروع. */
export function relOf(abs: string): string {
  return path.relative(PROJECT_ROOT, abs).split(path.sep).join("/");
}

/** مسارات محميّة لا يمكن الكتابة/الحذف فيها من مدير الملفات. */
export function isProtected(rel: string): boolean {
  const r = String(rel ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (r === "") return true; // جذر المشروع
  if (r === "node_modules" || r.startsWith("node_modules/")) return true;
  if (r === ".next" || r.startsWith(".next/")) return true;
  if (r === ".git" || r.startsWith(".git/")) return true;
  if (r === "data/backups" || r.startsWith("data/backups/")) return true;
  if (r === "data/pronet.db" || r.startsWith("data/pronet.db")) return true; // قاعدة البيانات عبر النسخ الاحتياطي فقط
  return false;
}

export function isEditableName(name: string): boolean {
  if (TEXT_NAMES.has(name)) return true;
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  if (TEXT_EXTENSIONS.has(ext)) return true;
  // الملفات بدون امتداد (مثل LICENSE) تُعتبر نصية إن كانت صغيرة
  return !name.includes(".");
}

export function ensureDir(abs: string): void {
  fs.mkdirSync(abs, { recursive: true });
}

function toNode(abs: string): Omit<FileNode, "name"> & { name: string } {
  const st = fs.statSync(abs);
  const rel = relOf(abs);
  const base = path.basename(abs);
  const isDir = st.isDirectory();
  return {
    name: base,
    rel,
    type: isDir ? "dir" : "file",
    size: st.size,
    mtime: st.mtimeMs,
    editable: !isDir && isEditableName(base),
    downloadable: !isDir,
  };
}

export function listDir(rel: string): { dir: string; entries: FileNode[] } {
  const cleanRel = String(rel ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const abs = safeResolve(cleanRel);
  const st = fs.statSync(abs);
  if (!st.isDirectory()) throw new Error("المسار ليس مجلدًا.");

  const entries: FileNode[] = [];
  for (const d of fs.readdirSync(abs, { withFileTypes: true })) {
    const childRel = cleanRel ? `${cleanRel}/${d.name}` : d.name;
    if (HIDDEN_DIRS.has(d.name)) continue;
    if (childRel === "data/backups") continue;
    try {
      entries.push(toNode(path.join(abs, d.name)));
    } catch {
      // تجاهل العناصر غير القابلة للقراءة
    }
  }

  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name, "ar");
  });

  return { dir: cleanRel, entries };
}

export function readTextFile(rel: string): { content: string; size: number; truncated: boolean; binary: boolean } {
  const abs = safeResolve(rel);
  const st = fs.statSync(abs);
  if (!st.isFile()) throw new Error("المسار ليس ملفًا.");
  const readLen = Math.min(st.size, MAX_EDIT_BYTES);
  const buf = Buffer.alloc(readLen);
  const fd = fs.openSync(abs, "r");
  try {
    fs.readSync(fd, buf, 0, readLen, 0);
  } finally {
    fs.closeSync(fd);
  }
  const binary = buf.subarray(0, Math.min(readLen, 8000)).includes(0);
  return {
    content: buf.toString("utf8"),
    size: st.size,
    truncated: st.size > MAX_EDIT_BYTES,
    binary,
  };
}

export function writeTextFile(rel: string, content: string): void {
  if (isProtected(rel)) throw new Error("لا يمكن تعديل هذا الملف (مسار محميّ).");
  const abs = safeResolve(rel);
  if (Buffer.byteLength(content, "utf8") > MAX_EDIT_BYTES) throw new Error("حجم النص كبير جدًا للحفظ.");
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, content, "utf8");
}

export function createFolder(rel: string): string {
  const clean = String(rel ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!clean) throw new Error("اسم المجلد مطلوب.");
  if (isProtected(clean)) throw new Error("مسار محميّ.");
  const abs = safeResolve(clean);
  if (fs.existsSync(abs)) throw new Error("المجلد أو الملف موجود بالفعل.");
  ensureDir(abs);
  return clean;
}

export function saveUpload(rel: string, data: Buffer): void {
  const clean = String(rel ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!clean) throw new Error("اسم الملف مطلوب.");
  if (isProtected(clean)) throw new Error("مسار محميّ.");
  if (data.length > MAX_UPLOAD_BYTES) throw new Error("حجم الملف كبير جدًا.");
  const abs = safeResolve(clean);
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, data);
}

export function deleteEntry(rel: string): void {
  const clean = String(rel ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!clean) throw new Error("مسار غير صالح.");
  if (isProtected(clean)) throw new Error("لا يمكن حذف مسار محميّ.");
  const abs = safeResolve(clean);
  if (!fs.existsSync(abs)) throw new Error("العنصر غير موجود.");
  fs.rmSync(abs, { recursive: true, force: true });
}

export function renameEntry(rel: string, newName: string): string {
  const clean = String(rel ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!clean) throw new Error("مسار غير صالح.");
  if (isProtected(clean)) throw new Error("لا يمكن إعادة تسمية مسار محميّ.");
  const safeName = String(newName ?? "").trim().replace(/[\\/]+/g, "").replace(/\0/g, "");
  if (!safeName || safeName === "." || safeName === "..") throw new Error("اسم جديد غير صالح.");

  const abs = safeResolve(clean);
  if (!fs.existsSync(abs)) throw new Error("العنصر غير موجود.");
  const parentRel = clean.includes("/") ? clean.slice(0, clean.lastIndexOf("/")) : "";
  const targetRel = parentRel ? `${parentRel}/${safeName}` : safeName;
  if (isProtected(targetRel)) throw new Error("الاسم الجديد محميّ.");
  const targetAbs = safeResolve(targetRel);
  if (fs.existsSync(targetAbs)) throw new Error("يوجد عنصر بنفس الاسم.");
  fs.renameSync(abs, targetAbs);
  return targetRel;
}

export function fileStat(rel: string): { size: number; mtime: number; isFile: boolean; name: string; ext: string } {
  const abs = safeResolve(rel);
  const st = fs.statSync(abs);
  const base = path.basename(abs);
  return {
    size: st.size,
    mtime: st.mtimeMs,
    isFile: st.isFile(),
    name: base,
    ext: base.includes(".") ? base.split(".").pop()!.toLowerCase() : "",
  };
}

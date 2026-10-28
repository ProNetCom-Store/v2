import zlib from "node:zlib";

/**
 * تطبيق مصغّر لصيغة TAR (ustar + GNU longname) مع ضغط gzip —
 * بلا أي مكتبات خارجية، ويعمل على Windows وLinux.
 * يُستخدم لأخذ نسخ احتياطية/استعادتها داخل لوحة التحكم.
 */

const BLOCK = 512;

export interface TarEntry {
  /** مسار نسبي بفواصل مائلة للأمام (/) وبلا شرطة بادئة. */
  name: string;
  data: Buffer;
  mode?: number;
  mtime?: number;
  type?: "file" | "dir";
}

function writeString(buf: Buffer, str: string, offset: number, length: number): void {
  const bytes = Buffer.from(str, "utf8");
  bytes.copy(buf, offset, 0, Math.min(bytes.length, length));
}

function readString(buf: Buffer, offset: number, length: number): string {
  const slice = buf.subarray(offset, offset + length);
  const end = slice.indexOf(0);
  const real = end === -1 ? slice : slice.subarray(0, end);
  return real.toString("utf8");
}

function padOctal(value: number, length: number): Buffer {
  const buf = Buffer.alloc(length, 0);
  const safe = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  const str = safe.toString(8).padStart(length - 1, "0").slice(-(length - 1));
  buf.write(str, 0, "ascii");
  buf[length - 1] = 0;
  return buf;
}

/** تقسيم اسم طويل إلى prefix (155) + name (100) كما في ustar. */
function splitName(full: string): { prefix: string; name: string } | null {
  if (Buffer.byteLength(full, "utf8") <= 100) return { prefix: "", name: full };
  const parts = full.split("/");
  for (let i = parts.length - 1; i > 0; i--) {
    const prefix = parts.slice(0, i).join("/");
    const name = parts.slice(i).join("/");
    if (Buffer.byteLength(prefix, "utf8") <= 155 && Buffer.byteLength(name, "utf8") <= 100) {
      return { prefix, name };
    }
  }
  return null;
}

function buildHeader(name: string, size: number, mode: number, mtime: number, typeflag: string): Buffer {
  const buf = Buffer.alloc(BLOCK, 0);
  let nm = name;
  let prefix = "";
  const split = splitName(name);
  if (split) {
    nm = split.name;
    prefix = split.prefix;
  } else {
    nm = name.slice(-100);
  }

  writeString(buf, nm, 0, 100);
  padOctal(mode, 8).copy(buf, 100);
  padOctal(0, 8).copy(buf, 108);
  padOctal(0, 8).copy(buf, 116);
  padOctal(size, 12).copy(buf, 124);
  padOctal(mtime, 12).copy(buf, 136);
  buf.fill(0x20, 148, 156); // مسافة مؤقتة لحساب المجموع
  buf.write(typeflag, 156, 1, "ascii");
  buf.write("ustar", 257, 6, "ascii");
  buf[262] = 0;
  buf.write("00", 263, 2, "ascii");
  writeString(buf, "pronet", 265, 32);
  writeString(buf, "pronet", 297, 32);
  writeString(buf, prefix, 345, 155);

  let sum = 0;
  for (let i = 0; i < BLOCK; i++) sum += buf[i];
  buf.write(sum.toString(8).padStart(6, "0").slice(-6), 148, 6, "ascii");
  buf[154] = 0;
  buf[155] = 0x20;
  return buf;
}

function padTo512(len: number): number {
  return (BLOCK - (len % BLOCK)) % BLOCK;
}

export function createTar(entries: TarEntry[]): Buffer {
  const chunks: Buffer[] = [];

  for (const entry of entries) {
    const mtime = Math.floor((entry.mtime ?? Date.now()) / 1000);
    const isDir = entry.type === "dir";
    const mode = entry.mode ?? (isDir ? 0o755 : 0o644);
    let name = entry.name.replace(/\\/g, "/").replace(/^\/+/, "");
    if (isDir) name = name.replace(/\/+$/, "") + "/";

    // الأسماء الطويلة جدًا التي لا يقبلها ustar تُكتب عبر امتداد GNU LongName
    if (Buffer.byteLength(name, "utf8") > 100 && !splitName(name)) {
      const longData = Buffer.concat([Buffer.from(name, "utf8"), Buffer.from([0])]);
      chunks.push(buildHeader("././@LongLink", longData.length, 0o644, mtime, "L"));
      chunks.push(longData, Buffer.alloc(padTo512(longData.length)));
    }

    if (isDir) {
      chunks.push(buildHeader(name, 0, mode, mtime, "5"));
    } else {
      const data = entry.data;
      chunks.push(buildHeader(name, data.length, mode, mtime, "0"));
      chunks.push(data, Buffer.alloc(padTo512(data.length)));
    }
  }

  chunks.push(Buffer.alloc(BLOCK * 2));
  return Buffer.concat(chunks);
}

export interface ExtractedEntry {
  name: string;
  data: Buffer;
  type: "file" | "dir";
  mode: number;
  mtime: number;
}

export function extractTar(buffer: Buffer): ExtractedEntry[] {
  const out: ExtractedEntry[] = [];
  let offset = 0;
  let pendingLongName: string | null = null;

  while (offset + BLOCK <= buffer.length) {
    const block = buffer.subarray(offset, offset + BLOCK);
    offset += BLOCK;

    let allZero = true;
    for (let i = 0; i < BLOCK; i++) {
      if (block[i] !== 0) {
        allZero = false;
        break;
      }
    }
    if (allZero) break;

    const rawName = readString(block, 0, 100);
    const size = parseInt(readString(block, 124, 12).trim() || "0", 8);
    const mode = parseInt(readString(block, 100, 8).trim() || "0", 8);
    const mtime = parseInt(readString(block, 136, 12).trim() || "0", 8);
    const typeflag = String.fromCharCode(block[156]);
    const prefix = readString(block, 345, 155);

    let name = prefix ? `${prefix}/${rawName}` : rawName;
    if (pendingLongName !== null) {
      name = pendingLongName;
      pendingLongName = null;
    }

    const dataLen = Number.isFinite(size) && size > 0 ? size : 0;
    const data = buffer.subarray(offset, offset + dataLen);
    offset += dataLen + padTo512(dataLen);

    if (typeflag === "L") {
      pendingLongName = data.toString("utf8").replace(/\0+$/, "");
      continue;
    }

    const cleanName = name.replace(/\\/g, "/").replace(/^\/+/, "");

    if (typeflag === "5" || cleanName.endsWith("/")) {
      out.push({ name: cleanName.replace(/\/+$/, ""), data: Buffer.alloc(0), type: "dir", mode, mtime });
      continue;
    }
    if (typeflag === "0" || typeflag === "\0" || typeflag === "") {
      out.push({ name: cleanName, data: Buffer.from(data), type: "file", mode, mtime });
    }
    // الأنواع الأخرى (روابط رمزية وأجهزة) تُتجاهل لأسباب أمنية
  }

  return out;
}

export function gzip(buffer: Buffer): Buffer {
  return zlib.gzipSync(buffer, { level: 9 });
}

export function gunzip(buffer: Buffer): Buffer {
  return zlib.gunzipSync(buffer);
}

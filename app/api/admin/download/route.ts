import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { canManageSystem, getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import { BACKUP_DIR, safeResolve } from "@/lib/files";
import { isSafeBackupName } from "@/lib/backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  json: "application/json; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  xml: "application/xml; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  ico: "image/x-icon",
  pdf: "application/pdf",
  gz: "application/gzip",
  zip: "application/zip",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  ts: "text/plain; charset=utf-8",
};

function contentType(name: string): string {
  if (name.endsWith(".tar.gz")) return "application/gzip";
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

/** تعقيم اسم الملف في ترويسة التنزيل. */
function asciiName(name: string): string {
  return name.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageSystem(user)) {
    return NextResponse.json({ ok: false, error: "غير مصرّح." }, { status: 403 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "file";

  let abs: string;
  let name: string;

  try {
    if (type === "backup") {
      const backupName = url.searchParams.get("name") ?? "";
      if (!isSafeBackupName(backupName)) {
        return NextResponse.json({ ok: false, error: "اسم غير صالح." }, { status: 400 });
      }
      abs = path.join(BACKUP_DIR, backupName);
      name = backupName;
    } else {
      const rel = url.searchParams.get("path") ?? "";
      abs = safeResolve(rel);
      name = path.basename(abs);
    }
  } catch {
    return NextResponse.json({ ok: false, error: "مسار غير صالح." }, { status: 400 });
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(abs);
  } catch {
    return NextResponse.json({ ok: false, error: "الملف غير موجود." }, { status: 404 });
  }
  if (!stat.isFile()) {
    return NextResponse.json({ ok: false, error: "المسار ليس ملفًا." }, { status: 400 });
  }

  const data = fs.readFileSync(abs);
  audit(user.id, "file_download", { name, type });

  const bytes = new Uint8Array(data);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType(name),
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename="${asciiName(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "no-store",
    },
  });
}

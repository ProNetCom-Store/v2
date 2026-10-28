"use server";

import { revalidatePath } from "next/cache";
import { canManageSystem, requireUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import {
  MAX_UPLOAD_BYTES,
  createFolder,
  deleteEntry,
  renameEntry,
  saveUpload,
  writeTextFile,
} from "@/lib/files";

function s(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function guard(): void {
  revalidatePath("/admin/files");
}

export async function saveFileAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const rel = s(fd, "path");
  const content = String(fd.get("content") ?? "");
  if (!rel) return;
  writeTextFile(rel, content);
  audit(user.id, "file_edit", { path: rel, bytes: Buffer.byteLength(content, "utf8") });
  guard();
}

export async function createFolderAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const parent = s(fd, "parent");
  const name = s(fd, "name").replace(/[\\/]+/g, "").replace(/\0/g, "");
  if (!name) return;
  const rel = parent ? `${parent.replace(/\/+$/, "")}/${name}` : name;
  createFolder(rel);
  audit(user.id, "folder_create", { path: rel });
  guard();
}

export async function deleteEntryAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const rel = s(fd, "path");
  if (!rel) return;
  deleteEntry(rel);
  audit(user.id, "file_delete", { path: rel });
  guard();
}

export async function renameEntryAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const rel = s(fd, "path");
  const newName = s(fd, "newName");
  if (!rel || !newName) return;
  const target = renameEntry(rel, newName);
  audit(user.id, "file_rename", { from: rel, to: target });
  guard();
}

export async function uploadFilesAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const dir = s(fd, "dir");
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const saved: string[] = [];
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) continue;
    const base = file.name.replace(/[\\/]+/g, "").replace(/\0/g, "").trim();
    if (!base) continue;
    const rel = dir ? `${dir.replace(/\/+$/, "")}/${base}` : base;
    const buffer = Buffer.from(await file.arrayBuffer());
    saveUpload(rel, buffer);
    saved.push(rel);
  }
  if (saved.length > 0) audit(user.id, "file_upload", { files: saved });
  guard();
}

"use server";

import { revalidatePath } from "next/cache";
import { canManageSystem, requireUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import {
  createBackup,
  deleteBackup,
  restoreBackup,
  saveUploadedBackup,
  type BackupKind,
} from "@/lib/backup";

function s(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function createBackupAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const kind: BackupKind = s(fd, "kind") === "db" ? "db" : "full";
  const result = createBackup(kind);
  audit(user.id, "backup_create", { name: result.name, kind, size: result.size });
  revalidatePath("/admin/backups");
}

export async function deleteBackupAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const name = s(fd, "name");
  if (!name) return;
  deleteBackup(name);
  audit(user.id, "backup_delete", { name });
  revalidatePath("/admin/backups");
}

export async function restoreBackupAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const name = s(fd, "name");
  if (!name) return;
  const result = restoreBackup(name);
  audit(user.id, "backup_restore", { name, files: result.files, db: result.db });
  revalidatePath("/admin/backups");
  revalidatePath("/", "layout");
}

export async function uploadBackupAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageSystem(user)) return;
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = saveUploadedBackup(file.name, buffer);
  audit(user.id, "backup_upload", { name: result.name, size: result.size });
  revalidatePath("/admin/backups");
}

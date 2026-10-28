import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  adminCreateUser,
  adminDeleteUser,
  adminUpdateUser,
  canManageUsers,
  getCurrentUser,
  listUsers,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user)) {
    return NextResponse.json({ ok: false, error: "غير مصرّح." }, { status: 403 });
  }
  return NextResponse.json({ ok: true, users: listUsers() });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user)) {
    return NextResponse.json({ ok: false, error: "غير مصرّح." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة." }, { status: 400 });
  }

  const res = adminCreateUser(user, {
    username: String(body.username ?? ""),
    displayName: String(body.displayName ?? ""),
    phone: String(body.phone ?? ""),
    roleKey: String(body.roleKey ?? "sales"),
    roleTitle: String(body.roleTitle ?? ""),
    icon: String(body.icon ?? "👤"),
    description: String(body.description ?? ""),
    allowedTabs: Array.isArray(body.allowedTabs) ? body.allowedTabs.map(String) : ["products", "orders", "profile"],
    canEditPrices: Boolean(body.canEditPrices),
    canDeleteItems: Boolean(body.canDeleteItems),
    canExportSite: Boolean(body.canExportSite),
    active: body.active !== false,
    password: String(body.password ?? ""),
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true, user: res.user, users: listUsers() });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user)) {
    return NextResponse.json({ ok: false, error: "غير مصرّح." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة." }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "معرّف المستخدم مطلوب." }, { status: 400 });
  }

  const res = adminUpdateUser(user, id, {
    username: String(body.username ?? ""),
    displayName: String(body.displayName ?? ""),
    phone: String(body.phone ?? ""),
    roleKey: String(body.roleKey ?? "sales"),
    roleTitle: String(body.roleTitle ?? ""),
    icon: String(body.icon ?? "👤"),
    description: String(body.description ?? ""),
    allowedTabs: Array.isArray(body.allowedTabs) ? body.allowedTabs.map(String) : ["products", "orders", "profile"],
    canEditPrices: Boolean(body.canEditPrices),
    canDeleteItems: Boolean(body.canDeleteItems),
    canExportSite: Boolean(body.canExportSite),
    active: body.active !== false,
    password: body.password ? String(body.password) : undefined,
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true, user: res.user, users: listUsers() });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user)) {
    return NextResponse.json({ ok: false, error: "غير مصرّح." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") ?? "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "معرّف المستخدم مطلوب." }, { status: 400 });
  }

  const res = adminDeleteUser(user, id);
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }
  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true, users: listUsers() });
}

import { canManageUsers, listUsers, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { AdminUsersManager } from "@/components/admin-users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireUser();
  const users = listUsers();
  const canEdit = canManageUsers(me);

  return (
    <div className="space-y-6">
      <AdminUsersManager initialUsers={users} currentUser={me} canEdit={canEdit} />

      <div className="panel p-5">
        <h2 className="text-base font-black text-ink">سجل التدقيق (آخر 20 عملية)</h2>
        <AuditList />
      </div>
    </div>
  );
}

function AuditList() {
  const rows = getDb()
    .prepare("SELECT user_id, action, details, created_at FROM admin_audit ORDER BY id DESC LIMIT 20")
    .all() as Array<{ user_id: string | null; action: string; details: string | null; created_at: string }>;

  if (rows.length === 0) {
    return <p className="mt-3 text-sm text-ink-muted">لا توجد عمليات مسجّلة بعد.</p>;
  }

  return (
    <ul className="mt-3 space-y-1.5 text-xs">
      {rows.map((r, i) => (
        <li key={i} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-1.5">
          <span className="font-mono text-ink-soft" dir="ltr">
            {r.action}
          </span>
          <span className="text-ink-muted" dir="ltr">
            {r.created_at}
          </span>
        </li>
      ))}
    </ul>
  );
}

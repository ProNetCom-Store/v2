import { canAccessTab, requireUser } from "@/lib/auth";
import { getBankAccounts } from "@/lib/queries";
import { ContentManager, type FieldDef } from "@/components/content-manager";
import { deleteBankAction, saveBankAction } from "../actions";

export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "bankName", label: "اسم البنك أو طريقة الدفع", type: "text" },
  { name: "accountHolder", label: "اسم صاحب الحساب", type: "text" },
  { name: "badge", label: "شارة البنك (اختياري)", type: "text", placeholder: "مثال: فوري ومعتمد" },
  { name: "badgeColor", label: "لون الشارة", type: "select", options: [
      { value: "cyan", label: "أزرق" },
      { value: "emerald", label: "أخضر" },
      { value: "amber", label: "برتقالي" },
      { value: "rose", label: "أحمر" },
  ]},
  { name: "accounts", label: "بيانات الحسابات (JSON)", type: "textarea", rows: 4, wide: true, help: 'يجب إدخالها بصيغة JSON، مثال: [{"label": "حساب دولار", "number": "123456"}]' },
  { name: "sort", label: "الترتيب", type: "number" },
  { name: "colSpan2", label: "عرض عريض (يأخذ مساحة بطاقتين)", type: "checkbox" },
];

export default async function AdminBanksPage() {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية إدارة الحسابات البنكية.</p>;
  }
  
  const banks = getBankAccounts();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">الحسابات البنكية وطرق الدفع</h1>
        <p className="mt-1 text-sm text-ink-muted">تحكّم في الحسابات البنكية المعروضة في صفحة تواصل معنا وسلة المشتريات.</p>
      </header>

      <ContentManager
        items={banks}
        fields={FIELDS}
        saveAction={saveBankAction}
        deleteAction={deleteBankAction}
        newDefaults={{ sort: banks.length, colSpan2: false, badgeColor: "cyan", accounts: "[]" }}
        titleField="bankName"
        addLabel="إضافة حساب بنكي"
        emptyLabel="لا توجد حسابات بنكية مضافة."
        deleteConfirm="هل أنت متأكد من حذف هذا الحساب؟"
      />
    </div>
  );
}

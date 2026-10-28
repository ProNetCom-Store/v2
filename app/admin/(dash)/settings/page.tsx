import { canAccessTab, requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { saveSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

function Text({
  name,
  label,
  value,
  dir,
  help,
  placeholder,
  wide,
  en,
}: {
  name: string;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
  help?: string;
  placeholder?: string;
  wide?: boolean;
  en?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <label htmlFor={name} className="mb-1 block text-xs font-bold text-ink-muted">
        {label}
        {en ? <span className="ms-2 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-black text-brand-strong">EN</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        defaultValue={value}
        dir={dir}
        placeholder={placeholder}
        className="input-base text-sm"
      />
      {help ? <p className="mt-1 text-[11px] text-ink-muted">{help}</p> : null}
    </div>
  );
}

function Area({
  name,
  label,
  value,
  rows = 4,
  wide,
  en,
  help,
}: {
  name: string;
  label: string;
  value: string;
  rows?: number;
  wide?: boolean;
  en?: boolean;
  help?: string;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <label htmlFor={name} className="mb-1 block text-xs font-bold text-ink-muted">
        {label}
        {en ? <span className="ms-2 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-black text-brand-strong">EN</span> : null}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={value} className="input-base text-sm" />
      {help ? <p className="mt-1 text-[11px] text-ink-muted">{help}</p> : null}
    </div>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="panel p-4">
      <legend className="px-2 text-sm font-black text-brand-strong">{title}</legend>
      <div className="mt-2 grid gap-3 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default async function AdminSettingsPage() {
  const user = await requireUser();
  if (!canAccessTab(user, "settings")) {
    return <p className="panel p-8 text-center text-sm text-ink-muted">لا تملك صلاحية تعديل الإعدادات.</p>;
  }

  const st = getSettings();
  const socialsText = (Array.isArray(st.socialLinks) ? st.socialLinks : [])
    .map((l) => `${l.icon}|${l.label}|${l.url}`)
    .join("\n");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-ink">إعدادات الموقع والمتجر</h1>
        <p className="mt-1 text-sm text-ink-muted">
          تحكّم شامل في الهوية الرسمية، معلومات الشركة، ريادتنا التقنية، شريط الماركات، المظهر والعملات، والقنوات
          الرسمية. تُحفظ التغييرات على الخادم فورًا.
        </p>
      </header>

      <form action={saveSettingsAction} className="space-y-5">
        <Fieldset title="هويتنا الرسمية ومعلومات الشركة">
          <Text name="brandName" label="اسم الشركة (عربي)" value={st.brandName} />
          <Text name="brandNameEn" label="اسم الشركة (إنجليزي)" value={st.brandNameEn} en />
          <Text name="slogan" label="الشعار النصي (عربي)" value={st.slogan} wide />
          <Text name="sloganEn" label="الشعار النصي (إنجليزي)" value={st.sloganEn} en wide />
          <Text name="announcement" label="الشريط الإعلاني (عربي)" value={st.announcement} wide />
          <Text name="announcementEn" label="الشريط الإعلاني (إنجليزي)" value={st.announcementEn} en wide />
          <Text name="ceoName" label="اسم القيادة" value={st.ceoName} />
          <Text name="ceoTitle" label="المسمّى (عربي)" value={st.ceoTitle} />
          <Text name="ceoTitleEn" label="المسمّى (إنجليزي)" value={st.ceoTitleEn} en />
          <Text name="email" label="البريد الإلكتروني" value={st.email} dir="ltr" />
          <Text name="address" label="العنوان (عربي)" value={st.address} wide />
          <Text name="addressEn" label="العنوان (إنجليزي)" value={st.addressEn} en wide />
          <Text name="workingHours" label="ساعات العمل (عربي)" value={st.workingHours} />
          <Text name="workingHoursEn" label="ساعات العمل (إنجليزي)" value={st.workingHoursEn} en />
          <Text name="footerNote" label="ملاحظة التذييل (عربي)" value={st.footerNote} wide />
          <Text name="footerNoteEn" label="ملاحظة التذييل (إنجليزي)" value={st.footerNoteEn} en wide />
          <Text name="mapUrl" label="رابط الخريطة (اختياري)" value={st.mapUrl} dir="ltr" wide />
        </Fieldset>

        <Fieldset title="ريادتنا التقنية">
          <Text name="identityTitle" label="عنوان «هويتنا الرسمية» (عربي)" value={st.identityTitle} />
          <Text name="identityTitleEn" label="العنوان (إنجليزي)" value={st.identityTitleEn} en />
          <Area name="identityText" label="نص الهوية الرسمية (عربي)" value={st.identityText} wide />
          <Area name="identityTextEn" label="نص الهوية الرسمية (إنجليزي)" value={st.identityTextEn} en wide />
          <Text name="visionTitle" label="عنوان «ريادتنا التقنية» (عربي)" value={st.visionTitle} />
          <Text name="visionTitleEn" label="العنوان (إنجليزي)" value={st.visionTitleEn} en />
          <Area name="visionText" label="نص الريادة التقنية (عربي)" value={st.visionText} wide />
          <Area name="visionTextEn" label="نص الريادة التقنية (إنجليزي)" value={st.visionTextEn} en wide />
        </Fieldset>

        <Fieldset title="شريط الماركات والوكلاء">
          <Text name="brandBarTitle" label="عنوان الشريط (عربي)" value={st.brandBarTitle} />
          <Text name="brandBarTitleEn" label="عنوان الشريط (إنجليزي)" value={st.brandBarTitleEn} en />
          <Text name="brandBarSubtitle" label="وصف الشريط (عربي)" value={st.brandBarSubtitle} wide />
          <Text name="brandBarSubtitleEn" label="وصف الشريط (إنجليزي)" value={st.brandBarSubtitleEn} en wide />
        </Fieldset>

        <Fieldset title="مقدّمة الصفحة الرئيسية (احتياطية)">
          <Text name="heroBadge" label="الشارة (عربي)" value={st.heroBadge} />
          <Text name="heroBadgeEn" label="الشارة (إنجليزي)" value={st.heroBadgeEn} en />
          <Text name="heroTitle" label="العنوان (عربي)" value={st.heroTitle} />
          <Text name="heroTitleEn" label="العنوان (إنجليزي)" value={st.heroTitleEn} en />
          <Area name="heroSubtitle" label="الوصف (عربي)" value={st.heroSubtitle} wide rows={3} />
          <Area name="heroSubtitleEn" label="الوصف (إنجليزي)" value={st.heroSubtitleEn} en wide rows={3} />
        </Fieldset>

        <Fieldset title="المظهر والعملات وسعر الصرف">
          <div>
            <label htmlFor="defaultTheme" className="mb-1 block text-xs font-bold text-ink-muted">
              الوضع الافتراضي
            </label>
            <select id="defaultTheme" name="defaultTheme" defaultValue={st.defaultTheme} className="input-base text-sm">
              <option value="dark">ليلي (Dark)</option>
              <option value="light">نهاري (Light)</option>
            </select>
          </div>
          <div>
            <label htmlFor="defaultCurrency" className="mb-1 block text-xs font-bold text-ink-muted">
              العملة الافتراضية
            </label>
            <select
              id="defaultCurrency"
              name="defaultCurrency"
              defaultValue={st.defaultCurrency}
              className="input-base text-sm"
            >
              <option value="USD">دولار أمريكي $</option>
              <option value="YER">ريال يمني</option>
              <option value="SAR">ريال سعودي</option>
            </select>
          </div>
          <div>
            <label htmlFor="rateYER" className="mb-1 block text-xs font-bold text-ink-muted">
              سعر صرف الدولار مقابل الريال اليمني
            </label>
            <input
              id="rateYER"
              name="rateYER"
              type="number"
              step="any"
              defaultValue={st.rateYER}
              className="input-base text-sm"
            />
          </div>
          <div>
            <label htmlFor="rateSAR" className="mb-1 block text-xs font-bold text-ink-muted">
              سعر صرف الدولار مقابل الريال السعودي
            </label>
            <input
              id="rateSAR"
              name="rateSAR"
              type="number"
              step="any"
              defaultValue={st.rateSAR}
              className="input-base text-sm"
            />
          </div>
          <div>
            <label htmlFor="primaryColor" className="mb-1 block text-xs font-bold text-ink-muted">
              اللون الأساسي
            </label>
            <input id="primaryColor" name="primaryColor" type="color" defaultValue={st.primaryColor} className="input-base h-11 text-sm" />
            <p className="mt-1 text-[11px] text-ink-muted">يُطبّق في الوضع الليلي (يحفظ تباين الوضع النهاري).</p>
          </div>
          <div>
            <label htmlFor="secondaryColor" className="mb-1 block text-xs font-bold text-ink-muted">
              اللون الثانوي
            </label>
            <input id="secondaryColor" name="secondaryColor" type="color" defaultValue={st.secondaryColor} className="input-base h-11 text-sm" />
          </div>
          <div>
            <label htmlFor="navyColor" className="mb-1 block text-xs font-bold text-ink-muted">
              لون الخلفية الداكنة
            </label>
            <input id="navyColor" name="navyColor" type="color" defaultValue={st.navyColor} className="input-base h-11 text-sm" />
            <p className="mt-1 text-[11px] text-ink-muted">يُطبّق في الوضع الليلي فقط حفاظًا على تباين الوضع النهاري.</p>
          </div>
          <label className="flex items-center gap-2 self-end text-sm font-bold text-ink-soft">
            <input type="checkbox" name="showPricesGlobal" defaultChecked={st.showPricesGlobal} className="h-4 w-4" />
            إظهار الأسعار في المتجر
          </label>
        </Fieldset>

        <Fieldset title="قنوات التواصل والروابط الاجتماعية">
          <Text name="landline" label="هاتف المعرض" value={st.landline} dir="ltr" />
          <Text name="smsWebhookUrl" label="رابط API للواتساب (OTP)" value={st.smsWebhookUrl} dir="ltr" wide help="أدخل رابط API الخاص بخدمة الواتساب (مثل UltraMsg) لإرسال رسائل استعادة كلمة المرور التلقائية." />
          <Text name="whatsappNumber" label="واتساب المبيعات الرئيسي" value={st.whatsappNumber} dir="ltr" />
          <Text name="secondarySalesWhatsapp" label="واتساب المبيعات الثانوي" value={st.secondarySalesWhatsapp} dir="ltr" />
          <Text name="mgmtWhatsapp1" label="واتساب الإدارة (1)" value={st.mgmtWhatsapp1} dir="ltr" />
          <Text name="mgmtWhatsapp2" label="واتساب الإدارة (2)" value={st.mgmtWhatsapp2} dir="ltr" />
          <Area
            name="socialLinks"
            label="الروابط الاجتماعية"
            value={socialsText}
            wide
            rows={5}
            help="سطر لكل رابط بالصيغة: أيقونة|الاسم|الرابط — مثال: فيسبوك|فيسبوك|https://facebook.com/pronet"
          />
        </Fieldset>

        <div className="sticky bottom-3 flex justify-end">
          <button type="submit" className="btn-primary text-sm shadow-2xl">
            💾 حفظ كل الإعدادات
          </button>
        </div>
      </form>
    </div>
  );
}

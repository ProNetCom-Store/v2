"use client";

/**
 * نموذج بسيط يعمل داخل مكوّنات الخادم مع نافذة تأكيد قبل الإرسال.
 * (لا يمكن تمرير معالجات الأحداث مباشرةً من مكوّنات الخادم، لذا هذا الغلاف العميل ضروري.)
 */
export function ConfirmForm({
  action,
  message,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </form>
  );
}

import { CartClient } from "@/components/cart-client";
import { getBankAccounts, getSettings } from "@/lib/queries";
import { getServerLocale } from "@/lib/server-locale";

export default async function CartPage() {
  const { dict } = await getServerLocale();
  const settings = getSettings();
  const bankAccounts = getBankAccounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-ink">{dict.cart.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{dict.cart.pageIntro}</p>
      </header>

      <CartClient bankAccounts={bankAccounts} whatsappNumber={settings.whatsappNumber} />
    </div>
  );
}

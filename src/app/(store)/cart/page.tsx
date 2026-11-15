import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Cart" };

export default async function Page() {
  const settings = await getSettings();
  return <CartPage freeShippingAt={settings.freeShippingAt} shippingFee={settings.shippingFee} />;
}

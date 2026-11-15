import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getUserById } from "@/lib/users";
import type { AddressDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  let email = "";
  let addresses: AddressDTO[] = [];
  try {
    const session = await auth();
    email = session?.user?.email || "";
    if (session?.user?.id) {
      const user = await getUserById(session.user.id);
      addresses = (user?.addresses ?? []).map((address) => ({
        id: address.id,
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      }));
    }
  } catch {
    addresses = [];
  }

  const settings = await getSettings();

  return (
    <CheckoutForm
      email={email}
      addresses={addresses}
      freeShippingAt={settings.freeShippingAt}
      razorpayEnabled={Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)}
    />
  );
}

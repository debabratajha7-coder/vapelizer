"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { placeCodOrder, quoteCart } from "@/lib/actions/store";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import { INDIAN_STATES } from "@/lib/states";
import { buttonClass, buttonDarkClass, fieldClass } from "@/lib/styles";
import type { AddressDTO, Quote } from "@/lib/types";

type Details = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

const empty: Details = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "Delhi",
  pincode: "",
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({
  razorpayEnabled,
  email,
  addresses,
  freeShippingAt,
}: {
  razorpayEnabled: boolean;
  email: string;
  addresses: AddressDTO[];
  freeShippingAt: number;
}) {
  const cart = useCart();
  const router = useRouter();
  const [details, setDetails] = useState<Details>({ ...empty, email });
  const [method, setMethod] = useState<"cod" | "razorpay">(razorpayEnabled ? "razorpay" : "cod");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const lines = useMemo(
    () =>
      cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        flavor: item.flavor,
        strength: item.strength,
      })),
    [cart.items],
  );
  const lineKey = JSON.stringify(lines);

  useEffect(() => {
    if (!cart.hydrated || !lines.length) return;
    let active = true;
    quoteCart(lines).then((result) => {
      if (!active) return;
      setQuote(result.quote);
      setError(result.error);
    });
    return () => {
      active = false;
    };
  }, [cart.hydrated, lineKey, lines]);

  function update(key: keyof Details, value: string) {
    setDetails((current) => ({ ...current, [key]: value }));
  }

  async function placeCod() {
    setPending(true);
    setError("");
    const result = await placeCodOrder({ lines, customer: details });
    setPending(false);
    if (result.error || !result.orderNumber || !result.accessToken) {
      setError(result.error || "Could not place the order.");
      return;
    }
    cart.clear();
    router.push(`/order/${result.orderNumber}?token=${result.accessToken}`);
    router.refresh();
  }

  async function placeRazorpay() {
    setPending(true);
    setError("");
    const response = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, customer: details }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setPending(false);
      setError(payload.error || "Could not start payment.");
      return;
    }
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setPending(false);
      setError("Razorpay checkout could not be loaded.");
      return;
    }
    const checkout = new window.Razorpay({
      key: payload.keyId,
      amount: payload.amount,
      currency: "INR",
      name: "Vapelizer",
      description: "Order",
      order_id: payload.razorpayOrderId,
      prefill: { name: details.name, email: details.email, contact: details.phone },
      theme: { color: "#e23d2b" },
      handler: async (payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verify = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payment, lines, customer: details }),
        });
        const order = await verify.json();
        setPending(false);
        if (!verify.ok) {
          setError(order.error || "Payment was received but the order could not be saved. Contact us with your payment id.");
          return;
        }
        cart.clear();
        router.push(`/order/${order.orderNumber}?token=${order.accessToken}`);
        router.refresh();
      },
      modal: { ondismiss: () => setPending(false) },
    });
    checkout.open();
  }

  if (!cart.hydrated) return <p className="px-4 py-16 text-muted">Loading your cart…</p>;
  if (!cart.items.length) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-muted">Your cart is empty.</p>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (method === "cod") placeCod();
          else placeRazorpay();
        }}
      >
        <h1 className="font-display text-4xl">Checkout</h1>
        {addresses.length > 0 ? (
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Saved address</span>
            <select
              className={fieldClass}
              defaultValue=""
              onChange={(event) => {
                const found = addresses.find((address) => address.id === event.target.value);
                if (!found) return;
                setDetails((current) => ({ ...current, ...found, email: current.email || email }));
              }}
            >
              <option value="">Enter a new address</option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.name}, {address.city}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={details.name} onChange={(value) => update("name", value)} />
          <Field label="Email" type="email" value={details.email} onChange={(value) => update("email", value)} />
          <Field label="Mobile" value={details.phone} onChange={(value) => update("phone", value)} />
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">State</span>
            <select className={fieldClass} value={details.state} onChange={(event) => update("state", event.target.value)}>
              {INDIAN_STATES.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </label>
        </div>
        <Field label="Address" value={details.line1} onChange={(value) => update("line1", value)} />
        <Field label="Apartment, landmark (optional)" value={details.line2} onChange={(value) => update("line2", value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" value={details.city} onChange={(value) => update("city", value)} />
          <Field label="PIN code" value={details.pincode} onChange={(value) => update("pincode", value)} />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Payment</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
            Cash on delivery
          </label>
          {razorpayEnabled ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} />
              Pay online with Razorpay
            </label>
          ) : (
            <p className="text-xs text-muted">Online payment appears here after Razorpay keys are added.</p>
          )}
        </fieldset>
        {error ? <p className="text-sm text-ember">{error}</p> : null}
        <button className={method === "cod" ? buttonDarkClass : buttonClass} disabled={pending || !quote}>
          {pending ? "Placing order" : method === "cod" ? "Place COD order" : "Pay now"}
        </button>
      </form>
      <aside className="h-fit rounded-3xl border border-line bg-white p-6">
        <h2 className="font-display text-2xl">Order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {(quote?.lines ?? []).map((line) => (
            <li key={`${line.productId}-${line.flavor}-${line.strength}`} className="flex justify-between gap-3">
              <span>
                {line.name} × {line.quantity}
                {[line.flavor, line.strength].filter(Boolean).length ? (
                  <span className="block text-xs text-muted">{[line.flavor, line.strength].filter(Boolean).join(" · ")}</span>
                ) : null}
              </span>
              <span>{formatPrice(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
        {quote ? (
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(quote.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{quote.shipping === 0 ? "Free" : formatPrice(quote.shipping)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(quote.total)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted">Checking stock and prices…</p>
        )}
        <p className="mt-4 text-xs text-muted">Free shipping on orders of {formatPrice(freeShippingAt)} and above.</p>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input className={fieldClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={label !== "Apartment, landmark (optional)"} />
    </label>
  );
}

"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice, shippingFor } from "@/lib/format";
import { buttonClass } from "@/lib/styles";

export function CartPage({ freeShippingAt, shippingFee }: { freeShippingAt: number; shippingFee: number }) {
  const cart = useCart();
  const shipping = shippingFor(cart.subtotal, freeShippingAt, shippingFee);

  if (!cart.hydrated) return <p className="px-4 py-16 text-muted">Loading your cart…</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl">Cart</h1>
      {cart.items.length === 0 ? (
        <p className="mt-6 text-muted">
          Nothing here yet. <Link href="/shop" className="font-semibold text-ink">Browse the shop</Link>
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          {cart.items.map((item) => (
            <div key={item.key} className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <Link href={`/product/${item.slug}`} className="font-medium">
                  {item.name}
                </Link>
                <p className="text-xs text-muted">{[item.flavor, item.strength].filter(Boolean).join(" · ")}</p>
              </div>
              <input
                type="number"
                min={1}
                max={10}
                value={item.quantity}
                onChange={(event) => cart.setQuantity(item.key, Number(event.target.value))}
                className="w-16 rounded-lg border border-line px-2 py-1"
              />
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              <button className="text-sm text-ember" onClick={() => cart.removeItem(item.key)}>
                Remove
              </button>
            </div>
          ))}
          <div className="space-y-1 text-sm">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </p>
            <p className="text-xs text-muted">Free over {formatPrice(freeShippingAt)}.</p>
          </div>
          <Link href="/checkout" className={buttonClass}>
            Checkout
          </Link>
        </div>
      )}
    </div>
  );
}

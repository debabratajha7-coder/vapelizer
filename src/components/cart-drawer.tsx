"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart-provider";

export function CartDrawer() {
  const cart = useCart();
  if (!cart.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-[#141210]/50" aria-label="Close cart" onClick={cart.closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">Your cart</h2>
          <button onClick={cart.closeCart} className="text-sm font-semibold text-muted">
            Close
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-auto px-5 py-4">
          {cart.items.length === 0 ? (
            <p className="text-sm text-muted">Your cart is empty. Browse the shop and add a device or a bottle.</p>
          ) : (
            cart.items.map((item) => (
              <div key={item.key} className="flex gap-3 border-b border-line pb-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-sand" />
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-medium">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {[item.flavor, item.strength].filter(Boolean).join(" · ") || "Standard"}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-muted">
                      Qty
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={item.quantity}
                        onChange={(event) => cart.setQuantity(item.key, Number(event.target.value))}
                        className="w-14 rounded-lg border border-line bg-white px-2 py-1 text-ink"
                      />
                    </label>
                    <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <button className="mt-1 text-xs text-ember" onClick={() => cart.removeItem(item.key)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-line px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className={`block rounded-full px-4 py-3 text-center text-sm font-semibold text-white ${cart.items.length ? "bg-ember" : "pointer-events-none bg-muted"}`}
          >
            Checkout
          </Link>
          <Link href="/cart" className="mt-2 block text-center text-sm font-semibold">
            View cart
          </Link>
        </div>
      </aside>
    </div>
  );
}

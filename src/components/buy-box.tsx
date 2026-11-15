"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { buttonClass } from "@/lib/styles";
import { sceneFor } from "@/components/stamp-frame";
import type { ProductDTO } from "@/lib/types";

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active ? "border-ink bg-ink text-paper" : "border-line bg-white/80 text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function BuyBox({ product }: { product: ProductDTO }) {
  const { addItem } = useCart();
  const [flavor, setFlavor] = useState(product.flavors[0] || "");
  const [strength, setStrength] = useState(product.nicotineStrengths[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const max = Math.min(10, product.stock);

  return (
    <div className="space-y-5">
      {product.flavors.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Flavor</p>
          <div className="flex flex-wrap gap-2">
            {product.flavors.map((option) => (
              <Chip key={option} active={flavor === option} onClick={() => setFlavor(option)}>
                {option}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
      {product.nicotineStrengths.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Strength</p>
          <div className="flex flex-wrap gap-2">
            {product.nicotineStrengths.map((option) => (
              <Chip key={option} active={strength === option} onClick={() => setStrength(option)}>
                {option}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Quantity</p>
        <div className="inline-flex items-center rounded-full border border-line bg-white">
          <button type="button" className="px-3 py-1.5 text-lg leading-none" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
            −
          </button>
          <span className="min-w-6 text-center text-sm">{quantity}</span>
          <button
            type="button"
            className="px-3 py-1.5 text-lg leading-none"
            disabled={product.stock < 1 || quantity >= max}
            onClick={() => setQuantity((value) => Math.min(max, value + 1))}
          >
            +
          </button>
        </div>
      </div>
      <button
        className={`${buttonClass} w-full sm:w-auto`}
        disabled={product.stock < 1}
        onClick={() => {
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.effectivePrice,
            image: product.images[0]?.url || sceneFor(product),
            flavor,
            strength,
            quantity,
          });
          setAdded(true);
        }}
      >
        {product.stock < 1 ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
      </button>
      {product.stock > 0 && product.stock <= 5 ? <p className="text-sm text-ember">Only {product.stock} left.</p> : null}
    </div>
  );
}

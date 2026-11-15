"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { PriceTag, Stars } from "@/components/price";
import { sceneFocus, sceneFor, StampPhoto } from "@/components/stamp-frame";
import type { ProductDTO } from "@/lib/types";

export function ProductVisual({ product, className = "" }: { product: Pick<ProductDTO, "name" | "brand" | "images" | "categorySlug">; className?: string }) {
  return (
    <StampPhoto
      src={sceneFor(product)}
      focus={sceneFocus(product.name)}
      alt={product.name}
      className={className}
    />
  );
}

export function ProductCard({ product }: { product: ProductDTO }) {
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const [added, setAdded] = useState(false);
  const needsOptions = product.flavors.length > 1 || product.nicotineStrengths.length > 1;
  const saved = wishlist.has(product.id);

  return (
    <article className="flex flex-col">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          <ProductVisual product={product} />
        </Link>
        <button
          type="button"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => wishlist.toggle(product.id)}
          className="absolute right-[12%] top-[12%] grid h-8 w-8 place-items-center rounded-full bg-paper/90 text-sm shadow-sm"
        >
          <span className={saved ? "text-ember" : "text-ink"}>{saved ? "♥" : "♡"}</span>
        </button>
        {product.salePrice ? (
          <span className="absolute left-[12%] top-[12%] rounded-full bg-paper/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ember">
            Sale
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-2 pt-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{product.brand || "Vapelizer"}</p>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 font-display text-xl leading-tight tracking-tight">
          {product.name}
        </Link>
        <Stars rating={product.rating} />
        {product.puffCount ? <p className="text-xs text-muted">{product.puffCount.toLocaleString("en-IN")} puffs</p> : null}
        <div className="mt-1 flex items-end justify-between gap-2">
          <PriceTag price={product.price} salePrice={product.salePrice} />
          {needsOptions ? (
            <Link href={`/product/${product.slug}`} className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper">
              Choose
            </Link>
          ) : (
            <button
              type="button"
              disabled={product.stock < 1}
              onClick={() => {
                addItem({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.effectivePrice,
                  image: product.images[0]?.url || sceneFor(product),
                  flavor: product.flavors[0] || "",
                  strength: product.nicotineStrengths[0] || "",
                });
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1200);
              }}
              className="shrink-0 rounded-full bg-moss px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-40"
            >
              {product.stock < 1 ? "Sold out" : added ? "Added" : "Add"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

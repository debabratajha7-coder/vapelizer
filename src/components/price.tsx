import { formatPrice } from "@/lib/format";

export function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <p className="text-xs tracking-wide text-[#c48a16]" aria-label={`Rated ${rating} out of 5`}>
      {"★★★★★".slice(0, filled)}
      <span className="text-[#ddd4c8]">{"★★★★★".slice(filled)}</span>
      <span className="ml-1 text-muted">{rating.toFixed(1)}</span>
    </p>
  );
}

export function PriceTag({ price, salePrice }: { price: number; salePrice: number | null }) {
  if (!salePrice) return <p className="text-base font-semibold">{formatPrice(price)}</p>;
  return (
    <p className="flex items-baseline gap-2">
      <span className="text-base font-semibold">{formatPrice(salePrice)}</span>
      <span className="text-sm text-muted line-through">{formatPrice(price)}</span>
    </p>
  );
}

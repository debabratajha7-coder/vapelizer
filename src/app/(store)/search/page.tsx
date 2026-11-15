import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/page-header";
import { load, searchProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { data, error } = await load(() => searchProducts(q));

  return (
    <div>
      <PageHeader title="Search" lede={q ? `Results for “${q}”` : "Type a device, brand, or flavor."} />
      <form action="/search" className="mx-auto max-w-6xl px-4 pt-6">
        <input name="q" defaultValue={q} className="w-full rounded-full border border-line bg-white px-4 py-3" placeholder="Search" />
      </form>
      {error ? <p className="mx-auto max-w-6xl px-4 py-8 text-muted">{error}</p> : null}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 lg:grid-cols-4">
        {(data ?? []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!error && q && data && data.length === 0 ? <p className="px-4 pb-10 text-center text-muted">No matches.</p> : null}
    </div>
  );
}

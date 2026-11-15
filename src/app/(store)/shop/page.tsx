import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/page-header";
import { getAllProducts, load } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const { data, error } = await load(getAllProducts);
  if (error) return <p className="mx-auto max-w-6xl px-4 py-16 text-muted">{error}</p>;
  const products = data ?? [];

  return (
    <div>
      <PageHeader title="Shop" lede="Disposables, salts, liquids, pods, and kits." />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 px-4 py-8 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

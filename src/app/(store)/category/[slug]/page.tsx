import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/page-header";
import { getProductsForCategorySlug, load } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await load(() => getProductsForCategorySlug(slug));
  if (error) return <p className="mx-auto max-w-6xl px-4 py-16 text-muted">{error}</p>;
  if (!data) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Category"
        title={data.category.name}
        lede={data.products.length ? `${data.products.length} products` : "Nothing in this category yet."}
      />
      {data.category.children.length > 0 ? (
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pt-6">
          {data.category.children.map((child) => (
            <Link key={child.id} href={`/category/${child.slug}`} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm">
              {child.name}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 px-4 py-8 lg:grid-cols-4">
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

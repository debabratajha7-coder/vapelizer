import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { ProductCard, ProductVisual } from "@/components/product-card";
import { PriceTag, Stars } from "@/components/price";
import { PhotoWithHole, sceneFocus, sceneFor } from "@/components/stamp-frame";
import { getProductBySlug, getRelatedProducts, load } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await load(() => getProductBySlug(slug));
  return { title: data?.name || "Product", description: data?.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await load(() => getProductBySlug(slug));
  if (error) return <p className="mx-auto max-w-6xl px-4 py-16 text-muted">{error}</p>;
  if (!data) notFound();
  const related = await load(() => getRelatedProducts(data.categoryId, data.id));
  const photo = sceneFor(data);

  return (
    <div className="pb-8">
      <div className="px-3 pt-3 md:hidden">
        <ProductVisual product={data} className="mx-auto w-[88%]" />
      </div>

      <section className="hidden px-5 pt-4 md:block">
        <PhotoWithHole src={photo} focus={sceneFocus(data.name)}>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{data.brand || "Vapelizer"}</p>
          <h1 className="mt-2 font-display text-4xl leading-[0.95] tracking-tight">{data.name}</h1>
          <div className="mt-3">
            <Stars rating={data.rating} />
          </div>
          <div className="mt-3 text-xl">
            <PriceTag price={data.price} salePrice={data.salePrice} />
          </div>
          {data.puffCount ? <p className="mt-2 text-sm text-muted">{data.puffCount.toLocaleString("en-IN")} puffs</p> : null}
        </PhotoWithHole>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
        <div>
          <p className="text-sm text-muted">
            <Link href="/shop">Shop</Link>
            {data.categorySlug ? (
              <>
                {" / "}
                <Link href={`/category/${data.categorySlug}`}>{data.categoryName}</Link>
              </>
            ) : null}
          </p>
          <div className="mt-4 md:hidden">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{data.brand}</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight">{data.name}</h1>
            <div className="mt-3">
              <Stars rating={data.rating} />
            </div>
            <div className="mt-3 text-2xl">
              <PriceTag price={data.price} salePrice={data.salePrice} />
            </div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{data.description}</p>
        </div>
        <div className="rounded-[1.6rem] border border-line bg-white/50 p-5 md:p-7">
          <BuyBox product={data} />
        </div>
      </div>

      {related.data && related.data.length > 0 ? (
        <section className="mx-auto mt-4 max-w-6xl px-5">
          <h2 className="font-display text-4xl tracking-tight">Alongside it</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

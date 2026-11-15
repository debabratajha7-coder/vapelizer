import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin-forms";
import { deleteProduct, removeProductImage } from "@/lib/actions/admin";
import { getCategoryOptions, getProductById } from "@/lib/catalog";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategoryOptions()]);
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl">Edit product</h1>
      {product.images.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {product.images.map((image) => (
            <form key={image.url} action={removeProductImage} className="w-28">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="publicId" value={image.publicId} />
              <input type="hidden" name="url" value={image.url} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-28 w-28 rounded-xl object-cover" />
              <button className="mt-1 text-xs text-ember">Remove</button>
            </form>
          ))}
        </div>
      ) : null}
      <ProductForm categories={categories} product={product} />
      <form action={deleteProduct}>
        <input type="hidden" name="id" value={product.id} />
        <button className="text-sm font-semibold text-ember">Delete product</button>
      </form>
    </div>
  );
}

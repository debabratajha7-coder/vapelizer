import { ProductForm } from "@/components/admin-forms";
import { getCategoryOptions } from "@/lib/catalog";

export default async function NewProductPage() {
  const categories = await getCategoryOptions();
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}

import Link from "next/link";
import { deleteProduct } from "@/lib/actions/admin";
import { getAllProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export default async function ProductsAdminPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white">
          New product
        </Link>
      </div>
      <div className="mt-6 overflow-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-medium">
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted">{product.brand}</p>
                </td>
                <td className="px-4 py-3">{formatPrice(product.effectivePrice)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">{product.featured ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/products/${product.id}`} className="text-sm font-medium">
                      Edit
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" className="text-sm font-medium text-ember">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getAllProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getAllOrders } from "@/lib/orders";
import { storageConfigured } from "@/lib/storage";

export default async function AdminHome() {
  const [products, orders] = await Promise.all([getAllProducts(), getAllOrders()]);
  const low = products.filter((product) => product.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 6);
  const pending = orders.filter((order) => order.status === "pending").length;
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const cards = [
    ["Products", products.length],
    ["Orders", orders.length],
    ["Pending", pending],
    ["Low stock", low.length],
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        Razorpay {process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? "is ready" : "is off, so checkout stays cash on delivery"}.
        Cloudinary {storageConfigured() ? "can take uploads" : "needs keys before image upload will work"}.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
            <p className="mt-2 font-display text-4xl">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm">Open orders total {formatPrice(revenue)}, excluding cancelled.</p>
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Low stock</h2>
          <Link href="/admin/products" className="text-sm font-semibold text-ember">
            All products
          </Link>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {low.map((product) => (
            <li key={product.id}>
              <Link href={`/admin/products/${product.id}`} className="font-medium">
                {product.name}
              </Link>
              <span className="text-muted"> · {product.stock} left</span>
            </li>
          ))}
          {low.length === 0 ? <li className="text-muted">Nothing is running low.</li> : null}
        </ul>
      </div>
    </div>
  );
}

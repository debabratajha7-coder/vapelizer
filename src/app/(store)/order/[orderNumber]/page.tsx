import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getOrderByNumber, serializeOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string; phone?: string }>;
}) {
  const { orderNumber } = await params;
  const { token, phone } = await searchParams;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const session = await auth();
  const owns = Boolean(session?.user?.id && order.userId && order.userId === session.user.id);
  const allowed = owns || (token && token === order.accessToken) || (phone && phone === order.phone);
  if (!allowed) notFound();

  const view = serializeOrder(order);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">{view.status}</p>
      <h1 className="mt-2 font-display text-4xl">{view.orderNumber}</h1>
      <p className="mt-2 text-sm text-muted">
        {view.paymentMethod === "cod" ? "Cash on delivery" : "Paid online"} · {formatPrice(view.total)}
      </p>
      {view.trackingCode ? <p className="mt-2 text-sm">Tracking: {view.trackingCode}</p> : null}
      <ul className="mt-8 space-y-3">
        {view.items.map((item) => (
          <li key={`${item.slug}-${item.flavor}-${item.strength}`} className="flex justify-between gap-4 border-b border-line pb-3 text-sm">
            <span>
              <Link href={`/product/${item.slug}`} className="font-medium">
                {item.name}
              </Link>
              <span className="block text-xs text-muted">
                {[item.flavor, item.strength].filter(Boolean).join(" · ")} × {item.quantity}
              </span>
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-sm text-muted">
        <p>{view.address.name}</p>
        <p>
          {view.address.line1}
          {view.address.line2 ? `, ${view.address.line2}` : ""}
        </p>
        <p>
          {view.address.city}, {view.address.state} {view.address.pincode}
        </p>
        <p>{view.address.phone}</p>
      </div>
    </div>
  );
}

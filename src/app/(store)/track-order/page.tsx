import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { fieldClass, buttonClass } from "@/lib/styles";
import { findOrderByNumberAndPhone } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Track order" };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string; phone?: string }> }) {
  const { order = "", phone = "" } = await searchParams;
  let found = null as Awaited<ReturnType<typeof findOrderByNumberAndPhone>>;
  let error = "";

  if (order && phone) {
    try {
      found = await findOrderByNumberAndPhone(order.trim(), phone.trim());
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Could not look up the order.";
    }
  }

  return (
    <div>
      <PageHeader title="Track an order" lede="Use the order number from your confirmation and the mobile number on the delivery address." />
      <form className="mx-auto grid max-w-xl gap-4 px-4 py-10" action="/track-order">
        <label className="text-sm">
          Order number
          <input name="order" defaultValue={order} required className={`${fieldClass} mt-1.5`} placeholder="VP…" />
        </label>
        <label className="text-sm">
          Mobile
          <input name="phone" defaultValue={phone} required className={`${fieldClass} mt-1.5`} />
        </label>
        <button className={`${buttonClass} w-fit`}>Look up</button>
      </form>
      <div className="mx-auto max-w-xl px-4 pb-12 text-sm">
        {error ? <p className="text-ember">{error}</p> : null}
        {order && phone && !error && !found ? <p className="text-muted">No order matches that number and phone.</p> : null}
        {found ? (
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold">{found.orderNumber}</p>
            <p className="mt-1 capitalize text-muted">{found.status}</p>
            <p className="mt-1">{formatPrice(found.total)}</p>
            {found.trackingCode ? <p className="mt-1">Tracking: {found.trackingCode}</p> : null}
            <Link href={`/order/${found.orderNumber}?phone=${found.phone}`} className="mt-3 inline-block font-semibold text-ember">
              View details
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

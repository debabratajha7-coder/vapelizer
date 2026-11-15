import { updateOrderStatus } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/format";
import { getAllOrders } from "@/lib/orders";
import type { OrderStatus } from "@/lib/records";

const statuses: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default async function OrdersAdminPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="font-display text-4xl">Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.length === 0 ? <p className="text-sm text-muted">No orders yet.</p> : null}
        {orders.map((order) => (
          <form
            key={order.id}
            action={updateOrderStatus}
            className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto] md:items-end"
          >
            <input type="hidden" name="id" value={order.id} />
            <div>
              <p className="font-semibold">{order.orderNumber}</p>
              <p className="text-xs text-muted">
                {order.address?.name} · {order.phone} · {order.paymentMethod.toUpperCase()} · {formatPrice(order.total)}
              </p>
              <p className="mt-1 text-xs text-muted">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
            </div>
            <label className="text-xs">
              Status
              <select name="status" defaultValue={order.status} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm">
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              Tracking
              <input name="trackingCode" defaultValue={order.trackingCode} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" />
            </label>
            <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Update</button>
          </form>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AddressForm } from "@/components/address-form";
import { ProductCard } from "@/components/product-card";
import { SignOutButton } from "@/components/sign-out-button";
import { deleteAddress, saveProfile } from "@/lib/actions/store";
import { auth } from "@/lib/auth";
import { getProductsByIds } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getOrdersForUser } from "@/lib/orders";
import { buttonGhostClass, fieldClass } from "@/lib/styles";
import { INDIAN_STATES } from "@/lib/states";
import { getUserById } from "@/lib/users";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");

  const [orders, wishlist] = await Promise.all([
    getOrdersForUser(user.id),
    getProductsByIds(user.wishlist),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Hello, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-muted">{user.email}</p>
          <form action={saveProfile} className="mt-4 flex max-w-md gap-2">
            <input name="name" defaultValue={user.name} minLength={2} required className={fieldClass} />
            <button className={buttonGhostClass}>Save</button>
          </form>
        </div>
        <SignOutButton />
      </div>

      <section>
        <h2 className="font-display text-3xl">Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderNumber} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/order/${order.orderNumber}`} className="font-semibold">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-muted">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : ""}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{order.status}</td>
                    <td className="px-4 py-3 uppercase">{order.paymentMethod}</td>
                    <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-3xl">Addresses</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {user.addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-line bg-white p-4 text-sm">
              <p className="font-semibold">{address.name}</p>
              <p className="mt-1 text-muted">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
              </p>
              <p className="text-muted">{address.phone}</p>
              <form action={deleteAddress} className="mt-3">
                <input type="hidden" name="id" value={address.id} />
                <button className="text-sm text-ember">Remove</button>
              </form>
            </div>
          ))}
          <AddressForm states={[...INDIAN_STATES]} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl">Wishlist</h2>
        {wishlist.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Save products with the heart on a card. Guests keep a list on this device until they sign in.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import type { CategoryNode, StoreUser } from "@/lib/types";

export function Header({
  categories,
  user,
  storeName,
  promoText,
  searchPlaceholder,
}: {
  categories: CategoryNode[];
  user: StoreUser | null;
  storeName: string;
  promoText: string;
  searchPlaceholder: string;
}) {
  const cart = useCart();
  const wishlist = useWishlist();
  const [mobile, setMobile] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 text-ink backdrop-blur-md">
      <p className="bg-ink px-4 py-2 text-center text-[11px] font-medium tracking-[0.14em] text-paper">
        {promoText}
      </p>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
        <button className="md:hidden" aria-label="Open menu" onClick={() => setMobile(true)}>
          <span className="block h-0.5 w-5 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-5 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-5 bg-ink" />
        </button>
        <Link href="/" className="font-display text-2xl tracking-tight">
          {storeName}
        </Link>
        <form action="/search" className="hidden min-w-0 flex-1 md:block">
          <label className="sr-only" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            name="q"
            placeholder={searchPlaceholder}
            className="w-full rounded-full border border-line bg-white/70 px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink"
          />
        </form>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          {user ? (
            <Link href="/account" className="hidden sm:inline">
              {user.name?.split(" ")[0] || "Account"}
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:inline">
              Login / Register
            </Link>
          )}
          <Link href="/account" aria-label="Wishlist" className="relative">
            ♡
            {wishlist.count > 0 ? (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-ember px-1 text-[10px]">
                {wishlist.count}
              </span>
            ) : null}
          </Link>
          <button className="relative" aria-label="Open cart" onClick={cart.openCart}>
            Cart
            <span className="ml-1 rounded-full bg-ink px-1.5 text-xs font-semibold text-paper">{cart.count}</span>
          </button>
        </nav>
      </div>
      <div className="hidden border-t border-line md:block">
        <ul className="mx-auto flex max-w-6xl gap-6 px-4 text-sm">
          <li>
            <Link href="/shop" className="block py-3 text-ink/70 hover:text-ink">
              Shop
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id} className="group relative">
              <Link href={`/category/${category.slug}`} className="block py-3 text-ink/70 hover:text-ink">
                {category.name}
              </Link>
              {category.children.length > 0 ? (
                <div className="invisible absolute left-0 top-full z-20 min-w-56 rounded-2xl border border-line bg-paper p-3 text-ink opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                  {category.children.map((child) => (
                    <Link key={child.id} href={`/category/${child.slug}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-sand">
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      {mobile ? (
        <div className="fixed inset-0 z-50 bg-paper text-ink md:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <p className="font-display text-2xl">Menu</p>
            <button onClick={() => setMobile(false)}>Close</button>
          </div>
          <form action="/search" className="px-4">
            <input name="q" placeholder={searchPlaceholder} className="w-full rounded-full bg-white px-4 py-2.5 text-ink" />
          </form>
          <div className="mt-4 space-y-1 overflow-auto px-2 pb-10">
            <Link href="/shop" className="block rounded-xl px-3 py-3" onClick={() => setMobile(false)}>
              Shop all
            </Link>
            {categories.map((category) => (
              <div key={category.id}>
                <button
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left"
                  onClick={() => setOpenSlug((current) => (current === category.slug ? null : category.slug))}
                >
                  {category.name}
                  <span>{openSlug === category.slug ? "−" : "+"}</span>
                </button>
                {openSlug === category.slug ? (
                  <div className="pb-2 pl-4">
                    <Link href={`/category/${category.slug}`} className="block px-3 py-2 text-muted" onClick={() => setMobile(false)}>
                      All {category.name}
                    </Link>
                    {category.children.map((child) => (
                      <Link key={child.id} href={`/category/${child.slug}`} className="block px-3 py-2 text-muted" onClick={() => setMobile(false)}>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {user ? (
              <button className="block px-3 py-3" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            ) : (
              <Link href="/login" className="block px-3 py-3" onClick={() => setMobile(false)}>
                Login / Register
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

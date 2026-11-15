"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  flavor: string;
  strength: string;
};

type AddInput = Omit<CartItem, "key" | "quantity"> & { quantity?: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vapelizer-cart";
const EMPTY: CartItem[] = [];

let cachedRaw = "";
let cachedItems: CartItem[] = EMPTY;

function subscribe(callback: () => void) {
  window.addEventListener("vapelizer-cart", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("vapelizer-cart", callback);
    window.removeEventListener("storage", callback);
  };
}

function readCart() {
  const raw = localStorage.getItem(STORAGE_KEY) || "[]";
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    cachedItems = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function writeCart(items: CartItem[]) {
  const raw = JSON.stringify(items);
  cachedRaw = raw;
  cachedItems = items;
  localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event("vapelizer-cart"));
}

function itemKey(item: { productId: string; flavor: string; strength: string }) {
  return `${item.productId}|${item.flavor}|${item.strength}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      items,
      count,
      subtotal,
      open,
      hydrated,
      openCart: () => setOpenPath(pathname),
      closeCart: () => setOpenPath(null),
      addItem: (item) => {
        const key = itemKey(item);
        const quantity = item.quantity ?? 1;
        const current = readCart();
        const existing = current.find((entry) => entry.key === key);
        const next = existing
          ? current.map((entry) =>
              entry.key === key ? { ...entry, quantity: Math.min(10, entry.quantity + quantity) } : entry,
            )
          : [...current, { ...item, key, quantity, flavor: item.flavor || "", strength: item.strength || "" }];
        writeCart(next);
        setOpenPath(pathname);
      },
      setQuantity: (key, quantity) => {
        const current = readCart();
        writeCart(
          quantity <= 0
            ? current.filter((item) => item.key !== key)
            : current.map((item) => (item.key === key ? { ...item, quantity: Math.min(10, quantity) } : item)),
        );
      },
      removeItem: (key) => writeCart(readCart().filter((item) => item.key !== key)),
      clear: () => writeCart([]),
    };
  }, [hydrated, items, open, pathname]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

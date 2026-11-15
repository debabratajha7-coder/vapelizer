"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { syncWishlist, toggleWishlist } from "@/lib/actions/store";

type WishlistContextValue = {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "vapelizer-wishlist";
const EMPTY: string[] = [];

let cachedRaw = "";
let cachedIds: string[] = EMPTY;

function subscribe(callback: () => void) {
  window.addEventListener("vapelizer-wishlist", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("vapelizer-wishlist", callback);
    window.removeEventListener("storage", callback);
  };
}

function readIds() {
  const raw = localStorage.getItem(STORAGE_KEY) || "[]";
  if (raw === cachedRaw) return cachedIds;
  cachedRaw = raw;
  try {
    const parsed = JSON.parse(raw) as string[];
    cachedIds = Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : EMPTY;
  } catch {
    cachedIds = EMPTY;
  }
  return cachedIds;
}

function writeIds(ids: string[]) {
  const raw = JSON.stringify(ids);
  cachedRaw = raw;
  cachedIds = ids;
  localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event("vapelizer-wishlist"));
}

export function WishlistProvider({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const localIds = useSyncExternalStore(subscribe, readIds, () => EMPTY);
  const [serverIds, setServerIds] = useState<string[] | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    syncWishlist(readIds()).then((next) => {
      if (!active) return;
      writeIds([]);
      setServerIds(next);
    });
    return () => {
      active = false;
    };
  }, [signedIn]);

  const ids = signedIn && serverIds ? serverIds : localIds;

  function toggle(id: string) {
    if (!signedIn) {
      const current = readIds();
      writeIds(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
      return;
    }
    const previous = ids;
    setServerIds(previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
    toggleWishlist(id)
      .then(setServerIds)
      .catch(() => setServerIds(previous));
  }

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, has: (id) => ids.includes(id), toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}

export const FREE_SHIPPING_AT = 1999;
export const SHIPPING_FEE = 99;

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function shippingFor(subtotal: number, freeAt = FREE_SHIPPING_AT, fee = SHIPPING_FEE) {
  if (subtotal <= 0 || subtotal >= freeAt) return 0;
  return fee;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function safeCallback(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

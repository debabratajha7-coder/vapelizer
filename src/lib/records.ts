import type { ImageRef } from "@/lib/types";

export type AddressRecord = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  wishlist: string[];
  addresses: AddressRecord[];
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  image: ImageRef | null;
};

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  salePrice: number | null;
  puffCount: number | null;
  nicotineStrengths: string[];
  flavors: string[];
  stock: number;
  images: ImageRef[];
  featured: boolean;
  rating: number;
  description: string;
  searchText: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerRecord = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  tone: "dark" | "light";
  image: ImageRef | null;
  active: boolean;
  sortOrder: number;
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type OrderItemRecord = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  flavor: string;
  strength: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  accessToken: string;
  userId: string | null;
  email: string;
  phone: string;
  items: OrderItemRecord[];
  subtotal: number;
  shipping: number;
  total: number;
  address: Omit<AddressRecord, "id">;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "unpaid" | "paid";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: OrderStatus;
  trackingCode: string;
  createdAt: string;
};

export type ImageRef = {
  url: string;
  publicId: string;
};

export type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  puffCount: number | null;
  nicotineStrengths: string[];
  flavors: string[];
  stock: number;
  images: ImageRef[];
  featured: boolean;
  rating: number;
  description: string;
};

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  image: ImageRef | null;
  children: CategoryNode[];
};

export type CategoryOption = {
  id: string;
  label: string;
};

export type BannerDTO = {
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

export type StoreUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "customer" | "admin";
};

export type AddressDTO = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type CartLineInput = {
  productId: string;
  quantity: number;
  flavor?: string;
  strength?: string;
};

export type PricedLine = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  flavor: string;
  strength: string;
  lineTotal: number;
};

export type Quote = {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItemDTO = {
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  flavor: string;
  strength: string;
};

export type OrderDTO = {
  id: string;
  orderNumber: string;
  email: string;
  phone: string;
  items: OrderItemDTO[];
  subtotal: number;
  shipping: number;
  total: number;
  address: {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  trackingCode: string;
  createdAt: string;
};

export type ActionState = {
  error: string;
  ok?: boolean;
};

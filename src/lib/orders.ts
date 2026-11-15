import { randomBytes } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { shippingFor } from "@/lib/format";
import { db } from "@/lib/firebase-admin";
import { getSettings } from "@/lib/settings";
import type { OrderRecord, OrderStatus } from "@/lib/records";
import type { CartLineInput, CustomerDetails, OrderDTO, PricedLine, Quote } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export function isOrderStatus(value: string): value is OrderStatus {
  return STATUSES.includes(value as OrderStatus);
}

function asOrder(id: string, data: FirebaseFirestore.DocumentData): OrderRecord {
  return {
    id,
    orderNumber: String(data.orderNumber || ""),
    accessToken: String(data.accessToken || ""),
    userId: data.userId ? String(data.userId) : null,
    email: String(data.email || ""),
    phone: String(data.phone || ""),
    items: Array.isArray(data.items)
      ? data.items.map((item: Record<string, unknown>) => ({
          productId: String(item.productId || ""),
          name: String(item.name || ""),
          slug: String(item.slug || ""),
          image: String(item.image || ""),
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 0),
          flavor: String(item.flavor || ""),
          strength: String(item.strength || ""),
        }))
      : [],
    subtotal: Number(data.subtotal || 0),
    shipping: Number(data.shipping || 0),
    total: Number(data.total || 0),
    address: {
      name: String(data.address?.name || ""),
      phone: String(data.address?.phone || ""),
      line1: String(data.address?.line1 || ""),
      line2: String(data.address?.line2 || ""),
      city: String(data.address?.city || ""),
      state: String(data.address?.state || ""),
      pincode: String(data.address?.pincode || ""),
    },
    paymentMethod: data.paymentMethod === "razorpay" ? "razorpay" : "cod",
    paymentStatus: data.paymentStatus === "paid" ? "paid" : "unpaid",
    razorpayOrderId: String(data.razorpayOrderId || ""),
    razorpayPaymentId: String(data.razorpayPaymentId || ""),
    status: isOrderStatus(String(data.status || "pending")) ? (data.status as OrderStatus) : "pending",
    trackingCode: String(data.trackingCode || ""),
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || String(data.createdAt || new Date().toISOString()),
  };
}

export function serializeOrder(doc: OrderRecord): OrderDTO {
  return {
    id: doc.id,
    orderNumber: doc.orderNumber,
    email: doc.email,
    phone: doc.phone,
    items: (doc.items ?? []).map((item) => ({
      name: item.name,
      slug: item.slug,
      image: item.image || "",
      price: item.price,
      quantity: item.quantity,
      flavor: item.flavor || "",
      strength: item.strength || "",
    })),
    subtotal: doc.subtotal,
    shipping: doc.shipping,
    total: doc.total,
    address: {
      name: doc.address?.name || "",
      phone: doc.address?.phone || "",
      line1: doc.address?.line1 || "",
      line2: doc.address?.line2 || "",
      city: doc.address?.city || "",
      state: doc.address?.state || "",
      pincode: doc.address?.pincode || "",
    },
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    status: doc.status,
    trackingCode: doc.trackingCode || "",
    createdAt: doc.createdAt,
  };
}

export async function priceLines(lines: CartLineInput[]): Promise<Quote> {
  if (!lines.length) throw new Error("Your cart is empty.");

  const priced: PricedLine[] = [];
  for (const line of lines) {
    const quantity = Math.floor(Number(line.quantity));
    if (!line.productId) throw new Error("A product in your cart is no longer available.");
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10) {
      throw new Error("Choose between 1 and 10 of each product.");
    }

    const snap = await db().collection("products").doc(line.productId).get();
    if (!snap.exists) throw new Error("A product in your cart is no longer available.");
    const product = snap.data()!;
    const stock = Number(product.stock || 0);
    if (stock < quantity) throw new Error(`${product.name} only has ${stock} left.`);

    const flavors = Array.isArray(product.flavors) ? product.flavors.map(String) : [];
    const strengths = Array.isArray(product.nicotineStrengths) ? product.nicotineStrengths.map(String) : [];
    const flavor = (line.flavor || "").trim();
    const strength = (line.strength || "").trim();
    if (flavors.length && !flavors.includes(flavor)) throw new Error(`Choose a flavor for ${product.name}.`);
    if (strengths.length && !strengths.includes(strength)) {
      throw new Error(`Choose a nicotine strength for ${product.name}.`);
    }

    const sale =
      typeof product.salePrice === "number" && product.salePrice > 0 && product.salePrice < product.price
        ? product.salePrice
        : null;
    const price = sale ?? Number(product.price);

    priced.push({
      productId: snap.id,
      name: String(product.name),
      slug: String(product.slug),
      image: product.images?.[0]?.url || "",
      price,
      quantity,
      flavor,
      strength,
      lineTotal: price * quantity,
    });
  }

  const subtotal = priced.reduce((sum, line) => sum + line.lineTotal, 0);
  const settings = await getSettings();
  const shipping = shippingFor(subtotal, settings.freeShippingAt, settings.shippingFee);
  return { lines: priced, subtotal, shipping, total: subtotal + shipping };
}

async function takeStock(lines: PricedLine[]) {
  const taken: PricedLine[] = [];
  try {
    for (const line of lines) {
      await db().runTransaction(async (tx) => {
        const ref = db().collection("products").doc(line.productId);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error(`${line.name} does not have enough stock.`);
        const stock = Number(snap.data()?.stock || 0);
        if (stock < line.quantity) throw new Error(`${line.name} does not have enough stock.`);
        tx.update(ref, { stock: stock - line.quantity, updatedAt: FieldValue.serverTimestamp() });
      });
      taken.push(line);
    }
  } catch (error) {
    await restoreStock(taken);
    throw error;
  }
}

export async function restoreStock(lines: { productId?: string | null; quantity: number }[]) {
  for (const line of lines) {
    if (!line.productId) continue;
    await db()
      .collection("products")
      .doc(line.productId)
      .update({ stock: FieldValue.increment(line.quantity), updatedAt: FieldValue.serverTimestamp() })
      .catch(() => undefined);
  }
}

export async function createOrder(input: {
  lines: CartLineInput[];
  customer: CustomerDetails;
  userId?: string | null;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "unpaid" | "paid";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}) {
  const quote = await priceLines(input.lines);
  await takeStock(quote.lines);

  try {
    const orderNumber = `VP${Date.now().toString(36).toUpperCase()}`;
    const accessToken = randomBytes(16).toString("hex");
    const ref = db().collection("orders").doc();
    await ref.set({
      orderNumber,
      accessToken,
      userId: input.userId || null,
      email: input.customer.email,
      phone: input.customer.phone,
      items: quote.lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        slug: line.slug,
        image: line.image,
        price: line.price,
        quantity: line.quantity,
        flavor: line.flavor,
        strength: line.strength,
      })),
      subtotal: quote.subtotal,
      shipping: quote.shipping,
      total: quote.total,
      address: {
        name: input.customer.name,
        phone: input.customer.phone,
        line1: input.customer.line1,
        line2: input.customer.line2 || "",
        city: input.customer.city,
        state: input.customer.state,
        pincode: input.customer.pincode,
      },
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus,
      razorpayOrderId: input.razorpayOrderId || "",
      razorpayPaymentId: input.razorpayPaymentId || "",
      status: input.paymentStatus === "paid" ? "confirmed" : "pending",
      trackingCode: "",
      createdAt: FieldValue.serverTimestamp(),
    });

    return { orderNumber, accessToken, total: quote.total };
  } catch (error) {
    await restoreStock(quote.lines);
    throw error;
  }
}

export async function getOrderById(id: string) {
  const snap = await db().collection("orders").doc(id).get();
  if (!snap.exists) return null;
  return asOrder(snap.id, snap.data()!);
}

export async function getOrderByNumber(orderNumber: string) {
  const snap = await db().collection("orders").where("orderNumber", "==", orderNumber).limit(1).get();
  if (snap.empty) return null;
  return asOrder(snap.docs[0]!.id, snap.docs[0]!.data());
}

export async function getOrdersForUser(userId: string) {
  const snap = await db().collection("orders").where("userId", "==", userId).get();
  return snap.docs
    .map((doc) => asOrder(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllOrders() {
  const snap = await db().collection("orders").get();
  return snap.docs
    .map((doc) => asOrder(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findOrderByNumberAndPhone(orderNumber: string, phone: string) {
  const snap = await db()
    .collection("orders")
    .where("orderNumber", "==", orderNumber)
    .where("phone", "==", phone)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return asOrder(snap.docs[0]!.id, snap.docs[0]!.data());
}

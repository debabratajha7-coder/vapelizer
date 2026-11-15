"use server";

import { hash } from "bcryptjs";
import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import {
  createUser,
  getUserByEmail,
  getUserById,
  saveUserAddresses,
  saveUserName,
  saveUserWishlist,
} from "@/lib/users";
import { parseCustomer } from "@/lib/validators";
import type { ActionState, CartLineInput } from "@/lib/types";
import { createOrder, priceLines } from "@/lib/orders";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAccount(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (name.length < 2) return { error: "Enter your name." };
  if (!emailPattern.test(email)) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  try {
    const existing = await getUserByEmail(email);
    if (existing) return { error: "An account with that email already exists." };
    await createUser({
      name,
      email,
      passwordHash: await hash(password, 10),
      role: "customer",
    });
    return { error: "" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the account." };
  }
}

export async function subscribe(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!emailPattern.test(email)) return { error: "Enter a valid email.", ok: false };
  try {
    await db().collection("subscribers").doc(email).set(
      { email, createdAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    return { error: "", ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not subscribe.", ok: false };
  }
}

export async function sendMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (name.length < 2) return { error: "Enter your name.", ok: false };
  if (!emailPattern.test(email)) return { error: "Enter a valid email.", ok: false };
  if (body.length < 10) return { error: "Write a short message.", ok: false };

  try {
    await db().collection("messages").add({
      name,
      email,
      phone,
      body,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { error: "", ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not send the message.", ok: false };
  }
}

async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getUserById(session.user.id);
}

export async function syncWishlist(localIds: string[]) {
  const user = await currentUser();
  if (!user) return localIds.filter(Boolean);
  const ids = new Set(user.wishlist);
  for (const id of localIds) if (id) ids.add(id);
  const wishlist = [...ids];
  await saveUserWishlist(user.id, wishlist);
  return wishlist;
}

export async function toggleWishlist(productId: string) {
  const user = await currentUser();
  if (!user || !productId) return [];
  const has = user.wishlist.includes(productId);
  const wishlist = has ? user.wishlist.filter((id) => id !== productId) : [...user.wishlist, productId];
  await saveUserWishlist(user.id, wishlist);
  revalidatePath("/account");
  return wishlist;
}

export async function quoteCart(lines: CartLineInput[]) {
  try {
    const quote = await priceLines(lines);
    return { quote, error: "" };
  } catch (error) {
    return { quote: null, error: error instanceof Error ? error.message : "Could not price the cart." };
  }
}

export async function placeCodOrder(input: { lines: CartLineInput[]; customer: unknown }) {
  const parsed = parseCustomer(input.customer);
  if (!parsed.data) return { error: parsed.error || "Check the delivery details.", orderNumber: "", accessToken: "" };

  try {
    const session = await auth();
    const placed = await createOrder({
      lines: input.lines,
      customer: parsed.data,
      userId: session?.user?.id,
      paymentMethod: "cod",
      paymentStatus: "unpaid",
    });
    revalidatePath("/account");
    return { error: "", orderNumber: placed.orderNumber, accessToken: placed.accessToken };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not place the order.",
      orderNumber: "",
      accessToken: "",
    };
  }
}

export async function saveProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) return;
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) return;
  await saveUserName(user.id, name);
  revalidatePath("/account");
}

export async function saveAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in to save an address.", ok: false };
  const parsed = parseCustomer({
    name: formData.get("name"),
    email: user.email,
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
  });
  if (!parsed.data) return { error: parsed.error || "Check the address.", ok: false };
  if (user.addresses.length >= 5) return { error: "You can save up to 5 addresses.", ok: false };
  const addresses = [
    ...user.addresses,
    {
      id: randomUUID(),
      name: parsed.data.name,
      phone: parsed.data.phone,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || "",
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
    },
  ];
  await saveUserAddresses(user.id, addresses);
  revalidatePath("/account");
  revalidatePath("/checkout");
  return { error: "", ok: true };
}

export async function deleteAddress(formData: FormData) {
  const user = await currentUser();
  if (!user) return;
  const id = String(formData.get("id") || "");
  await saveUserAddresses(
    user.id,
    user.addresses.filter((address) => address.id !== id),
  );
  revalidatePath("/account");
}

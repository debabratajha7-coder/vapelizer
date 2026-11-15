import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import { db } from "@/lib/firebase-admin";
import type { AddressRecord, UserRecord } from "@/lib/records";

function asUser(id: string, data: FirebaseFirestore.DocumentData): UserRecord {
  return {
    id,
    name: String(data.name || ""),
    email: String(data.email || "").toLowerCase(),
    passwordHash: String(data.passwordHash || ""),
    role: data.role === "admin" ? "admin" : "customer",
    wishlist: Array.isArray(data.wishlist) ? data.wishlist.map(String) : [],
    addresses: Array.isArray(data.addresses)
      ? data.addresses.map((address: Record<string, unknown>) => ({
          id: String(address.id || randomUUID()),
          name: String(address.name || ""),
          phone: String(address.phone || ""),
          line1: String(address.line1 || ""),
          line2: String(address.line2 || ""),
          city: String(address.city || ""),
          state: String(address.state || ""),
          pincode: String(address.pincode || ""),
        }))
      : [],
  };
}

export async function getUserById(id: string) {
  if (!id) return null;
  const snap = await db().collection("users").doc(id).get();
  if (!snap.exists) return null;
  return asUser(snap.id, snap.data()!);
}

export async function getUserByEmail(email: string) {
  const snap = await db().collection("users").where("email", "==", email.toLowerCase()).limit(1).get();
  if (snap.empty) return null;
  return asUser(snap.docs[0]!.id, snap.docs[0]!.data());
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "customer" | "admin";
}) {
  const ref = db().collection("users").doc();
  await ref.set({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    role: input.role || "customer",
    wishlist: [],
    addresses: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function upsertAdminUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const existing = await getUserByEmail(input.email);
  if (existing) {
    await db().collection("users").doc(existing.id).set(
      {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        role: "admin",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return existing.id;
  }
  return createUser({ ...input, role: "admin" });
}

export async function saveUserWishlist(userId: string, wishlist: string[]) {
  await db().collection("users").doc(userId).update({
    wishlist,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function saveUserName(userId: string, name: string) {
  await db().collection("users").doc(userId).update({
    name,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function saveUserAddresses(userId: string, addresses: AddressRecord[]) {
  await db().collection("users").doc(userId).update({
    addresses,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

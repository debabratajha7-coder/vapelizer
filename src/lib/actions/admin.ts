"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildSearchText, getCategoryById } from "@/lib/catalog";
import { db } from "@/lib/firebase-admin";
import { slugify } from "@/lib/format";
import { getOrderById, isOrderStatus, restoreStock } from "@/lib/orders";
import { faqsFromText, saveStoreSettings } from "@/lib/settings";
import { destroyImage, storageConfigured, uploadImage } from "@/lib/storage";
import type { ActionState } from "@/lib/types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }
  return session.user;
}

function filesOf(formData: FormData) {
  return formData.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);
}

async function collectImages(formData: FormData) {
  const files = filesOf(formData);
  if (!files.length) return [];
  if (!storageConfigured()) {
    throw new Error("Add Cloudinary keys to .env.local before uploading images.");
  }
  const images = [];
  for (const file of files) images.push(await uploadImage(file));
  return images;
}

export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const brand = String(formData.get("brand") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  const price = Number(formData.get("price"));
  const saleRaw = String(formData.get("salePrice") || "").trim();
  const salePrice = saleRaw ? Number(saleRaw) : null;
  const puffRaw = String(formData.get("puffCount") || "").trim();
  const puffCount = puffRaw ? Number(puffRaw) : null;
  const stock = Math.floor(Number(formData.get("stock")));
  const rating = Number(formData.get("rating") || 5);
  const description = String(formData.get("description") || "").trim();
  const flavors = String(formData.get("flavors") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const nicotineStrengths = String(formData.get("nicotineStrengths") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const featured = formData.get("featured") === "on";

  if (name.length < 2) return { error: "Enter a product name." };
  if (!slug) return { error: "Enter a slug." };
  if (!categoryId) return { error: "Choose a category." };
  if (!Number.isFinite(price) || price <= 0) return { error: "Enter a price." };
  if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0)) return { error: "Sale price is invalid." };
  if (!Number.isFinite(stock) || stock < 0) return { error: "Enter stock." };

  try {
    const clash = await db().collection("products").where("slug", "==", slug).limit(1).get();
    if (!clash.empty && clash.docs[0]!.id !== id) return { error: "That slug is already in use." };
    const category = await getCategoryById(categoryId);
    if (!category) return { error: "Choose a category." };
    const images = await collectImages(formData);
    const payload = {
      name,
      slug,
      brand,
      categoryId,
      categoryName: category.name,
      categorySlug: category.slug,
      price,
      salePrice: salePrice && salePrice < price ? salePrice : null,
      puffCount: puffCount && Number.isFinite(puffCount) ? puffCount : null,
      stock,
      rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 5,
      description,
      flavors,
      nicotineStrengths,
      featured,
      searchText: buildSearchText({ name, brand, description, flavors }),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (id) {
      const ref = db().collection("products").doc(id);
      const existing = await ref.get();
      if (!existing.exists) return { error: "Product not found." };
      const currentImages = Array.isArray(existing.data()?.images) ? existing.data()!.images : [];
      await ref.update({
        ...payload,
        ...(images.length ? { images: [...currentImages, ...images] } : {}),
      });
    } else {
      await db()
        .collection("products")
        .add({ ...payload, images, createdAt: FieldValue.serverTimestamp() });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the product." };
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function removeProductImage(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const publicId = String(formData.get("publicId") || "");
  const url = String(formData.get("url") || "");
  const ref = db().collection("products").doc(productId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const images = (Array.isArray(snap.data()?.images) ? snap.data()!.images : []).filter(
    (image: { publicId?: string; url?: string }) =>
      publicId ? image.publicId !== publicId : image.url !== url,
  );
  await ref.update({ images, updatedAt: FieldValue.serverTimestamp() });
  await destroyImage(publicId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const snap = await db().collection("products").doc(id).get();
  if (snap.exists) {
    for (const image of snap.data()?.images ?? []) await destroyImage(image.publicId);
    await snap.ref.delete();
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const parentId = String(formData.get("parentId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  if (name.length < 2 || !slug) return { error: "Enter a category name." };

  try {
    const clash = await db().collection("categories").where("slug", "==", slug).limit(1).get();
    if (!clash.empty) return { error: "That slug is already in use." };
    const images = await collectImages(formData);
    await db()
      .collection("categories")
      .add({
        name,
        slug,
        parentId: parentId || null,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        image: images[0] ?? null,
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the category." };
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const [children, products] = await Promise.all([
    db().collection("categories").where("parentId", "==", id).limit(1).get(),
    db().collection("products").where("categoryId", "==", id).limit(1).get(),
  ]);
  if (!children.empty || !products.empty) redirect("/admin/categories?error=in-use");
  const category = await db().collection("categories").doc(id).get();
  if (category.exists) {
    await destroyImage(category.data()?.image?.publicId);
    await category.ref.delete();
  }
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function saveBanner(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  if (title.length < 2) return { error: "Enter a banner title." };
  try {
    const images = await collectImages(formData);
    await db()
      .collection("banners")
      .add({
        eyebrow: String(formData.get("eyebrow") || "").trim(),
        title,
        subtitle: String(formData.get("subtitle") || "").trim(),
        href: String(formData.get("href") || "/shop").trim() || "/shop",
        tone: formData.get("tone") === "light" ? "light" : "dark",
        sortOrder: Number(formData.get("sortOrder") || 0),
        active: formData.get("active") === "on",
        image: images[0] ?? null,
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the banner." };
  }
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const banner = await db().collection("banners").doc(id).get();
  if (banner.exists) {
    await destroyImage(banner.data()?.image?.publicId);
    await banner.ref.delete();
  }
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const trackingCode = String(formData.get("trackingCode") || "").trim();
  if (!isOrderStatus(status)) return;
  const order = await getOrderById(id);
  if (!order) return;

  if (status === "cancelled" && order.status !== "cancelled") {
    await restoreStock(order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
  }
  if (order.status === "cancelled" && status !== "cancelled") {
    for (const item of order.items) {
      if (!item.productId) continue;
      try {
        await db().runTransaction(async (tx) => {
          const ref = db().collection("products").doc(item.productId);
          const snap = await tx.get(ref);
          if (!snap.exists) throw new Error("missing");
          const stock = Number(snap.data()?.stock || 0);
          if (stock < item.quantity) throw new Error("stock");
          tx.update(ref, { stock: stock - item.quantity });
        });
      } catch {
        return;
      }
    }
  }

  await db().collection("orders").doc(id).update({ status, trackingCode });
  revalidatePath("/admin/orders");
  revalidatePath("/account");
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "");
}

function amount(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const faqs = faqsFromText(text(formData, "faqs"));
  await saveStoreSettings({
    storeName: text(formData, "storeName").trim() || "Vapelizer",
    promoText: text(formData, "promoText").trim(),
    searchPlaceholder: text(formData, "searchPlaceholder").trim(),
    freeShippingAt: amount(formData, "freeShippingAt"),
    shippingFee: amount(formData, "shippingFee"),
    whatsappNumber: text(formData, "whatsappNumber").replace(/\D/g, ""),
    contactEmail: text(formData, "contactEmail").trim(),
    contactHours: text(formData, "contactHours").trim(),
    heroEyebrow: text(formData, "heroEyebrow").trim(),
    heroTitle: text(formData, "heroTitle").trim(),
    heroBody: text(formData, "heroBody").trim(),
    heroCta: text(formData, "heroCta").trim(),
    heroHref: text(formData, "heroHref").trim() || "/shop",
    heroImage: text(formData, "heroImage").trim() || "/scenes/hero.jpg",
    trustLine: text(formData, "trustLine").trim(),
    shelfTitle: text(formData, "shelfTitle").trim(),
    disposablesTitle: text(formData, "disposablesTitle").trim(),
    kitsTitle: text(formData, "kitsTitle").trim(),
    saltsTitle: text(formData, "saltsTitle").trim(),
    questionsTitle: text(formData, "questionsTitle").trim(),
    howToChooseTitle: text(formData, "howToChooseTitle").trim(),
    howToChooseBody: text(formData, "howToChooseBody").trim(),
    newsletterTitle: text(formData, "newsletterTitle").trim(),
    newsletterBody: text(formData, "newsletterBody").trim(),
    newsletterImage: text(formData, "newsletterImage").trim() || "/scenes/disposable.jpg",
    footerBlurb: text(formData, "footerBlurb").trim(),
    footerDispatch: text(formData, "footerDispatch").trim(),
    aboutTitle: text(formData, "aboutTitle").trim(),
    aboutLede: text(formData, "aboutLede").trim(),
    aboutBody: text(formData, "aboutBody").trim(),
    contactTitle: text(formData, "contactTitle").trim(),
    contactLede: text(formData, "contactLede").trim(),
    termsTitle: text(formData, "termsTitle").trim(),
    termsLede: text(formData, "termsLede").trim(),
    termsBody: text(formData, "termsBody").trim(),
    refundTitle: text(formData, "refundTitle").trim(),
    refundLede: text(formData, "refundLede").trim(),
    refundBody: text(formData, "refundBody").trim(),
    ageEyebrow: text(formData, "ageEyebrow").trim(),
    ageTitle: text(formData, "ageTitle").trim(),
    ageBody: text(formData, "ageBody").trim(),
    ageConfirm: text(formData, "ageConfirm").trim(),
    faqs,
  });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

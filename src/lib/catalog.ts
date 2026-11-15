import { auth } from "@/lib/auth";
import { db, missingDatabaseMessage } from "@/lib/firebase-admin";
import type { BannerRecord, CategoryRecord, ProductRecord } from "@/lib/records";
import type { BannerDTO, CategoryNode, CategoryOption, ImageRef, ProductDTO, StoreUser } from "@/lib/types";

function imageOf(image?: { url?: string; publicId?: string } | null): ImageRef | null {
  if (!image?.url) return null;
  return { url: image.url, publicId: image.publicId || "" };
}

function asProduct(id: string, data: FirebaseFirestore.DocumentData): ProductRecord {
  return {
    id,
    name: String(data.name || ""),
    slug: String(data.slug || ""),
    brand: String(data.brand || ""),
    categoryId: String(data.categoryId || ""),
    categoryName: String(data.categoryName || ""),
    categorySlug: String(data.categorySlug || ""),
    price: Number(data.price || 0),
    salePrice: typeof data.salePrice === "number" ? data.salePrice : null,
    puffCount: typeof data.puffCount === "number" ? data.puffCount : null,
    nicotineStrengths: Array.isArray(data.nicotineStrengths) ? data.nicotineStrengths.map(String) : [],
    flavors: Array.isArray(data.flavors) ? data.flavors.map(String) : [],
    stock: Number(data.stock || 0),
    images: Array.isArray(data.images)
      ? data.images
          .filter((image: { url?: string }) => image?.url)
          .map((image: { url: string; publicId?: string }) => ({
            url: image.url,
            publicId: image.publicId || "",
          }))
      : [],
    featured: Boolean(data.featured),
    rating: Number(data.rating ?? 5),
    description: String(data.description || ""),
    searchText: String(data.searchText || ""),
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || undefined,
  };
}

function asCategory(id: string, data: FirebaseFirestore.DocumentData): CategoryRecord {
  return {
    id,
    name: String(data.name || ""),
    slug: String(data.slug || ""),
    parentId: data.parentId ? String(data.parentId) : null,
    sortOrder: Number(data.sortOrder || 0),
    image: imageOf(data.image),
  };
}

function asBanner(id: string, data: FirebaseFirestore.DocumentData): BannerRecord {
  return {
    id,
    eyebrow: String(data.eyebrow || ""),
    title: String(data.title || ""),
    subtitle: String(data.subtitle || ""),
    href: String(data.href || "/shop"),
    tone: data.tone === "light" ? "light" : "dark",
    image: imageOf(data.image),
    active: data.active !== false,
    sortOrder: Number(data.sortOrder || 0),
  };
}

export function serializeProduct(doc: ProductRecord): ProductDTO {
  const sale = typeof doc.salePrice === "number" && doc.salePrice > 0 && doc.salePrice < doc.price ? doc.salePrice : null;
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    brand: doc.brand || "",
    categoryId: doc.categoryId,
    categoryName: doc.categoryName,
    categorySlug: doc.categorySlug,
    price: doc.price,
    salePrice: sale,
    effectivePrice: sale ?? doc.price,
    puffCount: doc.puffCount ?? null,
    nicotineStrengths: doc.nicotineStrengths ?? [],
    flavors: doc.flavors ?? [],
    stock: doc.stock ?? 0,
    images: doc.images ?? [],
    featured: Boolean(doc.featured),
    rating: doc.rating ?? 5,
    description: doc.description || "",
  };
}

function serializeCategory(doc: CategoryRecord): CategoryNode {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    parentId: doc.parentId,
    sortOrder: doc.sortOrder ?? 0,
    image: doc.image,
    children: [],
  };
}

export function serializeBanner(doc: BannerRecord): BannerDTO {
  return {
    id: doc.id,
    eyebrow: doc.eyebrow || "",
    title: doc.title,
    subtitle: doc.subtitle || "",
    href: doc.href || "/shop",
    tone: doc.tone === "light" ? "light" : "dark",
    image: doc.image,
    active: doc.active !== false,
    sortOrder: doc.sortOrder ?? 0,
  };
}

export async function load<T>(fn: () => Promise<T>) {
  try {
    return { data: await fn(), error: null as string | null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return {
      data: null as T | null,
      error: message.includes("Firebase Admin") ? missingDatabaseMessage() : message,
    };
  }
}

export async function getStorefrontData() {
  let user: StoreUser | null = null;
  try {
    const session = await auth();
    if (session?.user?.id) {
      user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role ?? "customer",
      };
    }
  } catch {
    user = null;
  }

  const categoriesResult = await load(getCategoryTree);
  return {
    categories: categoriesResult.data ?? [],
    user,
    dbError: categoriesResult.error,
  };
}

export async function getCategoryTree() {
  const snap = await db().collection("categories").get();
  const docs = snap.docs
    .map((doc) => asCategory(doc.id, doc.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const nodes = new Map<string, CategoryNode>();
  for (const doc of docs) nodes.set(doc.id, serializeCategory(doc));
  const roots: CategoryNode[] = [];
  for (const doc of docs) {
    const node = nodes.get(doc.id);
    if (!node) continue;
    if (doc.parentId && nodes.has(doc.parentId)) nodes.get(doc.parentId)?.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const tree = await getCategoryTree();
  const options: CategoryOption[] = [];
  for (const parent of tree) {
    options.push({ id: parent.id, label: parent.name });
    for (const child of parent.children) options.push({ id: child.id, label: `${parent.name} / ${child.name}` });
  }
  return options;
}

export async function getCategoryById(id: string) {
  const doc = await db().collection("categories").doc(id).get();
  if (!doc.exists) return null;
  return asCategory(doc.id, doc.data()!);
}

export async function getCategoryBySlug(slug: string) {
  const snap = await db().collection("categories").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return asCategory(doc.id, doc.data());
}

async function productsForCategoryIds(ids: string[], limit?: number) {
  if (!ids.length) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
  const products: ProductRecord[] = [];
  for (const chunk of chunks) {
    const snap = await db().collection("products").where("categoryId", "in", chunk).get();
    for (const doc of snap.docs) products.push(asProduct(doc.id, doc.data()));
  }
  products.sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt)));
  return (limit ? products.slice(0, limit) : products).map(serializeProduct);
}

export async function getProductsForCategorySlug(slug: string, limit?: number) {
  const category = await getCategoryBySlug(slug);
  if (!category) return null;
  const childrenSnap = await db().collection("categories").where("parentId", "==", category.id).get();
  const children = childrenSnap.docs
    .map((doc) => asCategory(doc.id, doc.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const ids = [category.id, ...children.map((child) => child.id)];
  const products = await productsForCategoryIds(ids, limit);
  const node = serializeCategory(category);
  node.children = children.map(serializeCategory);
  return { category: node, products };
}

export async function getAllProducts() {
  const snap = await db().collection("products").get();
  return snap.docs
    .map((doc) => asProduct(doc.id, doc.data()))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(serializeProduct);
}

export async function getFeaturedProducts(limit = 8) {
  const snap = await db().collection("products").where("featured", "==", true).limit(limit).get();
  return snap.docs
    .map((doc) => asProduct(doc.id, doc.data()))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const snap = await db().collection("products").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  return serializeProduct(asProduct(snap.docs[0]!.id, snap.docs[0]!.data()));
}

export async function getProductById(id: string) {
  if (!id) return null;
  const doc = await db().collection("products").doc(id).get();
  if (!doc.exists) return null;
  return serializeProduct(asProduct(doc.id, doc.data()!));
}

export async function getProductRecord(id: string) {
  if (!id) return null;
  const doc = await db().collection("products").doc(id).get();
  if (!doc.exists) return null;
  return asProduct(doc.id, doc.data()!);
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  if (!categoryId) return [];
  const snap = await db().collection("products").where("categoryId", "==", categoryId).limit(8).get();
  return snap.docs
    .map((doc) => asProduct(doc.id, doc.data()))
    .filter((product) => product.id !== excludeId)
    .slice(0, 4)
    .map(serializeProduct);
}

export async function searchProducts(q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const snap = await db().collection("products").limit(200).get();
  return snap.docs
    .map((doc) => asProduct(doc.id, doc.data()))
    .filter((product) => product.searchText.includes(query) || product.name.toLowerCase().includes(query))
    .slice(0, 48)
    .map(serializeProduct);
}

export async function getBanners(activeOnly = true) {
  const snap = activeOnly
    ? await db().collection("banners").where("active", "==", true).get()
    : await db().collection("banners").get();
  return snap.docs
    .map((doc) => asBanner(doc.id, doc.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(serializeBanner);
}

export async function getProductsByIds(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return [];
  const products: ProductDTO[] = [];
  for (let i = 0; i < unique.length; i += 10) {
    const chunk = unique.slice(i, i + 10);
    const refs = chunk.map((id) => db().collection("products").doc(id));
    const docs = await db().getAll(...refs);
    for (const doc of docs) {
      if (doc.exists) products.push(serializeProduct(asProduct(doc.id, doc.data()!)));
    }
  }
  return products;
}

export function buildSearchText(input: {
  name: string;
  brand?: string;
  description?: string;
  flavors?: string[];
}) {
  return [input.name, input.brand, input.description, ...(input.flavors || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

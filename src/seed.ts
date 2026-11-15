import { existsSync, readFileSync } from "fs";
import { hash } from "bcryptjs";
import { FieldValue } from "firebase-admin/firestore";
import { buildSearchText } from "./lib/catalog";
import { db } from "./lib/firebase-admin";
import { defaultSettings } from "./lib/settings";
import { upsertAdminUser } from "./lib/users";

function loadEnv(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const categories = [
  {
    name: "Disposable Vape",
    slug: "disposable-vape",
    children: [
      { name: "IGET", slug: "iget" },
      { name: "Elf Bar", slug: "elf-bar" },
      { name: "Al Fakher", slug: "al-fakher" },
      { name: "Yuoto", slug: "yuoto" },
      { name: "VOZOL", slug: "vozol" },
    ],
  },
  {
    name: "Nic Salts",
    slug: "nic-salts",
    children: [
      { name: "Pod Salt", slug: "pod-salt" },
      { name: "VGOD Salts", slug: "vgod-salts" },
      { name: "Nasty Salts", slug: "nasty-salts" },
    ],
  },
  {
    name: "E-Liquids",
    slug: "e-liquids",
    children: [
      { name: "Pod Salt Liquids", slug: "pod-salt-liquids" },
      { name: "Nasty Liquids", slug: "nasty-liquids" },
      { name: "VGOD Liquids", slug: "vgod-liquids" },
    ],
  },
  {
    name: "Devices",
    slug: "devices",
    children: [
      { name: "Pod Systems", slug: "pod-systems" },
      { name: "Replacement Coils", slug: "replacement-coils" },
    ],
  },
  {
    name: "Pods",
    slug: "pods",
    children: [{ name: "Closed Pods", slug: "closed-pods" }],
  },
  {
    name: "Starter Kits",
    slug: "starter-kits",
    children: [
      { name: "Caliburn", slug: "caliburn" },
      { name: "Vaporesso", slug: "vaporesso" },
      { name: "SMOK", slug: "smok" },
    ],
  },
];

const products = [
  { name: "IGET Move Dual — Mr Blue / Blueberry", slug: "iget-move-mr-blue-blueberry", brand: "IGET", category: "iget", price: 3599, puffCount: 50000, stock: 24, strengths: ["5%"], featured: true, rating: 5, description: "A rechargeable dual-flavor disposable with a 50,000 puff claim and a draw-activated coil." },
  { name: "IGET Move Dual — Pineapple Coconut / Peach Mango", slug: "iget-move-pineapple-peach", brand: "IGET", category: "iget", price: 3599, puffCount: 50000, stock: 18, strengths: ["5%"], featured: true, rating: 4.8, description: "Two tropical profiles in one device, packed for travel and daily carry." },
  { name: "IGET Move Dual — Strawberry Kiwi / Watermelon", slug: "iget-move-strawberry-watermelon", brand: "IGET", category: "iget", price: 3599, puffCount: 50000, stock: 16, strengths: ["5%"], featured: false, rating: 4.7, description: "Fruit-forward dual flavor disposable with a visible e-liquid window." },
  { name: "IGET Flare Berry Ice", slug: "iget-flare-berry-ice", brand: "IGET", category: "iget", price: 1499, puffCount: 10000, stock: 30, strengths: ["5%"], featured: false, rating: 4.6, description: "A compact 10,000 puff berry ice disposable for a shorter carry." },
  { name: "Elf Bar Raya Dusk Grape", slug: "elf-bar-raya-dusk-grape", brand: "Elf Bar", category: "elf-bar", price: 2499, puffCount: 25000, stock: 20, strengths: ["5%"], featured: true, rating: 4.9, description: "Grape with a cool finish, in a rechargeable Raya-style body." },
  { name: "Elf Bar Ice King Summer Mango", slug: "elf-bar-ice-king-summer-mango", brand: "Elf Bar", category: "elf-bar", price: 3599, salePrice: 3299, puffCount: 40000, stock: 14, strengths: ["5%"], featured: true, rating: 4.8, description: "Mango ice in a 40,000 puff rechargeable disposable." },
  { name: "Al Fakher Crown Hose Peach Ice", slug: "al-fakher-crown-hose-peach-ice", brand: "Al Fakher", category: "al-fakher", price: 3999, puffCount: 60000, stock: 12, strengths: ["5%"], featured: true, rating: 5, description: "Peach ice in a high-capacity hose-style disposable." },
  { name: "Al Fakher Mega Cloud Two Apple", slug: "al-fakher-mega-cloud-two-apple", brand: "Al Fakher", category: "al-fakher", price: 3499, puffCount: 40000, stock: 15, strengths: ["5%"], featured: false, rating: 4.9, description: "Two apple, the flavor most often asked for in the Al Fakher line." },
  { name: "Yuoto Thanos Watermelon Ice", slug: "yuoto-thanos-watermelon-ice", brand: "Yuoto", category: "yuoto", price: 1390, puffCount: 5000, stock: 40, strengths: ["5%"], featured: true, rating: 4.5, description: "A small watermelon ice disposable when you want something pocketable." },
  { name: "VOZOL Vista Mint Storm", slug: "vozol-vista-mint-storm", brand: "VOZOL", category: "vozol", price: 3199, puffCount: 40000, stock: 17, strengths: ["5%"], featured: false, rating: 4.7, description: "Mint-forward Vista disposable with a 40,000 puff claim." },
  { name: "Pod Salt Cherry Ice 30ml", slug: "pod-salt-cherry-ice-30ml", brand: "Pod Salt", category: "pod-salt", price: 1600, stock: 28, strengths: ["20mg", "10mg", "5mg"], featured: true, rating: 4.8, description: "Cherry ice nic salt in a 30ml bottle. Pick the strength that suits your device." },
  { name: "Pod Salt Mango Ice 30ml", slug: "pod-salt-mango-ice-30ml", brand: "Pod Salt", category: "pod-salt", price: 1600, stock: 22, strengths: ["20mg", "10mg"], featured: false, rating: 4.7, description: "Ripe mango with a cooling finish, bottled for pod systems." },
  { name: "VGOD Cubano Silver 30ml", slug: "vgod-cubano-silver-30ml", brand: "VGOD", category: "vgod-salts", price: 1750, stock: 18, strengths: ["20mg", "50mg"], featured: false, rating: 4.9, description: "A dry tobacco nic salt with a light vanilla edge." },
  { name: "Nasty Bad Blood 30ml", slug: "nasty-bad-blood-30ml", brand: "Nasty", category: "nasty-salts", price: 1650, stock: 19, strengths: ["20mg", "35mg"], featured: false, rating: 4.6, description: "Mixed berry nic salt from the Nasty salt line." },
  { name: "Nasty Slow Blow Salt 30ml", slug: "nasty-slow-blow-salt-30ml", brand: "Nasty", category: "nasty-salts", price: 1650, stock: 16, strengths: ["20mg", "35mg"], featured: false, rating: 4.8, description: "Pineapple and citrus nic salt, bottled at 30ml." },
  { name: "Pod Salt Cotton Candy 30ml", slug: "pod-salt-cotton-candy-30ml", brand: "Pod Salt", category: "pod-salt", price: 1600, stock: 21, strengths: ["20mg", "10mg"], featured: false, rating: 4.4, description: "Sweet cotton candy nic salt for refillable pods." },
  { name: "Pod Salt Mango Freebase 60ml", slug: "pod-salt-mango-freebase-60ml", brand: "Pod Salt", category: "pod-salt-liquids", price: 1290, stock: 14, strengths: ["3mg", "6mg"], featured: false, rating: 4.5, description: "A 60ml freebase mango for lower-strength, longer sessions." },
  { name: "Nasty Slow Blow 60ml", slug: "nasty-slow-blow-60ml", brand: "Nasty", category: "nasty-liquids", price: 1390, stock: 13, strengths: ["3mg", "6mg"], featured: false, rating: 4.7, description: "The freebase version of Slow Blow, in a 60ml shortfill-style bottle." },
  { name: "VGOD Purple Bomb 60ml", slug: "vgod-purple-bomb-60ml", brand: "VGOD", category: "vgod-liquids", price: 1490, stock: 11, strengths: ["3mg", "6mg"], featured: false, rating: 4.6, description: "Grape candy freebase for sub-ohm and restricted-lung devices." },
  { name: "Uwell Caliburn A3 Pod Kit", slug: "uwell-caliburn-a3-pod-kit", brand: "Uwell", category: "caliburn", price: 2899, stock: 10, featured: true, rating: 4.9, description: "A compact pod kit with a refillable cartridge and draw activation." },
  { name: "Vaporesso Xiron Compact", slug: "vaporesso-xiron-compact", brand: "Vaporesso", category: "vaporesso", price: 3599, salePrice: 3199, stock: 8, featured: true, rating: 4.8, description: "A pocket pod mod with adjustable airflow and a replaceable coil." },
  { name: "SMOK Field Mod Kit", slug: "smok-field-mod-kit", brand: "SMOK", category: "smok", price: 4999, salePrice: 4499, stock: 6, featured: false, rating: 4.5, description: "A larger starter kit when you want a screen, a bigger battery, and a tank." },
  { name: "Closed Pod 4-Pack", slug: "closed-pod-4-pack", brand: "Vapelizer", category: "closed-pods", price: 999, stock: 25, flavors: ["Virginia", "Mint", "Berry"], strengths: ["2%"], featured: false, rating: 4.3, description: "Four prefilled closed pods. Choose the flavor at checkout." },
  { name: "Mesh Coil 0.8ohm 5-Pack", slug: "mesh-coil-0-8ohm-5-pack", brand: "Vapelizer", category: "replacement-coils", price: 799, stock: 32, featured: false, rating: 4.6, description: "Five 0.8ohm mesh coils for the pod kits we stock." },
];

async function clearCollection(name: string) {
  const snap = await db().collection(name).get();
  const batchSize = 400;
  for (let i = 0; i < snap.docs.length; i += batchSize) {
    const batch = db().batch();
    for (const doc of snap.docs.slice(i, i + batchSize)) batch.delete(doc.ref);
    await batch.commit();
  }
}

async function main() {
  loadEnv(".env.local");
  loadEnv(".env");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before seeding.");
    process.exit(1);
  }

  await Promise.all([clearCollection("categories"), clearCollection("products"), clearCollection("banners")]);

  const ids = new Map<string, { id: string; name: string; slug: string }>();
  for (const [index, group] of categories.entries()) {
    const parentRef = db().collection("categories").doc();
    await parentRef.set({
      name: group.name,
      slug: group.slug,
      parentId: null,
      sortOrder: index,
      image: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    ids.set(group.slug, { id: parentRef.id, name: group.name, slug: group.slug });
    for (const [childIndex, child] of group.children.entries()) {
      const childRef = db().collection("categories").doc();
      await childRef.set({
        name: child.name,
        slug: child.slug,
        parentId: parentRef.id,
        sortOrder: childIndex,
        image: null,
        createdAt: FieldValue.serverTimestamp(),
      });
      ids.set(child.slug, { id: childRef.id, name: child.name, slug: child.slug });
    }
  }

  for (const product of products) {
    const category = ids.get(product.category);
    if (!category) throw new Error(`Missing category ${product.category}`);
    const flavors = "flavors" in product ? product.flavors : [];
    const strengths = "strengths" in product ? product.strengths : [];
    await db()
      .collection("products")
      .add({
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
        price: product.price,
        salePrice: "salePrice" in product ? product.salePrice : null,
        puffCount: "puffCount" in product ? product.puffCount : null,
        nicotineStrengths: strengths,
        flavors,
        stock: product.stock,
        images: [],
        featured: product.featured,
        rating: product.rating,
        description: product.description,
        searchText: buildSearchText({
          name: product.name,
          brand: product.brand,
          description: product.description,
          flavors,
        }),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
  }

  await db().collection("banners").add({
    eyebrow: "Starter kits",
    title: "Kits with a little more control",
    subtitle: "Pod kits and compact mods, up to 30% off selected devices.",
    href: "/category/starter-kits",
    tone: "dark",
    sortOrder: 0,
    active: true,
    image: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  await db().collection("banners").add({
    eyebrow: "Nic salts",
    title: "Small bottles. Clear strengths.",
    subtitle: "Thirty millilitre salts for the pod in your pocket.",
    href: "/category/nic-salts",
    tone: "light",
    sortOrder: 1,
    active: true,
    image: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  await db()
    .collection("settings")
    .doc("store")
    .set({ key: "store", ...defaultSettings }, { merge: true });

  const passwordHash = await hash(adminPassword, 10);
  await upsertAdminUser({
    name: "Vapelizer Admin",
    email: adminEmail.toLowerCase(),
    passwordHash,
  });

  console.log(`Seeded ${products.length} products and admin ${adminEmail.toLowerCase()} into Firestore.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

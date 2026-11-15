import { db } from "@/lib/firebase-admin";

export type StoreFaq = { question: string; answer: string };

export type StoreSettings = {
  storeName: string;
  promoText: string;
  searchPlaceholder: string;
  freeShippingAt: number;
  shippingFee: number;
  whatsappNumber: string;
  contactEmail: string;
  contactHours: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroCta: string;
  heroHref: string;
  heroImage: string;
  trustLine: string;
  shelfTitle: string;
  disposablesTitle: string;
  kitsTitle: string;
  saltsTitle: string;
  questionsTitle: string;
  howToChooseTitle: string;
  howToChooseBody: string;
  newsletterTitle: string;
  newsletterBody: string;
  newsletterImage: string;
  footerBlurb: string;
  footerDispatch: string;
  aboutTitle: string;
  aboutLede: string;
  aboutBody: string;
  contactTitle: string;
  contactLede: string;
  termsTitle: string;
  termsLede: string;
  termsBody: string;
  refundTitle: string;
  refundLede: string;
  refundBody: string;
  ageEyebrow: string;
  ageTitle: string;
  ageBody: string;
  ageConfirm: string;
  faqs: StoreFaq[];
};

export const defaultSettings: StoreSettings = {
  storeName: "Vapelizer",
  promoText: "Free express shipping over ₹1,999 · Discreet packing · 18+ only",
  searchPlaceholder: "Search devices, salts, flavors",
  freeShippingAt: 1999,
  shippingFee: 99,
  whatsappNumber: "",
  contactEmail: "hello@vapelizer.local",
  contactHours: "Dispatch desk hours are 10:00 to 18:00 IST, Monday to Saturday.",
  heroEyebrow: "Vape store · India",
  heroTitle: "A quieter way to buy.",
  heroBody: "Disposables, salts, and kits. Cash on delivery.",
  heroCta: "Shop the shelf",
  heroHref: "/shop",
  heroImage: "/scenes/hero.jpg",
  trustLine: "Free delivery over ₹1,999 · Plain packing · Cash on delivery · Ships in 24 hours",
  shelfTitle: "On the shelf",
  disposablesTitle: "Disposables",
  kitsTitle: "Kits",
  saltsTitle: "Nic salts",
  questionsTitle: "Questions",
  howToChooseTitle: "How to choose",
  howToChooseBody:
    "A disposable is the simplest start: no coil changes, no bottle, and a puff count printed on the box. Pod kits make more sense if you already know the flavor you want and would rather refill than replace the whole device.\n\nNic salts are the small bottles. Match the strength to the device — higher milligrams belong in a low-power pod, not a big mod. Freebase e-liquid is the larger bottle and the lower strength.",
  newsletterTitle: "New flavors, quietly",
  newsletterBody: "A short note when something new lands. No daily mail.",
  newsletterImage: "/scenes/disposable.jpg",
  footerBlurb: "Devices, salts, and disposables shipped across India in plain packing. For adults 18 and older.",
  footerDispatch: "Orders placed before 4pm leave the same day on business days. Cash on delivery is available at checkout.",
  aboutTitle: "About Vapelizer",
  aboutLede: "A small catalog for adults who want the product, the strength, and the price on one screen.",
  aboutBody:
    "Vapelizer lists disposables, nic salts, e-liquids, pods, and starter kits. Orders ship in plain packing across India. Cash on delivery is the default. Online payment is available when the store has Razorpay connected.\n\nProduct photos are uploaded by the shop through Cloudinary. Until a photo is added, the card shows the scene photo for that kind of product.\n\nNicotine products are for people 18 and older. Selling them is legal only in some places. If you run this store, you are responsible for checking the rules for each delivery address before you ship.",
  contactTitle: "Contact",
  contactLede: "Questions about an order, a flavor, or a damaged parcel.",
  termsTitle: "Terms",
  termsLede: "The short version of how orders on Vapelizer work.",
  termsBody:
    "You must be 18 or older to place an order. By checking out you confirm that, and that the delivery address can legally receive the products.\n\nPrices are in Indian rupees and include the product price shown on the page at the moment the order is placed. Shipping is free at the threshold shown at checkout.\n\nCash on delivery orders are confirmed when we accept them. Online payments are confirmed when Razorpay reports a successful payment.\n\nWe may cancel an order if a product is out of stock, if the address cannot be served, or if we cannot verify age. If you already paid online, the amount is refunded to the same method.\n\nProduct names and brand names belong to their owners. Vapelizer is an independent storefront.",
  refundTitle: "Refunds and returns",
  refundLede: "Damaged or incorrect shipments can be replaced. Opened nicotine products cannot.",
  refundBody:
    "If a parcel arrives damaged, leaking, or with the wrong product, email us within 48 hours. Include the order number and photos of the outer box and the item.\n\nUnopened items that were sent in error, and devices that are dead on arrival, are replaced or refunded. Nicotine liquids and disposables that have been opened cannot be returned.\n\nCash on delivery refunds are sent to the bank account you share with us. Razorpay refunds go back to the original payment method.\n\nRefused deliveries and incomplete addresses may be charged the return shipping before a refund is issued.",
  ageEyebrow: "Adults only",
  ageTitle: "Are you 18 or older?",
  ageBody:
    "Vapelizer sells nicotine products. You need to be 18 or older to browse and order. The seller is responsible for following the rules where the order is delivered.",
  ageConfirm: "I am 18 or older",
  faqs: [
    {
      question: "Who can order?",
      answer:
        "You need to be 18 or older. The age check on this site is a reminder, and the seller must follow the law for the delivery address.",
    },
    {
      question: "Do you deliver across India?",
      answer: "Yes. Shipping is free at the threshold set in the store settings. Below that, a flat shipping fee is added at checkout.",
    },
    {
      question: "Can I pay on delivery?",
      answer: "Cash on delivery is available on every order. Online payment shows up when Razorpay keys are configured.",
    },
    {
      question: "How do I track an order?",
      answer: "Use the order number and the mobile number from checkout on the track order page.",
    },
    {
      question: "What if something arrives damaged?",
      answer:
        "Write to us within 48 hours with photos of the parcel and the device. Unopened, damaged shipments can be replaced or refunded.",
    },
  ],
};

const textKeys = [
  "storeName",
  "promoText",
  "searchPlaceholder",
  "whatsappNumber",
  "contactEmail",
  "contactHours",
  "heroEyebrow",
  "heroTitle",
  "heroBody",
  "heroCta",
  "heroHref",
  "heroImage",
  "trustLine",
  "shelfTitle",
  "disposablesTitle",
  "kitsTitle",
  "saltsTitle",
  "questionsTitle",
  "howToChooseTitle",
  "howToChooseBody",
  "newsletterTitle",
  "newsletterBody",
  "newsletterImage",
  "footerBlurb",
  "footerDispatch",
  "aboutTitle",
  "aboutLede",
  "aboutBody",
  "contactTitle",
  "contactLede",
  "termsTitle",
  "termsLede",
  "termsBody",
  "refundTitle",
  "refundLede",
  "refundBody",
  "ageEyebrow",
  "ageTitle",
  "ageBody",
  "ageConfirm",
] as const;

export function paragraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function faqsToText(faqs: StoreFaq[]) {
  return faqs.map((faq) => `${faq.question} | ${faq.answer}`).join("\n");
}

export function faqsFromText(value: string): StoreFaq[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const splitAt = line.indexOf("|");
      if (splitAt === -1) return { question: line, answer: "" };
      return { question: line.slice(0, splitAt).trim(), answer: line.slice(splitAt + 1).trim() };
    })
    .filter((faq) => faq.question && faq.answer);
}

function fromRecord(doc: Record<string, unknown> | null): StoreSettings {
  const next: StoreSettings = {
    ...defaultSettings,
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultSettings.whatsappNumber,
  };
  if (!doc) return next;
  for (const key of textKeys) {
    const value = doc[key];
    if (typeof value !== "string") continue;
    if (key === "whatsappNumber" && !value) continue;
    next[key] = value;
  }
  if (typeof doc.freeShippingAt === "number" && doc.freeShippingAt >= 0) next.freeShippingAt = doc.freeShippingAt;
  if (typeof doc.shippingFee === "number" && doc.shippingFee >= 0) next.shippingFee = doc.shippingFee;
  if (Array.isArray(doc.faqs) && doc.faqs.length) {
    next.faqs = doc.faqs
      .filter((faq): faq is StoreFaq => Boolean(faq?.question && faq?.answer))
      .map((faq) => ({ question: String(faq.question), answer: String(faq.answer) }));
  }
  return next;
}

export async function getSettings(): Promise<StoreSettings> {
  try {
    const snap = await db().collection("settings").doc("store").get();
    return fromRecord(snap.exists ? (snap.data() as Record<string, unknown>) : null);
  } catch {
    return {
      ...defaultSettings,
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultSettings.whatsappNumber,
    };
  }
}

export async function saveStoreSettings(payload: Partial<StoreSettings> & { faqs: StoreFaq[] }) {
  await db()
    .collection("settings")
    .doc("store")
    .set({ key: "store", ...payload }, { merge: true });
}

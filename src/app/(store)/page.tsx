import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { PhotoWithHole, StampPhoto } from "@/components/stamp-frame";
import { getBanners, getFeaturedProducts, getProductsForCategorySlug, load } from "@/lib/catalog";
import { getSettings, paragraphs } from "@/lib/settings";
import type { BannerDTO, ProductDTO } from "@/lib/types";

const promoScenes = ["/scenes/device.jpg", "/scenes/salt.jpg"];

export default async function HomePage() {
  const [featured, disposables, devices, salts, banners, settings] = await Promise.all([
    load(() => getFeaturedProducts(4)),
    load(() => getProductsForCategorySlug("disposable-vape", 4)),
    load(() => getProductsForCategorySlug("starter-kits", 4)),
    load(() => getProductsForCategorySlug("nic-salts", 4)),
    load(() => getBanners(true)),
    getSettings(),
  ]);

  const promo = banners.data?.length ? banners.data : fallbackBanners;

  return (
    <div>
      <section className="px-3 pt-3 md:px-5">
        <div className="hidden md:block">
          <PhotoWithHole src={settings.heroImage} focus="center">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">{settings.heroEyebrow}</p>
            <h1 className="mt-2 font-display text-[2.35rem] leading-[0.95] tracking-tight">{settings.heroTitle}</h1>
            <p className="mt-2 text-sm leading-5 text-muted">{settings.heroBody}</p>
            <Link href={settings.heroHref} className="mt-4 inline-flex w-fit rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-paper">
              {settings.heroCta}
            </Link>
          </PhotoWithHole>
        </div>
        <div className="md:hidden">
          <StampPhoto src={settings.heroImage} alt="" className="mx-auto mt-2 w-[88%]" />
          <div className="px-4 py-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">{settings.heroEyebrow}</p>
            <h1 className="mt-2 font-display text-5xl leading-[0.92] tracking-tight">{settings.heroTitle}</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{settings.heroBody}</p>
            <Link href={settings.heroHref} className="mt-5 inline-flex rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-paper">
              {settings.heroCta}
            </Link>
          </div>
        </div>
      </section>

      <p className="mx-auto max-w-3xl px-6 py-8 text-center text-sm leading-6 text-muted">{settings.trustLine}</p>

      <section className="mx-auto grid max-w-5xl gap-14 px-6 py-6 md:grid-cols-2 md:gap-20">
        {promo.map((banner, index) => (
          <article key={banner.id} className="mx-auto w-full max-w-md">
            <Link href={banner.href}>
              <StampPhoto src={banner.image?.url || promoScenes[index % promoScenes.length]} alt={banner.title} />
            </Link>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{banner.eyebrow}</p>
            <h2 className="mt-1 font-display text-3xl leading-none tracking-tight">{banner.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{banner.subtitle}</p>
            <Link href={banner.href} className="mt-3 inline-block text-sm font-semibold underline decoration-line underline-offset-4">
              Shop collection
            </Link>
          </article>
        ))}
      </section>

      <Strip title={settings.shelfTitle} href="/shop" products={featured.data ?? []} />
      <Strip title={settings.disposablesTitle} href="/category/disposable-vape" products={disposables.data?.products ?? []} />
      <Strip title={settings.kitsTitle} href="/category/starter-kits" products={devices.data?.products ?? []} />
      <Strip title={settings.saltsTitle} href="/category/nic-salts" products={salts.data?.products ?? []} />

      <section className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl tracking-tight">{settings.howToChooseTitle}</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
            {paragraphs(settings.howToChooseBody).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-4xl tracking-tight">{settings.questionsTitle}</h2>
          <div className="mt-4">
            {settings.faqs.map((faq) => (
              <details key={faq.question} className="border-b border-line py-4">
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-6 pb-16 md:grid-cols-[0.7fr_1.3fr]">
        <StampPhoto src={settings.newsletterImage} alt="" className="mx-auto w-full max-w-xs" />
        <div>
          <h2 className="font-display text-4xl tracking-tight">{settings.newsletterTitle}</h2>
          <p className="mt-2 max-w-md text-sm text-muted">{settings.newsletterBody}</p>
          <div className="mt-5 max-w-xl">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function Strip({ title, href, products }: { title: string; href: string; products: ProductDTO[] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex items-end justify-between gap-4 px-1">
        <h2 className="font-display text-4xl tracking-tight">{title}</h2>
        <Link href={href} className="text-sm font-semibold underline decoration-line underline-offset-4">
          See all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

const fallbackBanners: BannerDTO[] = [
  {
    id: "kits",
    eyebrow: "Starter kits",
    title: "Kits with a little more control",
    subtitle: "Pod kits and compact mods for everyday carry.",
    href: "/category/starter-kits",
    tone: "dark",
    image: null,
    active: true,
    sortOrder: 0,
  },
  {
    id: "salts",
    eyebrow: "Nic salts",
    title: "Small bottles. Clear strengths.",
    subtitle: "Thirty millilitre salts for the pod in your pocket.",
    href: "/category/nic-salts",
    tone: "light",
    image: null,
    active: true,
    sortOrder: 1,
  },
];

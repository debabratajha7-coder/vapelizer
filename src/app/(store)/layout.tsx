import { AgeGate } from "@/components/age-gate";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { Footer, WhatsAppButton } from "@/components/footer";
import { Header } from "@/components/header";
import { SetupNotice } from "@/components/page-header";
import { WishlistProvider } from "@/components/wishlist-provider";
import { getStorefrontData } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [{ categories, user, dbError }, settings] = await Promise.all([getStorefrontData(), getSettings()]);

  return (
    <CartProvider>
      <WishlistProvider signedIn={Boolean(user)}>
        <div className="flex min-h-full flex-1 flex-col">
          <AgeGate eyebrow={settings.ageEyebrow} title={settings.ageTitle} body={settings.ageBody} confirmLabel={settings.ageConfirm} />
          <Header
            categories={categories}
            user={user}
            storeName={settings.storeName}
            promoText={settings.promoText}
            searchPlaceholder={settings.searchPlaceholder}
          />
          {dbError ? <SetupNotice message={dbError} /> : null}
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CartDrawer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}

import { BannerForm } from "@/components/admin-forms";
import { deleteBanner } from "@/lib/actions/admin";
import { getBanners } from "@/lib/catalog";

export default async function BannersPage() {
  const banners = await getBanners(false);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-4xl">Banners</h1>
        <ul className="mt-6 space-y-3">
          {banners.map((banner) => (
            <li key={banner.id} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4">
              <div>
                <p className="font-semibold">{banner.title}</p>
                <p className="text-xs text-muted">
                  {banner.href} · {banner.active ? "Active" : "Hidden"}
                </p>
              </div>
              <form action={deleteBanner}>
                <input type="hidden" name="id" value={banner.id} />
                <button className="text-sm text-ember">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
      <BannerForm />
    </div>
  );
}

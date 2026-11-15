import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { storageConfigured } from "@/lib/storage";

const links = [
  ["Dashboard", "/admin"],
  ["Products", "/admin/products"],
  ["Categories", "/admin/categories"],
  ["Banners", "/admin/banners"],
  ["Orders", "/admin/orders"],
  ["Store", "/admin/settings"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-full flex-1 bg-paper">
      <aside className="hidden w-56 shrink-0 border-r border-line bg-ink p-5 text-white md:block">
        <Link href="/" className="font-display text-2xl">
          Vapelizer
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/50">Admin</p>
        <nav className="mt-8 space-y-2 text-sm">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-xs text-white/50">
          Cloudinary {storageConfigured() ? "connected" : "not configured"}
        </p>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex gap-4 overflow-auto border-b border-line px-4 py-3 text-sm md:hidden">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}

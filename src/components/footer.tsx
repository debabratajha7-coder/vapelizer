import Link from "next/link";
import { getSettings } from "@/lib/settings";

const columns = [
  {
    title: "Information",
    links: [
      ["Home", "/"],
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Track order", "/track-order"],
    ],
  },
  {
    title: "Need help",
    links: [
      ["My account", "/account"],
      ["Cart", "/cart"],
      ["Terms", "/policies/terms"],
      ["Refunds", "/policies/refund"],
    ],
  },
];

export async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="mt-10 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-3xl tracking-tight">{settings.storeName}</p>
          <p className="mt-3 text-sm leading-6 text-muted">{settings.footerBlurb}</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{column.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {column.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-ink/80 hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Dispatch</p>
          <p className="mt-4 text-sm leading-6 text-muted">{settings.footerDispatch}</p>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {settings.storeName}. Nicotine products are for adults.
      </div>
    </footer>
  );
}

export async function WhatsAppButton() {
  const settings = await getSettings();
  const number = settings.whatsappNumber;
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-30 rounded-full bg-[#128C7E] px-4 py-3 text-sm font-semibold text-white shadow-lg"
    >
      WhatsApp
    </a>
  );
}

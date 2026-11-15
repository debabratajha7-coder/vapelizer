import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/page-header";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <div>
      <PageHeader title={settings.contactTitle} lede={settings.contactLede} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
        <ContactForm />
        <div className="text-sm leading-7 text-muted">
          {settings.contactEmail ? (
            <p>
              Email {settings.contactEmail} and include your order number.
            </p>
          ) : null}
          {settings.whatsappNumber ? (
            <p className="mt-3">
              WhatsApp:{" "}
              <a className="font-semibold text-ink" href={`https://wa.me/${settings.whatsappNumber}`}>
                {settings.whatsappNumber}
              </a>
            </p>
          ) : null}
          {settings.contactHours ? <p className="mt-3">{settings.contactHours}</p> : null}
        </div>
      </div>
    </div>
  );
}

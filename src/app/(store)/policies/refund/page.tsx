import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getSettings, paragraphs } from "@/lib/settings";

export const metadata: Metadata = { title: "Refunds" };

export default async function RefundPage() {
  const settings = await getSettings();
  return (
    <div>
      <PageHeader title={settings.refundTitle} lede={settings.refundLede} />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-7 text-muted">
        {paragraphs(settings.refundBody).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

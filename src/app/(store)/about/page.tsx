import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getSettings, paragraphs } from "@/lib/settings";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div>
      <PageHeader title={settings.aboutTitle} lede={settings.aboutLede} />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-7 text-muted">
        {paragraphs(settings.aboutBody).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

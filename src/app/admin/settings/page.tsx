import type { ReactNode } from "react";
import { saveSettings } from "@/lib/actions/admin";
import { faqsToText, getSettings } from "@/lib/settings";
import { fieldClass } from "@/lib/styles";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const settings = await getSettings();
  const { saved } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl">Store</h1>
      <p className="mt-2 text-sm text-muted">
        This is the only place the shop copy lives. The storefront does not link here. Open /admin directly.
      </p>
      {saved ? <p className="mt-4 text-sm text-emerald-700">Saved. The shop is using these details now.</p> : null}
      <form action={saveSettings} className="mt-8 space-y-10">
        <Section title="Shop">
          <Field label="Store name" name="storeName" defaultValue={settings.storeName} />
          <Field label="Promo bar" name="promoText" defaultValue={settings.promoText} />
          <Field label="Search placeholder" name="searchPlaceholder" defaultValue={settings.searchPlaceholder} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Free shipping from (₹)" name="freeShippingAt" type="number" defaultValue={String(settings.freeShippingAt)} />
            <Field label="Shipping fee below that (₹)" name="shippingFee" type="number" defaultValue={String(settings.shippingFee)} />
          </div>
          <Field label="WhatsApp number" name="whatsappNumber" defaultValue={settings.whatsappNumber} />
          <Field label="Contact email" name="contactEmail" defaultValue={settings.contactEmail} />
          <Area label="Contact hours" name="contactHours" defaultValue={settings.contactHours} rows={2} />
        </Section>

        <Section title="Age check">
          <Field label="Eyebrow" name="ageEyebrow" defaultValue={settings.ageEyebrow} />
          <Field label="Title" name="ageTitle" defaultValue={settings.ageTitle} />
          <Area label="Body" name="ageBody" defaultValue={settings.ageBody} rows={3} />
          <Field label="Confirm button" name="ageConfirm" defaultValue={settings.ageConfirm} />
        </Section>

        <Section title="Homepage">
          <Field label="Hero eyebrow" name="heroEyebrow" defaultValue={settings.heroEyebrow} />
          <Field label="Hero title" name="heroTitle" defaultValue={settings.heroTitle} />
          <Area label="Hero text" name="heroBody" defaultValue={settings.heroBody} rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero button" name="heroCta" defaultValue={settings.heroCta} />
            <Field label="Hero link" name="heroHref" defaultValue={settings.heroHref} />
          </div>
          <Field label="Hero photo URL" name="heroImage" defaultValue={settings.heroImage} />
          <Field label="Trust line" name="trustLine" defaultValue={settings.trustLine} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Featured heading" name="shelfTitle" defaultValue={settings.shelfTitle} />
            <Field label="Disposables heading" name="disposablesTitle" defaultValue={settings.disposablesTitle} />
            <Field label="Kits heading" name="kitsTitle" defaultValue={settings.kitsTitle} />
            <Field label="Salts heading" name="saltsTitle" defaultValue={settings.saltsTitle} />
          </div>
          <Field label="Guide heading" name="howToChooseTitle" defaultValue={settings.howToChooseTitle} />
          <Area label="Guide (blank line between paragraphs)" name="howToChooseBody" defaultValue={settings.howToChooseBody} rows={6} />
          <Field label="Questions heading" name="questionsTitle" defaultValue={settings.questionsTitle} />
          <Area label="Questions, one per line: question | answer" name="faqs" defaultValue={faqsToText(settings.faqs)} rows={8} />
          <Field label="Newsletter heading" name="newsletterTitle" defaultValue={settings.newsletterTitle} />
          <Area label="Newsletter text" name="newsletterBody" defaultValue={settings.newsletterBody} rows={2} />
          <Field label="Newsletter photo URL" name="newsletterImage" defaultValue={settings.newsletterImage} />
        </Section>

        <Section title="Pages">
          <Field label="About title" name="aboutTitle" defaultValue={settings.aboutTitle} />
          <Field label="About lede" name="aboutLede" defaultValue={settings.aboutLede} />
          <Area label="About (blank line between paragraphs)" name="aboutBody" defaultValue={settings.aboutBody} rows={8} />
          <Field label="Contact title" name="contactTitle" defaultValue={settings.contactTitle} />
          <Field label="Contact lede" name="contactLede" defaultValue={settings.contactLede} />
          <Field label="Terms title" name="termsTitle" defaultValue={settings.termsTitle} />
          <Field label="Terms lede" name="termsLede" defaultValue={settings.termsLede} />
          <Area label="Terms" name="termsBody" defaultValue={settings.termsBody} rows={8} />
          <Field label="Refunds title" name="refundTitle" defaultValue={settings.refundTitle} />
          <Field label="Refunds lede" name="refundLede" defaultValue={settings.refundLede} />
          <Area label="Refunds" name="refundBody" defaultValue={settings.refundBody} rows={8} />
        </Section>

        <Section title="Footer">
          <Area label="Blurb" name="footerBlurb" defaultValue={settings.footerBlurb} rows={3} />
          <Area label="Dispatch note" name="footerDispatch" defaultValue={settings.footerDispatch} rows={3} />
        </Section>

        <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">Save store</button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue: string; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className={fieldClass} />
    </label>
  );
}

function Area({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue: string; rows: number }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue} className={fieldClass} />
    </label>
  );
}

"use client";

export default function StoreError({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">{error.message}</p>
    </div>
  );
}

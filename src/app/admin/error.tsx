"use client";

export default function AdminError({ error }: { error: Error }) {
  return (
    <div>
      <h1 className="font-display text-3xl">Admin could not load</h1>
      <p className="mt-3 text-sm text-muted">{error.message}</p>
    </div>
  );
}

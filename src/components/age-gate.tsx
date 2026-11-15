"use client";

import { useState, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("vapelizer-age", callback);
  return () => window.removeEventListener("vapelizer-age", callback);
}

function confirmed() {
  return localStorage.getItem("vapelizer-age-ok") === "1";
}

export function AgeGate({
  eyebrow,
  title,
  body,
  confirmLabel,
}: {
  eyebrow: string;
  title: string;
  body: string;
  confirmLabel: string;
}) {
  const passed = useSyncExternalStore(subscribe, confirmed, () => false);
  const [closed, setClosed] = useState(false);
  if (passed || closed) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#141210]/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-paper p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl tracking-tight">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
        <div className="mt-6 flex gap-3">
          <button
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              localStorage.setItem("vapelizer-age-ok", "1");
              window.dispatchEvent(new Event("vapelizer-age"));
              setClosed(true);
            }}
          >
            {confirmLabel}
          </button>
          <a className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold" href="https://www.google.com">
            Leave
          </a>
        </div>
      </div>
    </div>
  );
}

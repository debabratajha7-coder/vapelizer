"use client";

import { useActionState } from "react";
import { subscribe } from "@/lib/actions/store";
import { buttonClass, fieldClass } from "@/lib/styles";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, { error: "", ok: false });
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row">
      <input name="email" type="email" required placeholder="Email address" className={fieldClass} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Joining" : "Get updates"}
      </button>
      {state.ok ? <p className="self-center text-sm text-emerald-700">You are on the list.</p> : null}
      {state.error ? <p className="self-center text-sm text-ember">{state.error}</p> : null}
    </form>
  );
}

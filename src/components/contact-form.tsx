"use client";

import { useActionState } from "react";
import { sendMessage } from "@/lib/actions/store";
import { buttonClass, fieldClass } from "@/lib/styles";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, { error: "", ok: false });
  if (state.ok) {
    return <p className="rounded-2xl bg-sand p-6 text-sm">Message received. We will reply by email.</p>;
  }
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm">
        Name
        <input name="name" required className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Phone
        <input name="phone" className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Message
        <textarea name="body" required minLength={10} rows={5} className={`${fieldClass} mt-1.5`} />
      </label>
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      <button className={buttonClass} disabled={pending}>
        {pending ? "Sending" : "Send"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { saveAddress } from "@/lib/actions/store";
import { buttonDarkClass, fieldClass } from "@/lib/styles";

export function AddressForm({ states }: { states: string[] }) {
  const [state, action, pending] = useActionState(saveAddress, { error: "", ok: false });
  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-line bg-white p-4">
      <p className="font-semibold">Add an address</p>
      <input name="name" required placeholder="Name" className={fieldClass} />
      <input name="phone" required placeholder="Mobile" className={fieldClass} />
      <input name="line1" required placeholder="Address" className={fieldClass} />
      <input name="line2" placeholder="Landmark" className={fieldClass} />
      <input name="city" required placeholder="City" className={fieldClass} />
      <select name="state" className={fieldClass} defaultValue="Delhi">
        {states.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <input name="pincode" required placeholder="PIN code" className={fieldClass} />
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Address saved.</p> : null}
      <button className={buttonDarkClass} disabled={pending}>
        {pending ? "Saving" : "Save address"}
      </button>
    </form>
  );
}

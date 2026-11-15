import { z } from "zod";
import { INDIAN_STATES } from "@/lib/states";
import type { CustomerDetails } from "@/lib/types";

const email = z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email.");

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email,
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
  line1: z.string().trim().min(4, "Enter your address."),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city."),
  state: z.string().trim().refine((value) => INDIAN_STATES.includes(value as (typeof INDIAN_STATES)[number]), "Choose a state."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
});

export function parseCustomer(input: unknown) {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Check the delivery details.", data: null };
  }
  const data: CustomerDetails = {
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
    line2: parsed.data.line2 || "",
  };
  return { error: null, data };
}

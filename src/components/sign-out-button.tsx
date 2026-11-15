"use client";

import { signOut } from "next-auth/react";
import { buttonGhostClass } from "@/lib/styles";

export function SignOutButton() {
  return (
    <button className={buttonGhostClass} onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
}

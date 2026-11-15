"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerAccount } from "@/lib/actions/store";
import { buttonClass, fieldClass } from "@/lib/styles";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mx-auto max-w-md space-y-4 px-4 py-14"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError("");
        const result = await signIn("credentials", {
          email: form.get("email"),
          password: form.get("password"),
          redirect: false,
        });
        setPending(false);
        if (result?.error) {
          setError(
            result.error === "CredentialsSignin"
              ? "Email or password is incorrect."
              : "Could not sign in. Check your email, password, and Firebase Admin setup.",
          );
          return;
        }
        router.push(callbackUrl);
        router.refresh();
      }}
    >
      <h1 className="font-display text-4xl">Login</h1>
      <p className="text-sm text-muted">
        New here? <Link href="/register" className="font-semibold text-ink">Create an account</Link>
      </p>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Password
        <input name="password" type="password" required className={`${fieldClass} mt-1.5`} />
      </label>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      <button className={buttonClass} disabled={pending}>
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mx-auto max-w-md space-y-4 px-4 py-14"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError("");
        const result = await registerAccount(form);
        if (result.error) {
          setPending(false);
          setError(result.error);
          return;
        }
        const signed = await signIn("credentials", {
          email: form.get("email"),
          password: form.get("password"),
          redirect: false,
        });
        setPending(false);
        if (signed?.error) {
          router.push("/login");
          return;
        }
        router.push("/account");
        router.refresh();
      }}
    >
      <h1 className="font-display text-4xl">Register</h1>
      <p className="text-sm text-muted">
        Already have an account? <Link href="/login" className="font-semibold text-ink">Login</Link>
      </p>
      <label className="block text-sm">
        Name
        <input name="name" required className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Password
        <input name="password" type="password" required minLength={8} className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        Confirm password
        <input name="confirm" type="password" required minLength={8} className={`${fieldClass} mt-1.5`} />
      </label>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      <button className={buttonClass} disabled={pending}>
        {pending ? "Creating account" : "Create account"}
      </button>
    </form>
  );
}

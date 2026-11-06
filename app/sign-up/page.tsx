"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTausi } from "@tausi-auth/js/next/client";
import { describeError } from "@/components/error-text";

export default function SignUp() {
  const tausi = useTausi();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    setBusy(true);
    setError(null);
    try {
      const r = await tausi.signUp({ name: String(form.get("name")), email, password, redirectTo: `${location.origin}/verify-email` });
      if (r.verificationRequired) {
        setNotice("Account created. Open the link we emailed you, then sign in.");
      } else {
        await tausi.signIn({ email, password });
        router.push("/todos");
      }
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card narrow">
      <h1>Create an account</h1>
      {notice ? (
        <p className="ok">{notice}</p>
      ) : (
        <form onSubmit={onSubmit}>
          <input name="name" placeholder="Your name" required autoComplete="name" />
          <input name="email" type="email" placeholder="Email" required autoComplete="email" />
          <input name="password" type="password" placeholder="Password (10+ characters)" required minLength={10} autoComplete="new-password" />
          <button disabled={busy}>{busy ? "Creating…" : "Sign up"}</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
      <p className="muted">Already have an account? <Link href="/sign-in">Sign in</Link></p>
    </section>
  );
}

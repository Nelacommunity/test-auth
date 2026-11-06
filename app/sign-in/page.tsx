"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTausi } from "@tausi-auth/js/next/client";
import { isTausiError } from "@tausi-auth/js";
import { describeError } from "@/components/error-text";

export default function SignIn() {
  const tausi = useTausi();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unverified, setUnverified] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setBusy(true);
    setError(null);
    setNotice(null);
    setUnverified(null);
    try {
      const r = await tausi.signIn({ email, password: String(form.get("password")) });
      if (r.twoFactorRequired) return setError("This account has two-factor on, which this example doesn't handle.");
      router.push(new URLSearchParams(location.search).get("redirect_url") ?? "/todos");
    } catch (err) {
      if (isTausiError(err) && err.code === "EMAIL_NOT_VERIFIED") setUnverified(email);
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card narrow">
      <h1>Sign in</h1>
      <form onSubmit={onSubmit}>
        <input name="email" type="email" placeholder="Email" required autoComplete="email" />
        <input name="password" type="password" placeholder="Password" required autoComplete="current-password" />
        <button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        {error && <p className="error">{error}</p>}
        {notice && <p className="ok">{notice}</p>}
        {unverified && (
          <button
            type="button"
            className="ghost"
            onClick={async () => {
              await tausi.sendVerificationEmail(unverified, { redirectTo: `${location.origin}/verify-email` });
              setError(null);
              setNotice("Verification email sent.");
            }}
          >
            Resend verification email
          </button>
        )}
      </form>
      <p className="muted">New here? <Link href="/sign-up">Create an account</Link></p>
    </section>
  );
}

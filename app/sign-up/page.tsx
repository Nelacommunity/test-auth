"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTausi } from "@tausi-auth/js/next/client";
import { describeError } from "@/components/error-text";
import { type Method, MethodTabs, normalizePhone, usePhoneEnabled } from "@/components/method-tabs";

export default function SignUp() {
  const tausi = useTausi();
  const router = useRouter();
  const phoneEnabled = usePhoneEnabled();
  const [method, setMethod] = useState<Method>("email");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Phone sign-up: the number waiting for its WhatsApp code.
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const password = String(form.get("password"));
    void run(async () => {
      if (method === "phone") {
        // Step 1: Tausi sends a 6-digit code to the number on WhatsApp. Nothing is created yet.
        const phoneNumber = normalizePhone(String(form.get("phone")));
        await tausi.signUpWithPhone({ phoneNumber, password, name });
        setPendingPhone(phoneNumber);
        return;
      }
      const email = String(form.get("email"));
      const r = await tausi.signUp({ name, email, password, redirectTo: `${location.origin}/verify-email` });
      if (r.verificationRequired) {
        setNotice("Account created. Open the link we emailed you, then sign in.");
      } else {
        await tausi.signIn({ email, password });
        router.push("/todos");
      }
    });
  }

  function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code")).trim();
    void run(async () => {
      // Step 2: the code creates the account (number verified) and signs it in.
      await tausi.verifyPhone({ phoneNumber: pendingPhone!, code });
      router.push("/todos");
      router.refresh();
    });
  }

  return (
    <section className="card narrow">
      <h1>Create an account</h1>
      {notice ? (
        <p className="ok">{notice}</p>
      ) : pendingPhone ? (
        <form onSubmit={onVerify}>
          <p className="muted">We sent a 6-digit code to {pendingPhone} on WhatsApp.</p>
          <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="123456" required autoComplete="one-time-code" />
          <button disabled={busy}>{busy ? "Checking…" : "Verify and continue"}</button>
          {error && <p className="error">{error}</p>}
          <button type="button" className="ghost" onClick={() => { setPendingPhone(null); setError(null); }}>Use another number</button>
        </form>
      ) : (
        <>
          {phoneEnabled && <MethodTabs method={method} onChange={(m) => { setMethod(m); setError(null); }} />}
          <form onSubmit={onSubmit} key={method}>
            <input name="name" placeholder="Your name" required autoComplete="name" />
            {method === "phone" ? (
              <input name="phone" type="tel" placeholder="Phone number, e.g. +255712345678" required autoComplete="tel" />
            ) : (
              <input name="email" type="email" placeholder="Email" required autoComplete="email" />
            )}
            <input name="password" type="password" placeholder="Password (10+ characters)" required minLength={10} autoComplete="new-password" />
            <button disabled={busy}>{busy ? "Creating…" : method === "phone" ? "Send code on WhatsApp" : "Sign up"}</button>
            {error && <p className="error">{error}</p>}
          </form>
        </>
      )}
      <p className="muted">Already have an account? <Link href="/sign-in">Sign in</Link></p>
    </section>
  );
}

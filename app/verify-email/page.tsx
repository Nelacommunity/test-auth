"use client";
import Link from "next/link";
import { useState } from "react";
import { useTausi } from "@tausi-auth/js/next/client";
import { describeError } from "@/components/error-text";

// The verification email links to <this app>/verify-email?token=…
// Redeemed on a click (not on page load) so email link scanners can't use up the token.
export default function VerifyEmail() {
  const tausi = useTausi();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <section className="card narrow">
      <h1>Verify your email</h1>
      {!msg?.ok && (
        <button
          onClick={async () => {
            try {
              await tausi.verifyEmail(new URLSearchParams(location.search).get("token") ?? "");
              setMsg({ ok: true, text: "Email verified. You can sign in now." });
            } catch (err) {
              setMsg({ ok: false, text: describeError(err) });
            }
          }}
        >
          Verify my email
        </button>
      )}
      {msg && <p className={msg.ok ? "ok" : "error"}>{msg.text}</p>}
      {msg?.ok && <Link href="/sign-in" className="button">Sign in</Link>}
    </section>
  );
}

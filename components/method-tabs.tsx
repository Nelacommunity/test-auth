"use client";
import { useEffect, useState } from "react";
import { useTausi } from "@tausi-auth/js/next/client";

export type Method = "email" | "phone";

/** True when the Tausi project has phone sign-in on (Dashboard → Sign-in methods). */
export function usePhoneEnabled(): boolean {
  const tausi = useTausi();
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    tausi.getProviders().then(
      // Compared as a string: the SignInMethod type lists "phone" from @tausi-auth/js 0.3.1.
      (providers) => setEnabled(providers.some((p) => (p.id as string) === "phone")),
      () => setEnabled(false),
    );
  }, [tausi]);
  return enabled;
}

/** Email / Phone switch, shown only when the project offers phone sign-in. */
export function MethodTabs({ method, onChange }: { method: Method; onChange: (m: Method) => void }) {
  return (
    <div className="tabs" role="tablist">
      {(["email", "phone"] as const).map((m) => (
        <button key={m} type="button" role="tab" aria-selected={method === m} className={method === m ? "tab active" : "tab"} onClick={() => onChange(m)}>
          {m === "email" ? "Email" : "Phone"}
        </button>
      ))}
    </div>
  );
}

/** +255 712 345 678 → +255712345678 (Tausi wants E.164). */
export const normalizePhone = (v: string) => v.replace(/[\s().-]/g, "");

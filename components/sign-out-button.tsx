"use client";
import { useRouter } from "next/navigation";
import { useTausi } from "@tausi-auth/js/next/client";
import { clearSupabaseToken } from "@/lib/supabase";

export function SignOutButton() {
  const tausi = useTausi();
  const router = useRouter();
  return (
    <button className="ghost" onClick={async () => { await tausi.signOut(); clearSupabaseToken(); router.push("/"); }}>
      Sign out
    </button>
  );
}

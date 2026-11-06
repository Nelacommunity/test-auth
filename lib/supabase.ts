"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Todo {
  id: number;
  user_id: string;
  title: string;
  done: boolean;
  created_at: string;
}

let cached: { token: string; expiresAt: number } | null = null;

/** Forget the cached JWT (on sign-out, so the next user never reuses it). */
export function clearSupabaseToken() {
  cached = null;
}

/**
 * A short-lived JWT from the Tausi project's "supabase" template, for the
 * signed-in user. It goes through this app's cookie proxy (/api/tausi), which
 * adds the HttpOnly session. Reused until 30 s before it expires; null when
 * signed out, so Supabase then treats the request as anon.
 *
 * This is what `tausi.getJwt({ template: "supabase" })` does in
 * @tausi-auth/js 0.3+; it's written out here so the app installs from npm
 * with the current release (0.2.0).
 */
async function supabaseToken(): Promise<string | null> {
  if (cached && cached.expiresAt - Date.now() > 30_000) return cached.token;
  const res = await fetch("/api/tausi/auth/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ template: "supabase" }),
    credentials: "same-origin",
  });
  if (res.status === 401) {
    cached = null;
    return null;
  }
  const body = (await res.json().catch(() => null)) as { data?: { token: string; expiresAt: string }; error?: { message: string } } | null;
  if (!res.ok || !body?.data) throw new Error(body?.error?.message ?? `Couldn't get a Supabase token (HTTP ${res.status}).`);
  cached = { token: body.data.token, expiresAt: Date.parse(body.data.expiresAt) };
  return cached.token;
}

let client: SupabaseClient | null = null;

/**
 * Supabase with Tausi as a third-party auth provider. Every request carries
 * the Tausi JWT; RLS reads the user from auth.jwt() ->> 'sub'.
 */
export function supabase(): SupabaseClient {
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    accessToken: supabaseToken,
  });
  return client;
}

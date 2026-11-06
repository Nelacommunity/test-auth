"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TausiClient } from "@tausi-auth/js";

export interface Todo {
  id: number;
  user_id: string;
  title: string;
  done: boolean;
  created_at: string;
}

let client: SupabaseClient | null = null;

/**
 * Supabase with Tausi as a third-party auth provider. Every request carries a
 * short-lived JWT from the project's "supabase" template; RLS reads the user
 * from auth.jwt() ->> 'sub'. getJwt() caches the token until 30 s before it
 * expires and returns null when signed out (Supabase then acts as anon).
 */
export function supabaseFor(tausi: TausiClient): SupabaseClient {
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    accessToken: () => tausi.getJwt({ template: "supabase" }),
  });
  return client;
}

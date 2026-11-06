import Link from "next/link";
import { redirect } from "next/navigation";
import { tausi } from "@/lib/tausi";

export default async function Home() {
  if (await tausi.currentUser()) redirect("/todos");
  return (
    <section className="hero">
      <h1>A todo list, two services</h1>
      <p className="muted">
        <strong>Tausi</strong> signs you in. <strong>Supabase</strong> stores your todos. Supabase trusts Tausi&apos;s
        signed JWTs, so Row Level Security only ever shows you your own rows. No Supabase Auth involved.
      </p>
      <p>
        <Link href="/sign-up" className="button">Create an account</Link> <Link href="/sign-in">or sign in</Link>
      </p>
    </section>
  );
}

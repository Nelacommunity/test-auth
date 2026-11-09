import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { publicConfig, tausi } from "@/lib/tausi";
import { Providers } from "./providers";
import "./globals.css";

export const metadata = { title: "Todos · Tausi + Supabase" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await tausi.currentUser();
  return (
    <html lang="en">
      <body>
        <Providers {...publicConfig()}>
          <header>
            <Link href="/" className="brand">✓ Todos</Link>
            <nav>
              {user ? (
                <>
                  <Link href="/todos">My todos</Link>
                  <span className="muted">{user.email || user.phoneNumber}</span>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/sign-in">Sign in</Link>
                  <Link href="/sign-up" className="button">Sign up</Link>
                </>
              )}
            </nav>
          </header>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

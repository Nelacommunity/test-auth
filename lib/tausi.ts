import "server-only";
import { createTausiNext } from "@tausi-auth/js/next";

const env = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is missing: copy .env.example to .env.local and fill it in.`);
  return v;
};

/** Cookie-mode session (HttpOnly cookie), auth() / requireAuth(), the proxy route and the proxy.ts guard. */
export const tausi = createTausiNext({
  baseUrl: env("TAUSI_URL"),
  publishableKey: env("TAUSI_PUBLISHABLE_KEY"),
  secretKey: env("TAUSI_SECRET_KEY"),
  signInUrl: "/sign-in",
  // Cookies ignore ports, so give this example its own name on localhost.
  cookieName: "tausi_todo",
});

export const publicConfig = () => ({ baseUrl: env("TAUSI_URL"), publishableKey: env("TAUSI_PUBLISHABLE_KEY") });

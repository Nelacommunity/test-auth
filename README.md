# Todos: Tausi + Supabase

A Next.js 16 todo list. **Tausi** signs users in (cookie mode, HttpOnly cookie). **Supabase** stores the todos and trusts Tausi's signed JWTs through *third-party auth*, so Row Level Security keeps every user to their own rows. Supabase Auth isn't used.

```
browser ── sign in ──▶ /api/tausi/* (proxy, holds the cookie) ──▶ Tausi
   │
   └─ supabase-js ── Authorization: Bearer <JWT from tausi.getJwt({ template: "supabase" })> ──▶ Supabase
                                                    Supabase checks it against Tausi's JWKS, then RLS: user_id = sub
```

Supabase's servers fetch Tausi's JWKS over https, so this needs a **deployed** Tausi (e.g. `https://auth.tausi.app`) and a hosted Supabase project. A Tausi on `localhost` can't be reached by Supabase.

## 1. Tausi project

In the Tausi dashboard, create a project (or use one) and set:

- **App URL:** `http://localhost:3002` (email links open `/verify-email` here)
- **Allowed origins:** `http://localhost:3002`
- **Connectors → Templates → Supabase**: save the preset as is (name `supabase`, audience `authenticated`, claim `role: authenticated`).
- Copy the **issuer URL** from Connectors, and the **publishable** and **secret** keys from API keys.

### Phone sign-in (optional)

To let people sign up with a phone number instead of an email:

- **Sign-in methods → Phone number and password**: turn it on. The Tausi server needs `WASEND_API` (WaSend) to send the WhatsApp codes.
- Sign-up and sign-in then show an **Email / Phone** switch. A phone sign-up sends a 6-digit code on WhatsApp; entering it creates the account and signs in. Later sign-ins use the number and password (no WhatsApp).
- Phone-only users have no email (`user.email` is `""`), so the header shows their number. Their todos work the same: Supabase only looks at `sub`.

## 2. Supabase project

1. **Authentication → Sign In / Providers → Third-party auth → Add provider → OpenID Connect**: paste the Tausi issuer URL.
2. **SQL Editor**: run [`supabase/schema.sql`](supabase/schema.sql) after replacing `<ISSUER>` (two places) with that issuer URL.
3. **Project Settings → API**: copy the project URL and the anon (publishable) key.

## 3. Run

```sh
cp .env.example .env.local     # fill in the Tausi and Supabase values
npm install
npm run dev                    # http://localhost:3002
```

Everything installs from npm, so it deploys as is (Vercel: set the root directory to `todo-supabase` and add the same environment variables).

## How it works

- `lib/supabase.ts`: `createClient(url, anonKey, { accessToken })`, where `accessToken` asks this app's Tausi proxy for a JWT from the `supabase` template (`POST /api/tausi/auth/token`). The token lasts an hour and is reused until 30 s before it expires. With `@tausi-auth/js` 0.3+ this is one line: `accessToken: () => tausi.getJwt({ template: "supabase" })`.
- `components/todo-list.tsx`: plain supabase-js queries with **no user filter**. RLS returns only your rows, and `user_id` defaults to the token's `sub` on insert.
- `app/sign-up/page.tsx` / `app/sign-in/page.tsx`: `tausi.signUpWithPhone()` → `tausi.verifyPhone()` and `tausi.signInWithPhone()` for phone accounts (`@tausi-auth/js` 0.3.1+), shown when `getProviders()` lists `phone`.
- `app/todos/page.tsx`: server component; `tausi.requireAuth()` verifies the session with Tausi and redirects to `/sign-in` otherwise. `proxy.ts` does a fast cookie check first.

## Try it

- Sign up two accounts (two browsers or a private window): each sees only their own todos.
- Open the browser devtools on `/todos`, copy the `Authorization` header of a Supabase request and paste the token into https://jwt.io: `iss` is your Tausi project, `sub` your user id, `aud` `authenticated`.
- Sign out: Supabase requests now go out as `anon` and RLS returns nothing.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `No JWT template named "supabase"` | Save the Supabase preset on the Tausi project's Connectors tab. |
| Supabase returns `401` / `PGRST301` / "No suitable key" | The third-party auth issuer URL must match the token's `iss` exactly; Supabase must be able to reach `<issuer>/.well-known/jwks.json`. |
| Empty list, inserts fail with "row-level security" | `<ISSUER>` in the policy doesn't match, or the template lacks `role: authenticated`. |
| `ORIGIN_NOT_ALLOWED` | Add `http://localhost:3002` to the project's allowed origins. |

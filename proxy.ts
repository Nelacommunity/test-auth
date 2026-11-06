// Sends visitors without a session cookie to /sign-in (no network call).
// The page still verifies the session with requireAuth().
import { tausi } from "@/lib/tausi";

export const proxy = tausi.proxy({ protect: ["/todos"] });

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|api/tausi).*)"] };

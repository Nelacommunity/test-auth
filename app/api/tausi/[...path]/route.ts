// Cookie-mode proxy: the browser calls /api/tausi/*, this route adds the session
// from the HttpOnly cookie and forwards to Tausi. getJwt() goes through here too.
import { tausi } from "@/lib/tausi";

export const { GET, POST, PATCH, DELETE } = tausi.proxyHandlers;

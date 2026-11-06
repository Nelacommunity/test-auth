import { isTausiError } from "@tausi-auth/js";

/** User-facing text for a TausiError (validation errors list each field's problem) or any other error. */
export function describeError(e: unknown): string {
  if (isTausiError(e)) {
    if (e.code === "RATE_LIMITED" && e.retryAfter) return `Too many attempts. Try again in ${e.retryAfter}s.`;
    const issues = (e.details as { issues?: { path?: string; message: string }[] } | undefined)?.issues;
    if (e.code === "VALIDATION_ERROR" && issues?.length) return issues.map((i) => i.message).join(" ");
    return e.message;
  }
  if (e && typeof e === "object" && "message" in e && typeof e.message === "string") return e.message;
  return "Something went wrong.";
}

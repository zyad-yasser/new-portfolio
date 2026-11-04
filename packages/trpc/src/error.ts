import { TRPCClientError } from "@trpc/client";

const SAFE_ERROR_CODES = new Set([
  "BAD_REQUEST",
  "FORBIDDEN",
  "CONFLICT",
  "TOO_MANY_REQUESTS",
  "UNPROCESSABLE_CONTENT",
  "PAYLOAD_TOO_LARGE",
]);

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof TRPCClientError)) {
    return fallback;
  }

  const code = error.data?.code;
  if (typeof code !== "string" || !SAFE_ERROR_CODES.has(code)) {
    return fallback;
  }

  return error.message && error.message !== code ? error.message : fallback;
}

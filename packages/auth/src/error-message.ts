type AuthClientError = {
  status?: number | undefined;
  message?: string | undefined;
};

export function getAuthErrorMessage(
  error: AuthClientError | null | undefined,
  fallback: string
): string {
  if (!error || typeof error.status !== "number") {
    return fallback;
  }

  if (error.status >= 400 && error.status < 500 && error.message) {
    return error.message;
  }

  return fallback;
}

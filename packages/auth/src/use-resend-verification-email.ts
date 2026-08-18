"use client";

import { useEffect, useState } from "react";
import { getAuthErrorMessage } from "./error-message";
import { publicAuthClient } from "./public-client";

export const VERIFICATION_EMAIL_COOLDOWN_MS = 15 * 60 * 1000;

function storageKey(email: string) {
  return `verification-email-last-sent:${email}`;
}

export function markVerificationEmailSent(email: string, at: number = Date.now()) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKey(email), String(at));
}

function readLastSentAt(email: string): number | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(storageKey(email));
  return raw ? Number(raw) : null;
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function useResendVerificationEmail(email: string | undefined, callbackURL: string) {
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLastSentAt(email ? readLastSentAt(email) : null);
  }, [email]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = lastSentAt
    ? Math.max(0, lastSentAt + VERIFICATION_EMAIL_COOLDOWN_MS - now)
    : 0;
  const onCooldown = remainingMs > 0;

  async function resend() {
    if (!email || onCooldown || sending) {
      return;
    }

    setSending(true);
    setError(null);

    let retryAfterSeconds: number | null = null;

    const { error: sendError } = await publicAuthClient.sendVerificationEmail(
      { email, callbackURL },
      {
        onResponse: (context) => {
          const header = context.response.headers.get("X-Retry-After");
          retryAfterSeconds = header ? Number(header) : null;
        },
      }
    );

    setSending(false);

    if (sendError) {
      if (sendError.status === 429) {
        const remaining = retryAfterSeconds
          ? retryAfterSeconds * 1000
          : VERIFICATION_EMAIL_COOLDOWN_MS;
        const sentAt = Date.now() - (VERIFICATION_EMAIL_COOLDOWN_MS - remaining);
        markVerificationEmailSent(email, sentAt);
        setLastSentAt(sentAt);
        setError("You've already requested a verification email recently.");
      } else {
        setError(getAuthErrorMessage(sendError, "Couldn't send the email."));
      }
      return;
    }

    const sentAt = Date.now();
    markVerificationEmailSent(email, sentAt);
    setLastSentAt(sentAt);
  }

  return { resend, sending, error, onCooldown, remainingMs };
}

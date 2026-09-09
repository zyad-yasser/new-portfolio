"use client";

import { useEffect, useState } from "react";

export const PASSWORD_RESET_COOLDOWN_MS = 15 * 60 * 1000;

function storageKey(email: string) {
  return `password-reset-available-at:${email.trim().toLowerCase()}`;
}

function readAvailableAt(email: string): number | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey(email));
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeAvailableAt(email: string, availableAt: number) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(storageKey(email), String(availableAt));
  } catch {}
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function readRetryAfterMs(error: unknown, response?: Response): number | null {
  if (error && typeof error === "object" && "retryAfterSeconds" in error) {
    const value = (error as { retryAfterSeconds?: unknown }).retryAfterSeconds;
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value * 1000;
    }
  }

  const header = response?.headers.get("X-Retry-After");
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds * 1000;
    }
  }

  return null;
}

export function usePasswordResetCooldown(email: string) {
  const [now, setNow] = useState(() => Date.now());
  const [availableAt, setAvailableAt] = useState<number | null>(null);

  useEffect(() => {
    const trimmed = email.trim();
    setAvailableAt(trimmed ? readAvailableAt(trimmed) : null);
  }, [email]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = availableAt ? Math.max(0, availableAt - now) : 0;

  function startCooldown(cooldownEmail: string, durationMs: number) {
    const next = Date.now() + Math.max(0, durationMs);
    writeAvailableAt(cooldownEmail, next);
    setAvailableAt(next);
  }

  return { remainingMs, onCooldown: remainingMs > 0, startCooldown };
}

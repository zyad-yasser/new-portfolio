import { createHash } from "node:crypto";
import { getRedis } from "@repo/utils/redis";

export const PASSWORD_RESET_COOLDOWN_MS = 15 * 60 * 1000;

const COOLDOWN_SECONDS = Math.floor(PASSWORD_RESET_COOLDOWN_MS / 1000);
const TOKEN_MEMORY_SECONDS = 60 * 60;

type ResetStorage = {
  delete: (key: string) => Promise<void>;
};

function emailFingerprint(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 32);
}

function cooldownKey(email: string) {
  return `pwreset:cooldown:${emailFingerprint(email)}`;
}

function issuedTokenKey(email: string) {
  return `pwreset:issued-token:${emailFingerprint(email)}`;
}

export function formatCooldown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }

  return `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds}s`;
}

export async function getResetCooldownRemainingMs(email: string): Promise<number> {
  try {
    const sentAt = await getRedis().get<number>(cooldownKey(email));
    if (typeof sentAt !== "number") {
      return 0;
    }
    return Math.max(0, sentAt + PASSWORD_RESET_COOLDOWN_MS - Date.now());
  } catch {
    return 0;
  }
}

export async function startResetCooldown(email: string): Promise<void> {
  try {
    await getRedis().set(cooldownKey(email), Date.now(), { ex: COOLDOWN_SECONDS });
  } catch {}
}

export async function replaceIssuedResetToken(
  email: string,
  token: string,
  storage: ResetStorage
): Promise<void> {
  const redis = getRedis();
  const key = issuedTokenKey(email);

  try {
    const previousToken = await redis.get<string>(key);
    if (previousToken && previousToken !== token) {
      await storage.delete(`verification:reset-password:${previousToken}`);
    }
    await redis.set(key, token, { ex: TOKEN_MEMORY_SECONDS });
  } catch {}
}

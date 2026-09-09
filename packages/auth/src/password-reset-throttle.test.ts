import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, { value: unknown; expiresAt: number }>();

vi.mock("@repo/utils/redis", () => ({
  getRedis: () => ({
    get: async (key: string) => {
      const entry = store.get(key);
      if (!entry || entry.expiresAt <= Date.now()) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    set: async (key: string, value: unknown, opts?: { ex?: number }) => {
      store.set(key, {
        value,
        expiresAt: Date.now() + (opts?.ex ?? 60) * 1000,
      });
    },
  }),
}));

const {
  PASSWORD_RESET_COOLDOWN_MS,
  formatCooldown,
  getResetCooldownRemainingMs,
  replaceIssuedResetToken,
  startResetCooldown,
} = await import("./password-reset-throttle");

describe("formatCooldown", () => {
  it("renders sub-minute waits in seconds", () => {
    expect(formatCooldown(30_000)).toBe("30 seconds");
    expect(formatCooldown(1_000)).toBe("1 second");
  });

  it("renders longer waits as minutes and seconds", () => {
    expect(formatCooldown(14 * 60_000 + 30_000)).toBe("14 minutes 30s");
    expect(formatCooldown(60_000)).toBe("1 minute 0s");
  });

  it("never goes negative", () => {
    expect(formatCooldown(-5_000)).toBe("0 seconds");
  });
});

describe("reset cooldown", () => {
  beforeEach(() => {
    store.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports no cooldown for an email that never requested a reset", async () => {
    expect(await getResetCooldownRemainingMs("nobody@example.com")).toBe(0);
  });

  it("reports a full cooldown immediately after starting one", async () => {
    await startResetCooldown("a@example.com");
    expect(await getResetCooldownRemainingMs("a@example.com")).toBe(PASSWORD_RESET_COOLDOWN_MS);
  });

  it("counts the cooldown down as time passes", async () => {
    await startResetCooldown("a@example.com");
    vi.advanceTimersByTime(5 * 60_000);
    expect(await getResetCooldownRemainingMs("a@example.com")).toBe(
      PASSWORD_RESET_COOLDOWN_MS - 5 * 60_000
    );
  });

  it("clears once the window has passed", async () => {
    await startResetCooldown("a@example.com");
    vi.advanceTimersByTime(PASSWORD_RESET_COOLDOWN_MS + 1_000);
    expect(await getResetCooldownRemainingMs("a@example.com")).toBe(0);
  });

  it("treats an email as the same regardless of case and surrounding space", async () => {
    await startResetCooldown("Someone@Example.com");
    expect(await getResetCooldownRemainingMs("  someone@example.com  ")).toBe(
      PASSWORD_RESET_COOLDOWN_MS
    );
  });

  it("keeps cooldowns independent per email", async () => {
    await startResetCooldown("a@example.com");
    expect(await getResetCooldownRemainingMs("b@example.com")).toBe(0);
  });
});

describe("replaceIssuedResetToken", () => {
  beforeEach(() => {
    store.clear();
  });

  it("does not delete anything on the first issued token", async () => {
    const deleted: string[] = [];
    await replaceIssuedResetToken("a@example.com", "token-1", {
      delete: async (key) => {
        deleted.push(key);
      },
    });
    expect(deleted).toEqual([]);
  });

  it("deletes the previously issued token when a new one is issued", async () => {
    const deleted: string[] = [];
    const storage = {
      delete: async (key: string) => {
        deleted.push(key);
      },
    };

    await replaceIssuedResetToken("a@example.com", "token-1", storage);
    await replaceIssuedResetToken("a@example.com", "token-2", storage);

    expect(deleted).toEqual(["verification:reset-password:token-1"]);
  });

  it("only ever invalidates the immediately preceding token", async () => {
    const deleted: string[] = [];
    const storage = {
      delete: async (key: string) => {
        deleted.push(key);
      },
    };

    await replaceIssuedResetToken("a@example.com", "token-1", storage);
    await replaceIssuedResetToken("a@example.com", "token-2", storage);
    await replaceIssuedResetToken("a@example.com", "token-3", storage);

    expect(deleted).toEqual([
      "verification:reset-password:token-1",
      "verification:reset-password:token-2",
    ]);
  });

  it("does not delete a token when the same one is re-issued", async () => {
    const deleted: string[] = [];
    const storage = {
      delete: async (key: string) => {
        deleted.push(key);
      },
    };

    await replaceIssuedResetToken("a@example.com", "token-1", storage);
    await replaceIssuedResetToken("a@example.com", "token-1", storage);

    expect(deleted).toEqual([]);
  });

  it("does not cross-invalidate tokens belonging to a different email", async () => {
    const deleted: string[] = [];
    const storage = {
      delete: async (key: string) => {
        deleted.push(key);
      },
    };

    await replaceIssuedResetToken("a@example.com", "token-a", storage);
    await replaceIssuedResetToken("b@example.com", "token-b", storage);

    expect(deleted).toEqual([]);
  });
});

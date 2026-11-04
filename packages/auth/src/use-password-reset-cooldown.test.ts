import { describe, expect, it } from "vitest";
import { formatCountdown, readRetryAfterMs } from "./use-password-reset-cooldown";

function responseWith(headers: Record<string, string>) {
  return new Response(null, { headers });
}

describe("readRetryAfterMs", () => {
  it("prefers the structured retryAfterSeconds from the error body", () => {
    expect(readRetryAfterMs({ retryAfterSeconds: 831 })).toBe(831_000);
  });

  it("reads the real remaining time rather than assuming a full window", () => {
    const thirteenMinutes = 13 * 60;
    expect(readRetryAfterMs({ retryAfterSeconds: thirteenMinutes })).toBe(780_000);
  });

  it("falls back to the X-Retry-After header when the body has no field", () => {
    expect(readRetryAfterMs({ message: "nope" }, responseWith({ "X-Retry-After": "300" }))).toBe(
      300_000
    );
  });

  it("prefers the body field over the header when both are present", () => {
    expect(
      readRetryAfterMs({ retryAfterSeconds: 60 }, responseWith({ "X-Retry-After": "300" }))
    ).toBe(60_000);
  });

  it("returns null when neither source is present, so no cooldown is invented", () => {
    expect(readRetryAfterMs({ message: "boom" })).toBeNull();
    expect(readRetryAfterMs({ message: "boom" }, responseWith({}))).toBeNull();
    expect(readRetryAfterMs(null)).toBeNull();
    expect(readRetryAfterMs(undefined)).toBeNull();
  });

  it("ignores non-positive or non-numeric values", () => {
    expect(readRetryAfterMs({ retryAfterSeconds: 0 })).toBeNull();
    expect(readRetryAfterMs({ retryAfterSeconds: -5 })).toBeNull();
    expect(readRetryAfterMs({ retryAfterSeconds: "600" })).toBeNull();
    expect(readRetryAfterMs({ retryAfterSeconds: Number.NaN })).toBeNull();
    expect(readRetryAfterMs({}, responseWith({ "X-Retry-After": "soon" }))).toBeNull();
  });
});

describe("formatCountdown", () => {
  it("pads seconds to two digits", () => {
    expect(formatCountdown(13 * 60_000 + 5_000)).toBe("13:05");
    expect(formatCountdown(60_000)).toBe("1:00");
  });

  it("floors at zero", () => {
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(-1_000)).toBe("0:00");
  });
});

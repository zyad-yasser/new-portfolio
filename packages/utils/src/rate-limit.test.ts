import { describe, expect, it } from "vitest";
import { getClientIp } from "./rate-limit";

describe("getClientIp", () => {
  it("prefers the Vercel-set header over client-controllable ones", () => {
    const headers = new Headers({
      "x-forwarded-for": "6.6.6.6, 1.1.1.1",
      "x-real-ip": "2.2.2.2",
      "x-vercel-forwarded-for": "3.3.3.3",
    });
    expect(getClientIp(headers)).toBe("3.3.3.3");
  });

  it("falls back to x-real-ip, then the first x-forwarded-for entry", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "6.6.6.6" }))).toBe(
      "2.2.2.2"
    );
    expect(getClientIp(new Headers({ "x-forwarded-for": "6.6.6.6, 1.1.1.1" }))).toBe("6.6.6.6");
  });

  it("returns the local address when no header is present", () => {
    expect(getClientIp(new Headers())).toBe("127.0.0.1");
  });
});

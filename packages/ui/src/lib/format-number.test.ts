import { describe, expect, it } from "vitest";
import { formatCompactNumber, formatExactNumber } from "./format-number";

describe("formatCompactNumber", () => {
  it("returns small numbers unchanged", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(1)).toBe("1");
    expect(formatCompactNumber(42)).toBe("42");
    expect(formatCompactNumber(999)).toBe("999");
  });

  it("groups numbers below the compact threshold", () => {
    expect(formatCompactNumber(1_000)).toBe("1,000");
    expect(formatCompactNumber(9_999)).toBe("9,999");
  });

  it("switches to compact notation at ten thousand", () => {
    expect(formatCompactNumber(10_000)).toBe("10K");
    expect(formatCompactNumber(12_400)).toBe("12K");
    expect(formatCompactNumber(999_000)).toBe("999K");
  });

  it("formats millions, billions and trillions", () => {
    expect(formatCompactNumber(1_000_000)).toBe("1M");
    expect(formatCompactNumber(1_240_000)).toBe("1.2M");
    expect(formatCompactNumber(12_400_000)).toBe("12M");
    expect(formatCompactNumber(3_400_000_000)).toBe("3.4B");
    expect(formatCompactNumber(2_500_000_000_000)).toBe("2.5T");
  });

  it("truncates rather than rounds up, so a count never overstates itself", () => {
    expect(formatCompactNumber(1_999_999)).toBe("1.9M");
    expect(formatCompactNumber(19_999)).toBe("19K");
  });

  it("drops a trailing .0", () => {
    expect(formatCompactNumber(2_000_000)).toBe("2M");
    expect(formatCompactNumber(5_000_000_000)).toBe("5B");
  });

  it("handles negatives symmetrically", () => {
    expect(formatCompactNumber(-42)).toBe("-42");
    expect(formatCompactNumber(-1_240_000)).toBe("-1.2M");
  });

  it("truncates fractional input", () => {
    expect(formatCompactNumber(42.9)).toBe("42");
    expect(formatCompactNumber(1_250_500.7)).toBe("1.2M");
  });

  it("falls back to 0 for non-finite input", () => {
    expect(formatCompactNumber(Number.NaN)).toBe("0");
    expect(formatCompactNumber(Number.POSITIVE_INFINITY)).toBe("0");
  });
});

describe("formatExactNumber", () => {
  it("groups thousands", () => {
    expect(formatExactNumber(1_240_000)).toBe("1,240,000");
    expect(formatExactNumber(999)).toBe("999");
  });

  it("falls back to 0 for non-finite input", () => {
    expect(formatExactNumber(Number.NaN)).toBe("0");
  });
});

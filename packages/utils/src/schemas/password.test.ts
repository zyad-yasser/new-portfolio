import { describe, expect, it } from "vitest";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  passwordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "./password";

describe("passwordSchema", () => {
  it("rejects passwords shorter than the minimum", () => {
    const result = passwordSchema.safeParse("a".repeat(MIN_PASSWORD_LENGTH - 1));
    expect(result.success).toBe(false);
  });

  it("accepts a password exactly at the minimum", () => {
    expect(passwordSchema.safeParse("a".repeat(MIN_PASSWORD_LENGTH)).success).toBe(true);
  });

  it("accepts a password exactly at the maximum", () => {
    expect(passwordSchema.safeParse("a".repeat(MAX_PASSWORD_LENGTH)).success).toBe(true);
  });

  it("rejects a password past the maximum", () => {
    expect(passwordSchema.safeParse("a".repeat(MAX_PASSWORD_LENGTH + 1)).success).toBe(false);
  });
});

describe("requestPasswordResetSchema", () => {
  it("requires an email", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("trims surrounding whitespace", () => {
    const result = requestPasswordResetSchema.safeParse({ email: "  a@b.com  " });
    expect(result.success).toBe(true);
    expect(result.success && result.data.email).toBe("a@b.com");
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching valid passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "correct-horse",
      confirmPassword: "correct-horse",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords on the confirm field", () => {
    const result = resetPasswordSchema.safeParse({
      password: "correct-horse",
      confirmPassword: "correct-hors",
    });
    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0]?.path).toEqual(["confirmPassword"]);
  });

  it("rejects a too-short password even when both fields match", () => {
    const result = resetPasswordSchema.safeParse({ password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  it("requires the confirm field to be filled", () => {
    const result = resetPasswordSchema.safeParse({
      password: "correct-horse",
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });
});

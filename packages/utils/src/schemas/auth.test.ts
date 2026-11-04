import { describe, expect, it } from "vitest";
import { MAX_NAME_LENGTH, loginSchema, signupSchema } from "./auth";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./password";

function messageFor(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message;
}

describe("loginSchema", () => {
  const valid = { email: "user@example.com", password: "secret", rememberMe: true };

  it("accepts valid credentials", () => {
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });

  it("reports a missing email before an invalid one", () => {
    expect(messageFor(loginSchema.safeParse({ ...valid, email: "" }))).toBe("Email is required");
  });

  it("rejects a malformed email", () => {
    expect(messageFor(loginSchema.safeParse({ ...valid, email: "not-an-email" }))).toBe(
      "Enter a valid email address"
    );
  });

  it("trims surrounding whitespace from the email", () => {
    const result = loginSchema.safeParse({ ...valid, email: "  user@example.com  " });
    expect(result.success && result.data.email).toBe("user@example.com");
  });

  it("requires a password without imposing the signup length rule", () => {
    expect(messageFor(loginSchema.safeParse({ ...valid, password: "" }))).toBe(
      "Password is required"
    );
    expect(loginSchema.safeParse({ ...valid, password: "short" }).success).toBe(true);
  });
});

describe("signupSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "a".repeat(MIN_PASSWORD_LENGTH),
  };

  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a name that is not only whitespace", () => {
    expect(messageFor(signupSchema.safeParse({ ...valid, name: "   " }))).toBe("Name is required");
  });

  it("rejects a name past the maximum", () => {
    expect(
      messageFor(signupSchema.safeParse({ ...valid, name: "a".repeat(MAX_NAME_LENGTH + 1) }))
    ).toBe(`Name must be at most ${MAX_NAME_LENGTH} characters`);
  });

  it("enforces the shared password policy", () => {
    expect(
      signupSchema.safeParse({ ...valid, password: "a".repeat(MIN_PASSWORD_LENGTH - 1) }).success
    ).toBe(false);
    expect(
      signupSchema.safeParse({ ...valid, password: "a".repeat(MAX_PASSWORD_LENGTH + 1) }).success
    ).toBe(false);
  });
});

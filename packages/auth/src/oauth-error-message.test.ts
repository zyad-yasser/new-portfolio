import { describe, expect, it } from "vitest";
import { getOAuthErrorContent } from "./oauth-error-message";

describe("getOAuthErrorContent", () => {
  it("explains the account-not-linked case and points at the fix", () => {
    const content = getOAuthErrorContent("account_not_linked");
    expect(content.title).toBe("This email already has an account");
    expect(content.description).toMatch(/email and password/i);
    expect(content.description).toMatch(/verif/i);
    expect(content.canRetry).toBe(false);
  });

  it("does not offer a pointless retry for errors that will repeat", () => {
    for (const code of [
      "account_not_linked",
      "unable_to_link_account",
      "account_already_linked_to_different_user",
      "email_doesn't_match",
    ]) {
      expect(getOAuthErrorContent(code).canRetry).toBe(false);
    }
  });

  it("offers a retry for transient failures", () => {
    for (const code of ["invalid_code", "no_code", "access_denied", "unable_to_get_user_info"]) {
      expect(getOAuthErrorContent(code).canRetry).toBe(true);
    }
  });

  it("handles the apostrophe in better-auth's email_doesn't_match code", () => {
    expect(getOAuthErrorContent("email_doesn't_match").title).toBe("Email doesn't match");
  });

  it("falls back for unknown, null and empty codes", () => {
    const fallback = getOAuthErrorContent(null);
    expect(fallback.title).toBe("Sign-in failed");
    expect(getOAuthErrorContent(undefined)).toEqual(fallback);
    expect(getOAuthErrorContent("")).toEqual(fallback);
    expect(getOAuthErrorContent("something_totally_new")).toEqual(fallback);
  });

  it("never returns an empty title or description", () => {
    for (const code of [
      "account_not_linked",
      "unable_to_link_account",
      "signup_disabled",
      "unable_to_create_user",
      "unable_to_create_session",
      "made_up_code",
      null,
    ]) {
      const content = getOAuthErrorContent(code);
      expect(content.title.length).toBeGreaterThan(0);
      expect(content.description.length).toBeGreaterThan(0);
    }
  });

  it("does not leak raw error codes into user-facing text", () => {
    for (const code of ["account_not_linked", "unable_to_link_account", "invalid_code"]) {
      const content = getOAuthErrorContent(code);
      expect(`${content.title} ${content.description}`).not.toContain("_");
    }
  });
});

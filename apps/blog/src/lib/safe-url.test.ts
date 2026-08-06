import { describe, expect, it } from "vitest";
import { isSafeHttpUrl } from "./safe-url";

describe("isSafeHttpUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isSafeHttpUrl("https://example.com")).toBe(true);
    expect(isSafeHttpUrl("http://example.com/path?query=1")).toBe(true);
  });

  it("rejects javascript: and data: URIs", () => {
    expect(isSafeHttpUrl("javascript:alert(document.cookie)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("rejects other non-http schemes", () => {
    expect(isSafeHttpUrl("mailto:someone@example.com")).toBe(false);
    expect(isSafeHttpUrl("ftp://example.com")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(isSafeHttpUrl("not a url")).toBe(false);
    expect(isSafeHttpUrl("")).toBe(false);
  });
});

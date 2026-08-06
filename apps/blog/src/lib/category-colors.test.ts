import { describe, expect, it } from "vitest";
import { CATEGORY_COLORS, categoryColorClasses, isCategoryColor } from "./category-colors";

describe("isCategoryColor", () => {
  it("accepts every color in the known palette", () => {
    for (const color of CATEGORY_COLORS) {
      expect(isCategoryColor(color)).toBe(true);
    }
  });

  it("rejects unknown values", () => {
    expect(isCategoryColor("chartreuse")).toBe(false);
    expect(isCategoryColor("")).toBe(false);
  });
});

describe("categoryColorClasses", () => {
  it("returns the matching palette entry for a known color", () => {
    expect(categoryColorClasses("amber").dot).toContain("amber");
    expect(categoryColorClasses("violet").badge).toContain("violet");
  });

  it("falls back to slate for null, undefined, or unrecognized colors", () => {
    const fallback = categoryColorClasses("slate");
    expect(categoryColorClasses(null)).toEqual(fallback);
    expect(categoryColorClasses(undefined)).toEqual(fallback);
    expect(categoryColorClasses("not-a-real-color")).toEqual(fallback);
  });
});

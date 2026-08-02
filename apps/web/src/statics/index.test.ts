import { describe, expect, it } from "vitest";
import { otherProjects, productionProjects, testimonials } from "./index";

describe("site content", () => {
  it("has at least one production project with required fields", () => {
    expect(productionProjects.length).toBeGreaterThan(0);
    for (const project of productionProjects) {
      expect(project.name).toBeTruthy();
      expect(project.description).toBeTruthy();
    }
  });

  it("keeps otherProjects and testimonials as arrays", () => {
    expect(Array.isArray(otherProjects)).toBe(true);
    expect(Array.isArray(testimonials)).toBe(true);
  });
});

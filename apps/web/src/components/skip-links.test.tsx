import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkipLinks } from "./skip-links";

describe("SkipLinks", () => {
  it("renders a skip-to-main-content link", () => {
    render(<SkipLinks />);

    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link).toHaveAttribute("href", "#main-content");
  });
});

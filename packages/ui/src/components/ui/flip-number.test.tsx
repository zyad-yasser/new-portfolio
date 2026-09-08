import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlipNumber } from "./flip-number";

describe("FlipNumber", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderFlip(props: Parameters<typeof FlipNumber>[0]) {
    const result = render(<FlipNumber {...props} />);
    act(() => {
      vi.runOnlyPendingTimers();
    });
    return result;
  }

  it("renders the compact form one character per cell", () => {
    const { container } = renderFlip({ value: 1_240_000 });
    const chars = container.querySelectorAll(".flip-char");

    expect(
      Array.from(chars)
        .map((node) => node.textContent)
        .join("")
    ).toBe("1.2M");
  });

  it("renders the exact value for screen readers", () => {
    renderFlip({ value: 1_240_000, label: "reactions" });

    expect(screen.getByText("1,240,000 reactions")).toBeInTheDocument();
  });

  it("renders the exact grouped value when compact is off", () => {
    const { container } = renderFlip({ value: 12_345, compact: false });
    const chars = container.querySelectorAll(".flip-char");

    expect(
      Array.from(chars)
        .map((node) => node.textContent)
        .join("")
    ).toBe("12,345");
  });

  it("does not animate on first paint", () => {
    const { container } = render(<FlipNumber value={7} />);

    expect(container.querySelector(".flip-char-active")).toBeNull();
  });

  it("flips only the characters that changed", () => {
    const { container, rerender } = renderFlip({ value: 18 });

    act(() => {
      rerender(<FlipNumber value={19} />);
    });

    const chars = Array.from(container.querySelectorAll(".flip-char"));
    expect(chars[0]?.classList.contains("flip-char-active")).toBe(false);
    expect(chars[1]?.classList.contains("flip-char-active")).toBe(true);
  });

  it("shows both the outgoing and incoming character mid-flip", () => {
    const { container, rerender } = renderFlip({ value: 1 });

    act(() => {
      rerender(<FlipNumber value={2} />);
    });

    expect(container.querySelector(".flip-char-outgoing")?.textContent).toBe("1");
    expect(container.querySelector(".flip-char-incoming")?.textContent).toBe("2");
  });

  it("settles on the new character once the flip finishes", () => {
    const { container, rerender } = renderFlip({ value: 1 });

    act(() => {
      rerender(<FlipNumber value={2} />);
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(container.querySelector(".flip-char-active")).toBeNull();
    expect(container.querySelector(".flip-char")?.textContent).toBe("2");
  });

  it("keeps the accessible label in sync after a change", () => {
    const { rerender } = renderFlip({ value: 999, label: "comments" });

    act(() => {
      rerender(<FlipNumber value={1_000} label="comments" />);
    });

    expect(screen.getByText("1,000 comments")).toBeInTheDocument();
  });

  it("hides the animated track from assistive tech", () => {
    const { container } = renderFlip({ value: 5 });

    expect(container.querySelector(".flip-number-track")).toHaveAttribute("aria-hidden", "true");
  });
});

import { Button } from "@repo/ui/button";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("Vitest + Testing Library setup", () => {
  it("renders a shared @repo/ui component and handles clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeInTheDocument();

    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});

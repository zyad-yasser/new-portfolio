import { expect, test } from "@playwright/test";

const SLUG = "two-better-auth-instances-one-database";

test("post detail page renders content, reactions, and comments", async ({ page }) => {
  await page.goto(`/post/${SLUG}`);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Two Better Auth Instances, One Database"
  );
  await expect(page.getByText(/Why splitting authentication/)).toBeVisible();
  await expect(page.getByText("typescript", { exact: true })).toBeVisible();
  await expect(page.getByText("postgres", { exact: true })).toBeVisible();

  // Reaction bar renders all five reaction buttons.
  await expect(page.getByRole("button", { name: "Like" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Fire" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();
});

test("reacting while signed out is a no-op, not a crash", async ({ page }) => {
  await page.goto(`/post/${SLUG}`);

  const likeButton = page.getByRole("button", { name: "Like" });
  await expect(likeButton).toBeDisabled();
});

test("viewing an unknown slug shows a not-found state", async ({ page }) => {
  await page.goto("/post/this-post-does-not-exist");

  await expect(page.getByRole("heading", { name: "Post not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to blog" })).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("author name on a post links to a working profile page", async ({ page }) => {
  await page.goto("/post/two-better-auth-instances-one-database");

  await page.getByRole("link", { name: "Zyad Yasser" }).first().click();

  await expect(page).toHaveURL(/\/u\/[\w-]+$/);
  await expect(page.getByRole("heading", { level: 1, name: "Zyad Yasser" })).toBeVisible();
  await expect(page.getByText(/^@/)).toBeVisible();
  await expect(page.getByRole("tab", { name: "Posts" })).toBeVisible();
  await expect(page.getByText("Followers", { exact: true })).toBeVisible();
});

test("profile Posts/About tabs switch content", async ({ page }) => {
  await page.goto("/post/two-better-auth-instances-one-database");
  await page.getByRole("link", { name: "Zyad Yasser" }).first().click();

  await expect(page.getByRole("tab", { name: "Posts" })).toHaveAttribute("data-state", "active");

  await page.getByRole("tab", { name: "About" }).click();
  await expect(page.getByRole("tab", { name: "About" })).toHaveAttribute("data-state", "active");
  await expect(page.getByText(/Joined/)).toBeVisible();
});

test("visiting an unknown username shows a not-found state", async ({ page }) => {
  await page.goto("/u/this-user-does-not-exist");

  await expect(page.getByRole("heading", { name: "User not found" })).toBeVisible();
});

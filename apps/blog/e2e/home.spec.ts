import { expect, test } from "@playwright/test";

test("homepage loads with the post list and site chrome", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Blog/);
  await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Two Better Auth Instances, One Database" })
  ).toBeVisible();
});

test("filtering by category narrows the post list", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Notes" }).click();

  await expect(page.getByRole("link", { name: "Welcome to the Blog" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Two Better Auth Instances, One Database" })
  ).toHaveCount(0);

  await page.getByRole("button", { name: "All posts" }).click();
  await expect(
    page.getByRole("link", { name: "Two Better Auth Instances, One Database" })
  ).toBeVisible();
});

test("filtering by tag narrows the post list", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "postgres" }).click();

  await expect(
    page.getByRole("link", { name: "Two Better Auth Instances, One Database" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Welcome to the Blog" })).toHaveCount(0);
});

test("clicking a post navigates to its detail page", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Two Better Auth Instances, One Database" }).click();

  await expect(page).toHaveURL(/\/post\/two-better-auth-instances-one-database$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Two Better Auth Instances, One Database"
  );
});

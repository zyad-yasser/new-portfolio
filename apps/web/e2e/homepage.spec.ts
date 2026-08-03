import { expect, test } from "@playwright/test";

test("homepage loads with expected title and hero heading", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Zyad Yasser/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("projects page is reachable from the homepage", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "View All Projects" }).click();

  await expect(page).toHaveURL(/\/projects$/);
});

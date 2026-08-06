import { expect, test } from "@playwright/test";

test("login and signup pages render their forms", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByLabel("Email")).toBeVisible();
});

test.describe("unauthenticated access to protected routes redirects to login", () => {
  for (const path of ["/new", "/mine", "/saved", "/settings/profile", "/settings/blocked"]) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    });
  }
});

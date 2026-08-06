import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.skip(
  !ADMIN_EMAIL || !ADMIN_PASSWORD,
  "ADMIN_EMAIL/ADMIN_PASSWORD not set (see apps/admin/.env)"
);

test("signed-in user can write, publish, and delete a post", async ({ page }) => {
  const title = `E2E test post ${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL as string);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD as string);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/mine$/);

  await page.goto("/new");
  await page.getByPlaceholder("Post title").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("This post was created by an automated end-to-end test.");

  await expect(page.getByText("Saved")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page).toHaveURL(/\/post\/e2e-test-post-\d+$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);

  await page.goto("/mine");
  await page.getByRole("button", { name: `Delete "${title}"` }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();

  await expect(page.getByText(title)).toHaveCount(0);
});

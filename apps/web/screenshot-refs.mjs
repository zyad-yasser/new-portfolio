import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

await page.goto("https://shadcnblocks-admin.vercel.app/login", { waitUntil: "networkidle" });
await page.screenshot({ path: "/private/tmp/claude-503/-Users-zyadyasser-Desktop-me-new-portfolio/ee393f23-f078-47da-8f0e-fb40669cfdb7/scratchpad/login-light.png" });

await page.goto("https://shadcnblocks-admin.vercel.app/ecommerce/dashboard-1", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: "/private/tmp/claude-503/-Users-zyadyasser-Desktop-me-new-portfolio/ee393f23-f078-47da-8f0e-fb40669cfdb7/scratchpad/dashboard-1.png", fullPage: false });

await browser.close();
console.log("done");

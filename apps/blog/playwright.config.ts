import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Makes ADMIN_EMAIL/ADMIN_PASSWORD available to e2e specs for the authenticated write-flow spec,
// same credentials `packages/db`'s seed script reads. Missing file (e.g. CI) is fine — that spec
// self-skips when the env vars aren't set.
try {
  process.loadEnvFile(path.resolve(__dirname, "../admin/.env"));
} catch {}

const PORT = 3003;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Every spec shares one dev-server IP against the app's per-IP rate limiters (packages/utils'
  // rate-limit.ts, backed by local Redis) — local parallelism trips those limits and flakes the
  // authenticated write-flow spec, so run serially both locally and in CI.
  workers: 1,
  reporter: "html",
  // Turbopack dev-mode compiles each route on first hit, and this app's editor route pulls in
  // a heavy Tiptap/ProseMirror bundle — bump past the 5s default so cold compiles under parallel
  // workers don't flake. CI points webServer at a prebuilt `pnpm start`, so this costs nothing there.
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Dev server for fast local iteration (reused automatically if `pnpm dev:blog` is already
    // running). CI should build first and point this at `pnpm start` for a prod-accurate run.
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

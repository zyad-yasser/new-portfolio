import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { defineConfig } from "vitest/config";

const blogEnvPath = fileURLToPath(new URL("../../apps/blog/.env", import.meta.url));
const blogEnv = existsSync(blogEnvPath)
  ? (parseEnv(readFileSync(blogEnvPath, "utf8")) as Record<string, string>)
  : {};

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: true,
    exclude: ["node_modules/**"],
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false,
    env: {
      ...blogEnv,
      UPSTASH_REDIS_REST_URL: process.env.TEST_UPSTASH_REDIS_REST_URL ?? "http://localhost:8089",
      UPSTASH_REDIS_REST_TOKEN: process.env.TEST_UPSTASH_REDIS_REST_TOKEN ?? "local_dev_token",
    },
  },
});

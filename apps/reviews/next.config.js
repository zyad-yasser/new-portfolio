const { buildSecurityHeaders } = require("@repo/utils/security-headers");
const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/auth", "@repo/auth-ui", "@repo/trpc"],
  async headers() {
    return buildSecurityHeaders({ isDev, turnstile: true });
  },
};

module.exports = nextConfig;

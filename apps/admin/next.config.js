const { buildSecurityHeaders } = require("@repo/utils/security-headers");
const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/auth", "@repo/trpc"],
  async headers() {
    return buildSecurityHeaders({ isDev, robots: "noindex, nofollow" });
  },
};

module.exports = nextConfig;

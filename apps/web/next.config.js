const { buildSecurityHeaders } = require("@repo/utils/security-headers");
const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/utils", "@repo/email"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/new-portfolio-ce4b7.firebasestorage.app/**",
      },
    ],
  },
  async headers() {
    return buildSecurityHeaders({
      isDev,
      turnstile: true,
      imgSources: ["https://firebasestorage.googleapis.com"],
    });
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/utils", "@repo/email"],
  sassOptions: {
    includePaths: ["./src/styles"],
  },
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
    const isDev = process.env.NODE_ENV !== "production";
    // 'unsafe-inline' is required for Next/React's own inline bootstrap/hydration scripts
    // (e.g. the streaming data script). 'unsafe-eval' is additionally needed in dev for
    // Turbopack's HMR/source-map runtime. Without these, the browser blocks hydration
    // entirely and the page stays frozen at its server-rendered (pre-animation) state.
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
      : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com";
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' https://firebasestorage.googleapis.com data:",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              isDev
                ? "connect-src 'self' ws: https://challenges.cloudflare.com"
                : "connect-src 'self' https://challenges.cloudflare.com",
              "frame-src https://challenges.cloudflare.com",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

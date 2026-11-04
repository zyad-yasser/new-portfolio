const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

function buildSecurityHeaders({
  isDev,
  turnstile = false,
  imgSources = [],
  connectSources = [],
  mediaSources = null,
  robots = null,
}) {
  const scriptSrc = [
    "script-src 'self' 'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    ...(turnstile ? [TURNSTILE_ORIGIN] : []),
  ].join(" ");
  const connectSrc = [
    "connect-src 'self'",
    ...(isDev ? ["ws:"] : []),
    ...(turnstile ? [TURNSTILE_ORIGIN] : []),
    ...connectSources,
  ].join(" ");

  const csp = [
    "default-src 'self'",
    ["img-src 'self' data:", ...imgSources].join(" "),
    ...(mediaSources ? [["media-src 'self'", ...mediaSources].join(" ")] : []),
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    connectSrc,
    ...(turnstile ? [`frame-src ${TURNSTILE_ORIGIN}`] : []),
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");

  return [
    {
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ...(robots ? [{ key: "X-Robots-Tag", value: robots }] : []),
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ],
    },
  ];
}

module.exports = { buildSecurityHeaders };

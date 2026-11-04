const { buildSecurityHeaders } = require("@repo/utils/security-headers");

function parseUrl(urlString) {
  try {
    return new URL(urlString);
  } catch {
    return null;
  }
}

const isDev = process.env.NODE_ENV !== "production";
const storageProvider = process.env.STORAGE_PROVIDER === "firebase" ? "firebase" : "s3";

const s3PublicUrl = parseUrl(process.env.S3_PUBLIC_URL);
const s3Endpoint = parseUrl(process.env.S3_ENDPOINT);
const s3RemotePattern = s3PublicUrl
  ? {
      protocol: s3PublicUrl.protocol.replace(":", ""),
      hostname: s3PublicUrl.hostname,
      port: s3PublicUrl.port || undefined,
      pathname: `${s3PublicUrl.pathname.replace(/\/$/, "")}/**`,
    }
  : undefined;
const s3ConnectOrigins = [...new Set([s3PublicUrl?.origin, s3Endpoint?.origin].filter(Boolean))];

const firebaseBucket = process.env.FIREBASE_STORAGE_BUCKET;
const firebaseEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
const firebaseEmulatorUrl = firebaseEmulatorHost
  ? parseUrl(`http://${firebaseEmulatorHost}`)
  : null;
const firebaseRemotePattern = firebaseBucket
  ? firebaseEmulatorUrl
    ? {
        protocol: "http",
        hostname: firebaseEmulatorUrl.hostname,
        port: firebaseEmulatorUrl.port || undefined,
        pathname: "/v0/b/**",
      }
    : {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: `/${firebaseBucket}/**`,
      }
  : undefined;
const firebaseConnectOrigins = firebaseBucket
  ? [firebaseEmulatorUrl ? firebaseEmulatorUrl.origin : "https://storage.googleapis.com"]
  : [];

const storageRemotePattern =
  storageProvider === "firebase" ? firebaseRemotePattern : s3RemotePattern;
const storageConnectOrigins =
  storageProvider === "firebase" ? firebaseConnectOrigins : s3ConnectOrigins;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/auth", "@repo/auth-ui", "@repo/trpc"],
  images: {
    remotePatterns: storageRemotePattern ? [storageRemotePattern] : [],
    dangerouslyAllowLocalIP: isDev,
  },
  async headers() {
    return buildSecurityHeaders({
      isDev,
      turnstile: true,
      imgSources: ["blob:", ...storageConnectOrigins],
      connectSources: storageConnectOrigins,
      mediaSources: ["blob:"],
    });
  },
};

module.exports = nextConfig;

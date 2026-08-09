import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { requireEnv } from "./env";

let bucket: ReturnType<ReturnType<typeof getStorage>["bucket"]> | undefined;

function getBucket() {
  if (!bucket) {
    const serviceAccount = JSON.parse(requireEnv("FIREBASE_SERVICE_ACCOUNT"));
    const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
    bucket = getStorage(app).bucket(requireEnv("FIREBASE_STORAGE_BUCKET"));
  }
  return bucket;
}

const PRESIGN_EXPIRY_SECONDS = 60;

export function getPublicUrl(key: string) {
  return `https://storage.googleapis.com/${requireEnv("FIREBASE_STORAGE_BUCKET")}/${key}`;
}

export async function createPresignedUploadUrl({
  key,
  contentType,
  expiresInSeconds = PRESIGN_EXPIRY_SECONDS,
}: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const [uploadUrl] = await getBucket()
    .file(key)
    .getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + expiresInSeconds * 1000,
      contentType,
    });

  return { uploadUrl, publicUrl: getPublicUrl(key) };
}

export async function deleteObject(key: string) {
  await getBucket().file(key).delete({ ignoreNotFound: true });
}

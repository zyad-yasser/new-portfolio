import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { requireEnv } from "./env";

let bucket: ReturnType<ReturnType<typeof getStorage>["bucket"]> | undefined;

function isEmulator() {
  return !!process.env.FIREBASE_STORAGE_EMULATOR_HOST;
}

function getBucket() {
  if (!bucket) {
    const app =
      getApps()[0] ??
      (isEmulator()
        ? initializeApp({ projectId: requireEnv("FIREBASE_PROJECT_ID") })
        : initializeApp({ credential: cert(JSON.parse(requireEnv("FIREBASE_SERVICE_ACCOUNT"))) }));
    bucket = getStorage(app).bucket(requireEnv("FIREBASE_STORAGE_BUCKET"));
  }
  return bucket;
}

const PRESIGN_EXPIRY_SECONDS = 60;

export function getPublicUrl(key: string) {
  const bucketName = requireEnv("FIREBASE_STORAGE_BUCKET");
  if (isEmulator()) {
    const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    return `http://${host}/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(key)}?alt=media`;
  }
  return `https://storage.googleapis.com/${bucketName}/${key}`;
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
  if (isEmulator()) {
    return {
      uploadUrl: `/api/media-upload?key=${encodeURIComponent(key)}`,
      publicUrl: getPublicUrl(key),
    };
  }

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

export async function uploadObjectDirect(key: string, body: Buffer, contentType: string) {
  await getBucket().file(key).save(body, { contentType, resumable: false });
}

export async function deleteObject(key: string) {
  await getBucket().file(key).delete({ ignoreNotFound: true });
}

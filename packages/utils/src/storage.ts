import * as firebaseStorage from "./firebase-storage";
import * as s3Storage from "./s3";

function getProvider() {
  return process.env.STORAGE_PROVIDER === "firebase" ? firebaseStorage : s3Storage;
}

export function getPublicUrl(key: string) {
  return getProvider().getPublicUrl(key);
}

export function createPresignedUploadUrl(args: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  return getProvider().createPresignedUploadUrl(args);
}

export function deleteObject(key: string) {
  return getProvider().deleteObject(key);
}

export function uploadObjectDirect(key: string, body: Buffer, contentType: string) {
  return getProvider().uploadObjectDirect(key, body, contentType);
}

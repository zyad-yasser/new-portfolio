import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireEnv } from "./env";

let client: S3Client | undefined;

function getS3Client() {
  if (!client) {
    client = new S3Client({
      endpoint: requireEnv("S3_ENDPOINT"),
      region: requireEnv("S3_REGION"),
      forcePathStyle: true,
      credentials: {
        accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

const PRESIGN_EXPIRY_SECONDS = 60;

export function getPublicUrl(key: string) {
  return `${requireEnv("S3_PUBLIC_URL").replace(/\/$/, "")}/${key}`;
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
  const command = new PutObjectCommand({
    Bucket: requireEnv("S3_BUCKET"),
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: expiresInSeconds,
  });

  return { uploadUrl, publicUrl: getPublicUrl(key) };
}

export async function deleteObject(key: string) {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: requireEnv("S3_BUCKET"), Key: key }));
}

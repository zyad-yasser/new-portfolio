import { publicAuth } from "@repo/auth/public";
import { uploadObjectDirect } from "@repo/utils/firebase-storage";
import { NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

function emulatorActive() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.STORAGE_PROVIDER === "firebase" &&
    !!process.env.FIREBASE_STORAGE_EMULATOR_HOST
  );
}

export async function PUT(request: Request) {
  if (!emulatorActive()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await publicAuth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.emailVerified) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const key = new URL(request.url).searchParams.get("key");
  if (!key?.startsWith(`media/${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const contentType = request.headers.get("content-type") ?? "application/octet-stream";
  const body = Buffer.from(await request.arrayBuffer());
  if (body.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  await uploadObjectDirect(key, body, contentType);

  return NextResponse.json({ ok: true });
}

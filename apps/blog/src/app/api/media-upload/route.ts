import { publicAuth } from "@repo/auth/public";
import { uploadObjectDirect } from "@repo/utils/firebase-storage";
import { NextResponse } from "next/server";

function emulatorActive() {
  return (
    process.env.STORAGE_PROVIDER === "firebase" && !!process.env.FIREBASE_STORAGE_EMULATOR_HOST
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
  if (!key || !key.startsWith(`media/${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "application/octet-stream";
  const body = Buffer.from(await request.arrayBuffer());
  await uploadObjectDirect(key, body, contentType);

  return NextResponse.json({ ok: true });
}

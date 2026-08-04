import { sendContactEmail } from "@repo/email";
import { createRateLimiter, getClientIp } from "@repo/utils/rate-limit";
import { SameOriginError, assertSameOrigin } from "@repo/utils/same-origin";
import { contactRequestSchema } from "@repo/utils/schemas/contact";
import { verifyTurnstileToken } from "@repo/utils/turnstile";
import { NextResponse } from "next/server";

const rateLimiter = createRateLimiter({ prefix: "web:contact", limit: 3, window: "10 m" });

export async function POST(request: Request) {
  try {
    assertSameOrigin(request.headers);
  } catch (error) {
    if (error instanceof SameOriginError) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }

  const ip = getClientIp(request.headers);
  const { success, reset } = await rateLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString() } }
    );
  }

  const body = await request.json().catch(() => null);
  const result = contactRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  const { company, turnstileToken, ...values } = result.data;
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const captchaOk = await verifyTurnstileToken(turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }

  try {
    await sendContactEmail(values);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

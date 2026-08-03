import { sendContactEmail } from "@repo/email";
import { contactFormSchema } from "@repo/utils/schemas/contact";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = contactFormSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  const { company, ...values } = result.data;
  if (company) {
    return NextResponse.json({ ok: true });
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

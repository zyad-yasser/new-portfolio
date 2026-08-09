"use client";

import { publicAuthClient } from "@repo/auth/public-client";
import { Button } from "@repo/ui/button";
import { Mail } from "lucide-react";
import { useState } from "react";

export function EmailVerificationBanner() {
  const { data: session, isPending } = publicAuthClient.useSession();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  if (isPending || !session || session.user.emailVerified) {
    return null;
  }

  async function handleResend() {
    setStatus("sending");
    await publicAuthClient.sendVerificationEmail({
      email: session!.user.email,
      callbackURL: "/",
    });
    setStatus("sent");
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-amber-500/30 border-b bg-amber-500/10 px-4 py-2 text-center text-amber-900 text-sm dark:text-amber-200">
      <span className="flex items-center gap-1.5">
        <Mail className="size-4 shrink-0" />
        Verify your email to leave a review.
      </span>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto p-0 text-amber-900 text-sm dark:text-amber-200"
        disabled={status !== "idle"}
        onClick={handleResend}
      >
        {status === "sent" ? "Email sent" : status === "sending" ? "Sending…" : "Resend email"}
      </Button>
    </div>
  );
}

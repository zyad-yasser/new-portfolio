"use client";

import { publicAuthClient } from "@repo/auth/public-client";
import {
  formatCountdown,
  useResendVerificationEmail,
} from "@repo/auth/use-resend-verification-email";
import { Button } from "@repo/ui/button";
import { Mail } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export function EmailVerificationBanner() {
  const { data: session, isPending } = publicAuthClient.useSession();
  const { resend, sending, error, onCooldown, remainingMs } = useResendVerificationEmail(
    session?.user.email,
    "/"
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (isPending || !session || session.user.emailVerified) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-1 border-amber-500/30 border-b bg-amber-500/10 px-4 py-2 text-center text-amber-900 text-sm dark:text-amber-200">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5">
          <Mail className="size-4 shrink-0" />
          Verify your email to write posts, comment, and react.
        </span>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-amber-900 text-sm dark:text-amber-200"
          disabled={sending || onCooldown}
          onClick={resend}
        >
          {onCooldown
            ? `Resend in ${formatCountdown(remainingMs)}`
            : sending
              ? "Sending…"
              : "Resend email"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthErrorMessage } from "@repo/auth/error-message";
import { publicAuthClient } from "@repo/auth/public-client";
import {
  PASSWORD_RESET_COOLDOWN_MS,
  formatCountdown,
  readRetryAfterMs,
  usePasswordResetCooldown,
} from "@repo/auth/use-password-reset-cooldown";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import type { RequestPasswordResetValues } from "@repo/utils/schemas/password";
import { requestPasswordResetSchema } from "@repo/utils/schemas/password";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const RESET_REDIRECT_PATH = "/reset-password";

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<RequestPasswordResetValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  const watchedEmail = form.watch("email");
  const { remainingMs, onCooldown, startCooldown } = usePasswordResetCooldown(watchedEmail);

  async function onSubmit(values: RequestPasswordResetValues) {
    let serverResponse: Response | undefined;

    const { error } = await publicAuthClient.requestPasswordReset(
      { email: values.email, redirectTo: RESET_REDIRECT_PATH },
      {
        onResponse: (context) => {
          serverResponse = context.response;
        },
      }
    );

    if (error) {
      const retryAfterMs = readRetryAfterMs(error, serverResponse);
      if (retryAfterMs !== null) {
        startCooldown(values.email, retryAfterMs);
      }
      toast.error(getAuthErrorMessage(error, "Couldn't send the reset link. Try again."));
      return;
    }

    startCooldown(values.email, PASSWORD_RESET_COOLDOWN_MS);
    setSubmittedEmail(values.email);
    toast.success("Reset link sent if that email has an account.");
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]"
      />

      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-brand text-xs font-bold text-primary-foreground">
          ZY
        </span>
        <span className="text-lg font-semibold">Zyad Yasser Reviews</span>
      </div>

      <Card className="glass w-full max-w-sm shadow-xl shadow-black/5">
        {submittedEmail ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MailCheck className="size-5 text-primary" />
                Check your email
              </CardTitle>
              <CardDescription>
                If an account exists for {submittedEmail}, a password reset link is on its way. The
                link expires in one hour.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't get it? Check your spam folder.{" "}
                {onCooldown
                  ? `You can request another link in ${formatCountdown(remainingMs)}.`
                  : "You can request another link now."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setSubmittedEmail(null)}
              >
                Use a different email
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Forgot password</CardTitle>
              <CardDescription>
                Enter your email and we'll send you a link to choose a new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            autoFocus
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="btn-glow w-full gap-2"
                    disabled={isSubmitting || onCooldown}
                  >
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {onCooldown
                      ? `Try again in ${formatCountdown(remainingMs)}`
                      : isSubmitting
                        ? "Sending..."
                        : "Send reset link"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Back to login
        </Link>
      </p>
    </main>
  );
}

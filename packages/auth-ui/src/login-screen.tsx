"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthErrorMessage } from "@repo/auth/error-message";
import { publicAuthClient } from "@repo/auth/public-client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { GoogleIcon } from "@repo/ui/icons";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { PasswordInput } from "@repo/ui/password-input";
import { type LoginValues, loginSchema } from "@repo/utils/schemas/auth";
import { Github, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const AUTH_ERROR_PATH = "/auth-error";

type LoginScreenProps = {
  appTitle: string;
  description: string;
  postLoginPath: string;
  brandMarkClassName: string;
  cardClassName: string;
  submitClassName?: string;
};

export function LoginScreen({
  appTitle,
  description,
  postLoginPath,
  brandMarkClassName,
  cardClassName,
  submitClassName,
}: LoginScreenProps) {
  const router = useRouter();
  const [socialProvider, setSocialProvider] = useState<"google" | "github" | null>(null);
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [verifyingTwoFactor, setVerifyingTwoFactor] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  async function onSubmit(values: LoginValues) {
    const { data, error: signInError } = await publicAuthClient.signIn.email(values);

    if (signInError) {
      toast.error(getAuthErrorMessage(signInError, "Invalid email or password."));
      return;
    }

    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      setNeedsTwoFactor(true);
      return;
    }

    router.push(postLoginPath);
    router.refresh();
  }

  async function onVerifyTwoFactor(event: React.FormEvent) {
    event.preventDefault();
    setVerifyingTwoFactor(true);

    const { error: verifyError } = useBackupCode
      ? await publicAuthClient.twoFactor.verifyBackupCode({ code: twoFactorCode })
      : await publicAuthClient.twoFactor.verifyTotp({ code: twoFactorCode });

    setVerifyingTwoFactor(false);

    if (verifyError) {
      toast.error(
        getAuthErrorMessage(
          verifyError,
          useBackupCode ? "Invalid backup code." : "Invalid code. Try again."
        )
      );
      return;
    }

    router.push(postLoginPath);
    router.refresh();
  }

  async function onSocialSignIn(provider: "google" | "github") {
    setSocialProvider(provider);

    const { error: signInError } = await publicAuthClient.signIn.social({
      provider,
      callbackURL: postLoginPath,
      errorCallbackURL: AUTH_ERROR_PATH,
    });

    if (signInError) {
      toast.error(getAuthErrorMessage(signInError, "Couldn't sign in."));
      setSocialProvider(null);
    }
  }

  const isSubmitting = form.formState.isSubmitting;
  const isSocialLoading = socialProvider !== null;

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]"
      />

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-primary-foreground",
            brandMarkClassName
          )}
        >
          ZY
        </span>
        <span className="text-lg font-semibold">{appTitle}</span>
      </div>

      <Card className={cn("w-full max-w-sm shadow-xl shadow-black/5", cardClassName)}>
        {needsTwoFactor ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Two-factor authentication</CardTitle>
              <CardDescription>
                {useBackupCode
                  ? "Enter one of your backup codes."
                  : "Enter the code from your authenticator app."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form noValidate onSubmit={onVerifyTwoFactor} className="space-y-4">
                <Input
                  autoFocus
                  inputMode={useBackupCode ? "text" : "numeric"}
                  autoComplete="one-time-code"
                  maxLength={useBackupCode ? undefined : 6}
                  placeholder={useBackupCode ? "Backup code" : "6-digit code"}
                  className="text-center text-lg tracking-[0.3em]"
                  value={twoFactorCode}
                  onChange={(event) =>
                    setTwoFactorCode(
                      useBackupCode
                        ? event.target.value
                        : event.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                />
                <Button
                  type="submit"
                  className={cn("w-full gap-2", submitClassName)}
                  disabled={verifyingTwoFactor || !twoFactorCode}
                >
                  {verifyingTwoFactor && <Loader2 className="size-4 animate-spin" />}
                  Verify
                </Button>
              </form>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs text-muted-foreground"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTwoFactorCode("");
                }}
              >
                {useBackupCode ? "Use authenticator code instead" : "Use a backup code instead"}
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isSocialLoading}
                  onClick={() => onSocialSignIn("google")}
                >
                  {socialProvider === "google" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="size-4" />
                  )}
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isSocialLoading}
                  onClick={() => onSocialSignIn("github")}
                >
                  {socialProvider === "github" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Github className="size-4" />
                  )}
                  Continue with GitHub
                </Button>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                Or continue with email
                <div className="h-px flex-1 bg-border" />
              </div>

              <Form {...form}>
                <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-2">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <PasswordInput autoComplete="current-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className={cn("w-full gap-2", submitClassName)}
                    disabled={isSubmitting || isSocialLoading}
                  >
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </main>
  );
}

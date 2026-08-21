"use client";

import { getAuthErrorMessage } from "@repo/auth/error-message";
import { publicAuthClient } from "@repo/auth/public-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Skeleton } from "@repo/ui/skeleton";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";
import { toast } from "sonner";

type EnrollState =
  | { stage: "password"; password: string }
  | { stage: "verify"; qrDataUrl: string; backupCodes: string[]; code: string };

export function TwoFactorTab() {
  const { data: session, isPending, refetch } = publicAuthClient.useSession();
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  const [regenOpen, setRegenOpen] = useState(false);
  const [regenPassword, setRegenPassword] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);

  const twoFactorEnabled = !!session?.user.twoFactorEnabled;

  async function handleStartEnroll(event: React.FormEvent) {
    event.preventDefault();
    if (enroll?.stage !== "password") {
      return;
    }

    setEnrolling(true);
    const { data, error } = await publicAuthClient.twoFactor.enable({ password: enroll.password });
    setEnrolling(false);

    if (error || !data) {
      toast.error(getAuthErrorMessage(error, "Couldn't start two-factor setup."));
      return;
    }

    const qrDataUrl = await QRCode.toDataURL(data.totpURI);
    setEnroll({ stage: "verify", qrDataUrl, backupCodes: data.backupCodes, code: "" });
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (enroll?.stage !== "verify") {
      return;
    }

    setVerifying(true);
    const { error } = await publicAuthClient.twoFactor.verifyTotp({ code: enroll.code });
    setVerifying(false);

    if (error) {
      toast.error(getAuthErrorMessage(error, "That code didn't work. Try again."));
      return;
    }

    toast.success("Two-factor authentication enabled.");
    setEnroll(null);
    refetch();
  }

  async function handleDisable() {
    setDisabling(true);
    const { error } = await publicAuthClient.twoFactor.disable({ password: disablePassword });
    setDisabling(false);

    if (error) {
      toast.error(getAuthErrorMessage(error, "Couldn't disable two-factor authentication."));
      return;
    }

    setDisableOpen(false);
    setDisablePassword("");
    toast.success("Two-factor authentication disabled.");
    refetch();
  }

  async function handleRegenerate() {
    setRegenerating(true);
    const { data, error } = await publicAuthClient.twoFactor.generateBackupCodes({
      password: regenPassword,
    });
    setRegenerating(false);

    if (error || !data) {
      toast.error(getAuthErrorMessage(error, "Couldn't generate new backup codes."));
      return;
    }

    setRegenPassword("");
    setNewBackupCodes(data.backupCodes);
    toast.success("New backup codes generated.");
  }

  if (isPending) {
    return <Skeleton className="skeleton-shimmer h-48 w-full" />;
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Two-factor authentication
          {twoFactorEnabled ? (
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="size-3.5" />
              Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <ShieldOff className="size-3.5" />
              Disabled
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Require a code from an authenticator app when signing in.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!twoFactorEnabled && !enroll && (
          <Button
            className="w-fit gap-2"
            onClick={() => setEnroll({ stage: "password", password: "" })}
          >
            Enable two-factor authentication
          </Button>
        )}

        {enroll?.stage === "password" && (
          <form onSubmit={handleStartEnroll} className="flex max-w-sm flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="enroll-password">Confirm your password</Label>
              <Input
                id="enroll-password"
                type="password"
                autoFocus
                value={enroll.password}
                onChange={(event) => setEnroll({ stage: "password", password: event.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={enrolling || !enroll.password} className="gap-2">
                {enrolling && <Loader2 className="size-4 animate-spin" />}
                Continue
              </Button>
              <Button type="button" variant="outline" onClick={() => setEnroll(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {enroll?.stage === "verify" && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <img
                src={enroll.qrDataUrl}
                alt="Scan this QR code with your authenticator app"
                className="size-40 shrink-0 rounded-lg border bg-white p-2"
              />
              <p className="text-sm text-muted-foreground">
                Scan this QR code with an authenticator app (Google Authenticator, 1Password, Authy,
                etc.), then enter the 6-digit code it shows below.
              </p>
            </div>

            <div className="flex max-w-[12rem] flex-col gap-1.5">
              <Label htmlFor="verify-code">6-digit code</Label>
              <Input
                id="verify-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                className="text-center text-lg tracking-[0.3em]"
                value={enroll.code}
                onChange={(event) =>
                  setEnroll({
                    ...enroll,
                    code: event.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">Backup codes</p>
              <p className="text-xs text-muted-foreground">
                Save these somewhere safe. Each one can be used once to sign in if you lose access
                to your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-sm sm:grid-cols-3">
                {enroll.backupCodes.map((code) => (
                  <span key={code} className="rounded bg-background px-2 py-1">
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={verifying || enroll.code.length !== 6}
                className="gap-2"
              >
                {verifying && <Loader2 className="size-4 animate-spin" />}
                Verify and enable
              </Button>
              <Button type="button" variant="outline" onClick={() => setEnroll(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {twoFactorEnabled && !enroll && (
          <div className="flex flex-wrap gap-2">
            <AlertDialog
              open={regenOpen}
              onOpenChange={(open) => {
                setRegenOpen(open);
                if (!open) {
                  setRegenPassword("");
                  setNewBackupCodes(null);
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="outline">Regenerate backup codes</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate backup codes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your existing backup codes will stop working.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {newBackupCodes ? (
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-sm sm:grid-cols-3">
                    {newBackupCodes.map((code) => (
                      <span key={code} className="rounded bg-muted px-2 py-1">
                        {code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="regen-password">Confirm your password</Label>
                    <Input
                      id="regen-password"
                      type="password"
                      value={regenPassword}
                      onChange={(event) => setRegenPassword(event.target.value)}
                    />
                  </div>
                )}

                <AlertDialogFooter>
                  {newBackupCodes ? (
                    <AlertDialogAction onClick={() => setRegenOpen(false)}>Done</AlertDialogAction>
                  ) : (
                    <>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={regenerating || !regenPassword}
                        className="gap-2"
                        onClick={(event) => {
                          event.preventDefault();
                          handleRegenerate();
                        }}
                      >
                        {regenerating && <Loader2 className="size-4 animate-spin" />}
                        Regenerate
                      </AlertDialogAction>
                    </>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={disableOpen}
              onOpenChange={(open) => {
                setDisableOpen(open);
                if (!open) {
                  setDisablePassword("");
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Disable two-factor authentication</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable two-factor authentication?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your account will only be protected by your password.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="disable-password">Confirm your password</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    value={disablePassword}
                    onChange={(event) => setDisablePassword(event.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={disabling || !disablePassword}
                    className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={(event) => {
                      event.preventDefault();
                      handleDisable();
                    }}
                  >
                    {disabling && <Loader2 className="size-4 animate-spin" />}
                    Disable
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

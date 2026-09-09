"use client";

import { getAuthErrorMessage } from "@repo/auth/error-message";
import { publicAuthClient } from "@repo/auth/public-client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { GoogleIcon } from "@repo/ui/icons";
import { Skeleton } from "@repo/ui/skeleton";
import { Github, Loader2, Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const SETTINGS_PATH = "/settings/security";
const AUTH_ERROR_PATH = "/auth-error";

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "github", label: "GitHub", Icon: Github },
] as const;

type SocialProviderId = (typeof SOCIAL_PROVIDERS)[number]["id"];

type LinkedAccount = { id: string; providerId: string; accountId: string };

export function LinkedAccountsTab() {
  const [accounts, setAccounts] = useState<LinkedAccount[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadFailed(false);
    const { data, error } = await publicAuthClient.listAccounts();

    if (error || !data) {
      setLoadFailed(true);
      return;
    }

    setAccounts(
      data.map((account) => ({
        id: account.id,
        providerId: account.providerId,
        accountId: account.accountId,
      }))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onLink(provider: SocialProviderId) {
    setPendingProvider(provider);

    const { error } = await publicAuthClient.linkSocial({
      provider,
      callbackURL: SETTINGS_PATH,
      errorCallbackURL: AUTH_ERROR_PATH,
    });

    if (error) {
      setPendingProvider(null);
      toast.error(getAuthErrorMessage(error, "Couldn't connect that account."));
    }
  }

  async function onUnlink(account: LinkedAccount, label: string) {
    setPendingProvider(account.providerId);

    const { error } = await publicAuthClient.unlinkAccount({
      providerId: account.providerId,
      accountId: account.accountId,
    });

    setPendingProvider(null);

    if (error) {
      toast.error(getAuthErrorMessage(error, "Couldn't disconnect that account."));
      return;
    }

    toast.success(`${label} disconnected.`);
    await load();
  }

  const hasCredential = !!accounts?.some((account) => account.providerId === "credential");
  const canUnlink = (accounts?.length ?? 0) > 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Linked accounts</h2>
        <p className="text-sm text-muted-foreground">
          Connect a provider to sign in with one click. Connecting requires a verified email
          address.
        </p>
      </div>

      {!accounts && !loadFailed && (
        <div className="flex flex-col gap-3">
          <Skeleton className="skeleton-shimmer h-20 w-full" />
          <Skeleton className="skeleton-shimmer h-20 w-full" />
        </div>
      )}

      {loadFailed && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p>Couldn't load your linked accounts. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => load()}>
            Try again
          </Button>
        </div>
      )}

      {accounts && (
        <div className="flex flex-col gap-3">
          <Card className="flex flex-row items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">Email and password</p>
                <p className="text-xs text-muted-foreground">
                  {hasCredential ? "Set up" : "Not set up"}
                </p>
              </div>
            </div>
            {hasCredential && <Badge variant="secondary">Connected</Badge>}
          </Card>

          {SOCIAL_PROVIDERS.map(({ id, label, Icon }) => {
            const linked = accounts.find((account) => account.providerId === id);
            const isPending = pendingProvider === id;

            return (
              <Card key={id} className="flex flex-row items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {linked ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>

                {linked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isPending || !canUnlink}
                    title={canUnlink ? undefined : "You can't disconnect your only sign-in method"}
                    onClick={() => onUnlink(linked, label)}
                  >
                    {isPending && <Loader2 className="size-4 animate-spin" />}
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isPending}
                    onClick={() => onLink(id)}
                  >
                    {isPending && <Loader2 className="size-4 animate-spin" />}
                    Connect
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

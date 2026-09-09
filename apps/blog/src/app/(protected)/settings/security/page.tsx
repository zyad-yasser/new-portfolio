"use client";

import { LinkedAccountsTab } from "@/components/settings/linked-accounts-tab";
import { SessionsTab } from "@/components/settings/sessions-tab";
import { TwoFactorTab } from "@/components/settings/two-factor-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

export default function PrivacySecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Privacy &amp; Security</h1>
        <p className="text-sm text-muted-foreground">
          Manage two-factor authentication, linked accounts, and active sessions.
        </p>
      </div>

      <Tabs defaultValue="two-factor">
        <TabsList>
          <TabsTrigger value="two-factor">Two-factor auth</TabsTrigger>
          <TabsTrigger value="linked-accounts">Linked accounts</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="two-factor">
          <TwoFactorTab />
        </TabsContent>
        <TabsContent value="linked-accounts">
          <LinkedAccountsTab />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

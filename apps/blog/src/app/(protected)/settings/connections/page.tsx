"use client";

import { BlockedUsersTab } from "@/components/settings/blocked-users-tab";
import { FollowersTab } from "@/components/settings/followers-tab";
import { FollowingTab } from "@/components/settings/following-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

export default function ConnectionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Connections</h1>
        <p className="text-sm text-muted-foreground">
          Manage who you follow, who follows you, and who you've blocked.
        </p>
      </div>

      <Tabs defaultValue="following">
        <TabsList>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>
        <TabsContent value="following">
          <FollowingTab />
        </TabsContent>
        <TabsContent value="followers">
          <FollowersTab />
        </TabsContent>
        <TabsContent value="blocked">
          <BlockedUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

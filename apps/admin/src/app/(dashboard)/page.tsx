import { auth } from "@repo/auth";
import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome{session ? `, ${session.user.name}` : ""}</h1>
        <p className="text-muted-foreground">This is the admin dashboard for zyadyasser.com.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nothing here yet</CardTitle>
          <CardDescription>
            This app currently only handles sign-in. Content management screens land here next.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

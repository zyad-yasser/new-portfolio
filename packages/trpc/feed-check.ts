import { db } from "@repo/db";
import { user } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { publicAppRouter } from "./src/public/routers/_app";
async function main() {
  const u = await db.query.user.findFirst({ where: eq(user.email, "seed.writer@example.com") });
  const caller: any = publicAppRouter.createCaller({
    session: { user: { ...u!, emailVerified: true }, session: {} } as any,
    headers: new Headers({ "x-forwarded-for": "10.7.7.11" }),
  });
  let cursor: any;
  let pages = 0;
  try {
    do {
      const page: any = await caller.feed.following({ limit: 1, cursor });
      cursor = page.nextCursor;
      pages++;
    } while (cursor && pages < 50);
    console.log("OK pages", pages);
  } catch (e: any) {
    let c = e;
    while (c.cause) c = c.cause;
    console.log("ERR after", pages, "pages:", c.message?.slice(0, 200));
  }
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

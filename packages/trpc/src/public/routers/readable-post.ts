import { db } from "@repo/db";
import { post } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { assertNotBlocked } from "./block";

type ReadablePostOptions = {
  checkBlock?: boolean;
};

export function isReadableBy(
  target: { published: boolean; authorId: string },
  viewerId: string | null | undefined
) {
  return target.published || target.authorId === viewerId;
}

export async function assertReadablePost(
  postId: string,
  viewerId: string | null | undefined,
  { checkBlock = true }: ReadablePostOptions = {}
) {
  const target = await db.query.post.findFirst({
    where: eq(post.id, postId),
    columns: { id: true, authorId: true, published: true },
  });

  if (!target || !isReadableBy(target, viewerId)) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  if (checkBlock && viewerId) {
    await assertNotBlocked(viewerId, target.authorId);
  }

  return target;
}

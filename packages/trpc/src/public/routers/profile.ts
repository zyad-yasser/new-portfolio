import { db } from "@repo/db";
import { post, user, userFollow, userProfile } from "@repo/db/schema";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter, publicProcedure } from "../init";
import { formatPost, postWith } from "./post";

function slugifyBase(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueUsername(seed: string, excludeUserId?: string) {
  const base = slugifyBase(seed) || "user";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await db.query.userProfile.findFirst({
      where: excludeUserId
        ? and(eq(userProfile.username, candidate), ne(userProfile.userId, excludeUserId))
        : eq(userProfile.username, candidate),
    });

    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function ensureUserProfile(userId: string) {
  const existing = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });

  if (existing) {
    return existing;
  }

  const userRow = await db.query.user.findFirst({ where: eq(user.id, userId) });

  if (!userRow) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const seed = userRow.name.trim() || userRow.email.split("@")[0] || "user";
  const username = await uniqueUsername(seed);

  const rows = await db.insert(userProfile).values({ userId, username }).returning();
  const created = rows[0];

  if (!created) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  return created;
}

export const profileRouter = createPublicTRPCRouter({
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.username, input.username),
        with: { user: { columns: { id: true, name: true, image: true, createdAt: true } } },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [postCountRows, followerCountRows, followingCountRows] = await Promise.all([
        db
          .select({ value: count() })
          .from(post)
          .where(and(eq(post.authorId, profile.userId), eq(post.published, true))),
        db.select({ value: count() }).from(userFollow).where(
          eq(userFollow.followingId, profile.userId)
        ),
        db.select({ value: count() }).from(userFollow).where(
          eq(userFollow.followerId, profile.userId)
        ),
      ]);

      return {
        ...profile,
        postCount: postCountRows[0]?.value ?? 0,
        followerCount: followerCountRows[0]?.value ?? 0,
        followingCount: followingCountRows[0]?.value ?? 0,
      };
    }),

  posts: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.username, input.username),
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const rows = await db.query.post.findMany({
        where: and(eq(post.authorId, profile.userId), eq(post.published, true)),
        orderBy: desc(post.createdAt),
        with: postWith,
      });

      return rows.map(formatPost);
    }),

  mine: authedProcedure.query(({ ctx }) => ensureUserProfile(ctx.session.user.id)),

  update: authedProcedure
    .input(
      z.object({
        username: z
          .string()
          .trim()
          .min(2)
          .max(30)
          .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only")
          .optional(),
        bio: z.string().trim().max(280).optional(),
        websiteUrl: z
          .union([z.string().trim().max(200).url({ protocol: /^https?$/ }), z.literal("")])
          .optional(),
        location: z.string().trim().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ensureUserProfile(ctx.session.user.id);

      if (input.username) {
        const existing = await db.query.userProfile.findFirst({
          where: and(
            eq(userProfile.username, input.username),
            ne(userProfile.userId, ctx.session.user.id)
          ),
        });

        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "That username is taken." });
        }
      }

      const patch: Partial<typeof userProfile.$inferInsert> = { updatedAt: new Date() };

      if (input.username !== undefined) {
        patch.username = input.username;
      }
      if (input.bio !== undefined) {
        patch.bio = input.bio || null;
      }
      if (input.websiteUrl !== undefined) {
        patch.websiteUrl = input.websiteUrl || null;
      }
      if (input.location !== undefined) {
        patch.location = input.location || null;
      }

      const rows = await db
        .update(userProfile)
        .set(patch)
        .where(eq(userProfile.userId, ctx.session.user.id))
        .returning();

      return rows[0];
    }),
});

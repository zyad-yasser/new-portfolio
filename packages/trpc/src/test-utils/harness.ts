import { randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { comment, post, user } from "@repo/db/schema";
import { inArray } from "drizzle-orm";
import type { TRPCContext } from "../context";
import type { PublicTRPCContext } from "../public/context";
import { publicAppRouter } from "../public/routers/_app";
import { appRouter } from "../routers/_app";

export type TestUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "admin" | "user";
};

const createdUserIds: string[] = [];

export async function createTestUser({
  emailVerified = true,
  role = "user",
}: {
  emailVerified?: boolean;
  role?: "admin" | "user";
} = {}): Promise<TestUser> {
  const id = `test_${randomUUID().replace(/-/g, "")}`;
  const testUser: TestUser = {
    id,
    name: `Test ${id.slice(-8)}`,
    email: `${id}@trpc-test.example.com`,
    emailVerified,
    role,
  };

  await db.insert(user).values(testUser);
  createdUserIds.push(id);
  return testUser;
}

export async function cleanupTestUsers() {
  if (!createdUserIds.length) {
    return;
  }
  await db.delete(user).where(inArray(user.id, createdUserIds));
  createdUserIds.length = 0;
}

function fabricateSession(testUser: TestUser) {
  const now = new Date();
  return {
    user: {
      ...testUser,
      image: null,
      twoFactorEnabled: false,
      createdAt: now,
      updatedAt: now,
    },
    session: {
      id: randomUUID(),
      token: randomUUID(),
      userId: testUser.id,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
      ipAddress: null,
      userAgent: null,
    },
  };
}

function testHeaders() {
  return new Headers({ "x-forwarded-for": `trpc-test-${randomUUID()}` });
}

export function publicCaller(testUser: TestUser | null) {
  const session = (testUser ? fabricateSession(testUser) : null) as PublicTRPCContext["session"];
  return publicAppRouter.createCaller({ session, headers: testHeaders() });
}

export function adminCaller(testUser: TestUser | null) {
  const session = (testUser ? fabricateSession(testUser) : null) as TRPCContext["session"];
  return appRouter.createCaller({ session, headers: testHeaders() });
}

export async function insertPost({
  authorId,
  published,
  quotedPostId = null,
}: {
  authorId: string;
  published: boolean;
  quotedPostId?: string | null;
}) {
  const id = randomUUID();
  const rows = await db
    .insert(post)
    .values({
      id,
      authorId,
      title: `Test post ${id.slice(0, 8)}`,
      slug: `trpc-test-${id}`,
      type: quotedPostId ? "quote" : "article",
      quotedPostId,
      contentJson: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "hello" }] }],
      },
      published,
    })
    .returning();
  return rows[0]!;
}

export async function insertComment({
  postId,
  authorId,
  deleted = false,
}: {
  postId: string;
  authorId: string;
  deleted?: boolean;
}) {
  const rows = await db
    .insert(comment)
    .values({
      id: randomUUID(),
      postId,
      authorId,
      body: deleted ? "" : "a comment",
      deletedAt: deleted ? new Date() : null,
    })
    .returning();
  return rows[0]!;
}

export const tiptapDoc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "test body" }] }],
};

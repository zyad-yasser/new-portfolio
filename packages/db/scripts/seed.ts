import { randomUUID } from "node:crypto";
import { getPublicUrl, uploadObjectDirect } from "@repo/utils/storage";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../src";
import type { NotificationType } from "../src/schema";
import {
  account,
  category,
  media,
  notification,
  post,
  postReshare,
  postTag,
  tag,
  user,
  userFollow,
} from "../src/schema";

const TEST_USER_PASSWORD = "SeedUser-Pass123!";

// A minimal valid 1x1 red PNG, embedded so the sample media post has a real, working image
// with no network dependency at seed time.
const SEED_SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQAY3Y2wAAAAAElFTkSuQmCC";

const testUsers = [
  { name: "Seed Writer", email: "seed.writer@example.com", emailVerified: true },
  { name: "Seed Reviewer", email: "seed.reviewer@example.com", emailVerified: false },
];

const blogSeedCategories = [
  { name: "Engineering", color: "blue", description: "Software engineering notes and write-ups" },
  { name: "Career", color: "amber", description: "Career reflections and lessons" },
  { name: "Notes", color: "slate", description: "Short-form notes and updates" },
];

const blogSeedPosts = [
  {
    title: "Welcome to the Blog",
    excerptText:
      "This is the first post on this blog. More posts about software engineering, side projects, and lessons learned are coming soon.",
    categorySlug: "notes",
    tagNames: [] as string[],
  },
  {
    title: "Building a Monorepo with Turborepo and pnpm",
    excerptText:
      "Notes on structuring a multi-app Turborepo workspace: shared UI, shared auth, and a shared database layer consumed by several independent Next.js apps.",
    categorySlug: "engineering",
    tagNames: ["typescript", "nextjs", "monorepo"],
  },
  {
    title: "Two Better Auth Instances, One Database",
    excerptText:
      "Why splitting authentication into an admin instance and a public instance, each with its own secret, is a clean way to keep a single-owner admin app and a public multi-user app on the same Postgres tables without trusting each other's sessions.",
    categorySlug: "engineering",
    tagNames: ["typescript", "postgres"],
  },
];

function slugifyBase(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(title: string) {
  const base = slugifyBase(title) || "post";
  let candidate = base;
  let suffix = 1;

  while (await db.query.post.findFirst({ where: eq(post.slug, candidate) })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

async function findOrCreateTag(name: string) {
  const slug = slugifyBase(name) || "tag";
  const existing = await db.query.tag.findFirst({ where: eq(tag.slug, slug) });

  if (existing) {
    return existing;
  }

  const id = randomUUID();
  await db.insert(tag).values({ id, name, slug });
  return { id, name, slug };
}

async function seedCategories() {
  for (const seedCategory of blogSeedCategories) {
    const slug = slugifyBase(seedCategory.name);
    const existing = await db.query.category.findFirst({ where: eq(category.slug, slug) });

    if (existing) {
      console.log(`Category already exists: ${seedCategory.name}`);
      continue;
    }

    await db.insert(category).values({
      id: randomUUID(),
      name: seedCategory.name,
      slug,
      description: seedCategory.description,
      color: seedCategory.color,
    });

    console.log(`Created category: ${seedCategory.name}`);
  }
}

async function seedBlogPosts(adminId: string) {
  for (const seedPost of blogSeedPosts) {
    const existingPost = await db.query.post.findFirst({
      where: eq(post.title, seedPost.title),
    });

    if (existingPost) {
      console.log(`Blog post already exists: ${seedPost.title}`);
      continue;
    }

    const postCategory = await db.query.category.findFirst({
      where: eq(category.slug, seedPost.categorySlug),
    });

    const slug = await uniqueSlug(seedPost.title);
    const postId = randomUUID();

    await db.insert(post).values({
      id: postId,
      authorId: adminId,
      categoryId: postCategory?.id ?? null,
      title: seedPost.title,
      slug,
      excerptText: seedPost.excerptText,
      contentJson: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: seedPost.excerptText }] }],
      },
      published: true,
    });

    if (seedPost.tagNames.length) {
      const tags = await Promise.all(seedPost.tagNames.map(findOrCreateTag));
      await db.insert(postTag).values(tags.map((t) => ({ postId, tagId: t.id })));
    }

    console.log(`Created blog post: ${seedPost.title}`);
  }
}

// Reset (not just create-if-missing) so the documented password and verification status stay
// as documented across reseeds, even if a prior run or manual testing changed them.
async function seedTestUsers() {
  const hash = await hashPassword(TEST_USER_PASSWORD);
  const ids: Record<string, string> = {};

  for (const testUser of testUsers) {
    const existing = await db.query.user.findFirst({ where: eq(user.email, testUser.email) });

    if (existing) {
      ids[testUser.email] = existing.id;

      await db
        .update(account)
        .set({ password: hash })
        .where(and(eq(account.userId, existing.id), eq(account.providerId, "credential")));
      await db
        .update(user)
        .set({ emailVerified: testUser.emailVerified })
        .where(eq(user.id, existing.id));
      console.log(`Reset password/verification for test user: ${testUser.email}`);
      continue;
    }

    const id = randomUUID();
    ids[testUser.email] = id;

    await db.insert(user).values({
      id,
      name: testUser.name,
      email: testUser.email,
      emailVerified: testUser.emailVerified,
      role: "user",
    });

    await db.insert(account).values({
      id: randomUUID(),
      userId: id,
      providerId: "credential",
      accountId: id,
      password: hash,
    });

    console.log(`Created test user: ${testUser.email}`);
  }

  return ids;
}

async function createNotificationIfMissing(input: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
}) {
  const conditions = [
    eq(notification.recipientId, input.recipientId),
    eq(notification.actorId, input.actorId),
    eq(notification.type, input.type),
  ];
  if (input.postId) {
    conditions.push(eq(notification.postId, input.postId));
  }

  const existing = await db.query.notification.findFirst({ where: and(...conditions) });
  if (existing) {
    return;
  }

  await db.insert(notification).values({
    id: randomUUID(),
    recipientId: input.recipientId,
    actorId: input.actorId,
    type: input.type,
    postId: input.postId ?? null,
  });
}

async function seedFollow(followerId: string, followingId: string) {
  const existing = await db.query.userFollow.findFirst({
    where: and(eq(userFollow.followerId, followerId), eq(userFollow.followingId, followingId)),
  });

  if (existing) {
    console.log("Sample follow relationship already exists");
    return;
  }

  await db.insert(userFollow).values({ followerId, followingId });
  await createNotificationIfMissing({
    recipientId: followingId,
    actorId: followerId,
    type: "follow",
  });

  console.log("Created sample follow relationship");
}

async function seedMediaPost(writerId: string) {
  let mediaRow = await db.query.media.findFirst({
    where: eq(media.originalName, "seed-sample-cover.png"),
  });

  if (!mediaRow) {
    const key = `media/${writerId}/seed-sample-cover.png`;
    const body = Buffer.from(SEED_SAMPLE_PNG_BASE64, "base64");

    try {
      await uploadObjectDirect(key, body, "image/png");
    } catch {
      console.log("Skipping sample media post: storage isn't configured");
      return null;
    }

    const rows = await db
      .insert(media)
      .values({
        id: randomUUID(),
        ownerId: writerId,
        storageKey: key,
        url: getPublicUrl(key),
        originalName: "seed-sample-cover.png",
        mimeType: "image/png",
        size: body.length,
      })
      .returning();

    mediaRow = rows[0];
    console.log("Created sample media file");
  } else {
    console.log("Sample media file already exists");
  }

  if (!mediaRow) {
    return null;
  }

  const existingPost = await db.query.post.findFirst({
    where: and(eq(post.authorId, writerId), eq(post.type, "media")),
  });

  if (existingPost) {
    console.log("Sample media post already exists");
    return existingPost.id;
  }

  const caption = "A quick look behind the scenes.";
  const slug = await uniqueSlug(caption);
  const postId = randomUUID();

  await db.insert(post).values({
    id: postId,
    authorId: writerId,
    type: "media",
    title: null,
    slug,
    excerptText: caption,
    contentJson: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: caption }] },
        { type: "image", attrs: { src: mediaRow.url, alt: mediaRow.originalName } },
      ],
    },
    published: true,
  });

  console.log("Created sample media post");
  return postId;
}

async function seedReshare(reviewerId: string) {
  const target = await db.query.post.findFirst({ where: eq(post.title, "Welcome to the Blog") });
  if (!target) {
    console.log("Skipping sample reshare: target post not found");
    return;
  }

  const existing = await db.query.postReshare.findFirst({
    where: and(eq(postReshare.userId, reviewerId), eq(postReshare.postId, target.id)),
  });

  if (existing) {
    console.log("Sample reshare already exists");
    return;
  }

  await db.insert(postReshare).values({ userId: reviewerId, postId: target.id });
  await createNotificationIfMissing({
    recipientId: target.authorId,
    actorId: reviewerId,
    type: "reshare",
    postId: target.id,
  });

  console.log("Created sample reshare");
}

async function seedQuote(reviewerId: string, mediaPostId: string | null) {
  if (!mediaPostId) {
    return;
  }

  const existing = await db.query.post.findFirst({
    where: and(eq(post.authorId, reviewerId), eq(post.type, "quote")),
  });

  if (existing) {
    console.log("Sample quote already exists");
    return;
  }

  const mediaPost = await db.query.post.findFirst({ where: eq(post.id, mediaPostId) });
  if (!mediaPost) {
    return;
  }

  const opinion = "Love this shot.";
  const slug = await uniqueSlug(opinion);
  const postId = randomUUID();

  await db.insert(post).values({
    id: postId,
    authorId: reviewerId,
    type: "quote",
    quotedPostId: mediaPost.id,
    title: null,
    slug,
    excerptText: opinion,
    contentJson: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: opinion }] }],
    },
    published: true,
  });

  await createNotificationIfMissing({
    recipientId: mediaPost.authorId,
    actorId: reviewerId,
    type: "quote",
    postId,
  });

  console.log("Created sample quote post");
}

// Inserts directly rather than calling @repo/auth's `auth.api.signUpEmail` so this package
// doesn't have to depend on @repo/auth (which itself depends on @repo/db - a real dependency
// cycle Turborepo would reject). This mirrors exactly what signUpEmail does internally for
// the credential provider: a `user` row plus an `account` row with providerId "credential"
// and accountId set to the user's own id (see better-auth's api/routes/sign-up.ts).
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin account");
  }

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });

  let adminId: string;

  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    adminId = existing.id;
  } else {
    adminId = randomUUID();
    const hash = await hashPassword(password);

    await db.insert(user).values({
      id: adminId,
      name,
      email,
      emailVerified: false,
      role: "admin",
    });

    await db.insert(account).values({
      id: randomUUID(),
      userId: adminId,
      providerId: "credential",
      accountId: adminId,
      password: hash,
    });

    console.log(`Created admin account: ${email}`);
  }

  await seedCategories();
  await seedBlogPosts(adminId);

  const isLocalDatabase = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "");

  if (isLocalDatabase) {
    const testUserIds = await seedTestUsers();
    const writerId = testUserIds["seed.writer@example.com"];
    const reviewerId = testUserIds["seed.reviewer@example.com"];

    if (writerId && reviewerId) {
      await seedFollow(writerId, reviewerId);
      const mediaPostId = await seedMediaPost(writerId);
      await seedReshare(reviewerId);
      await seedQuote(reviewerId, mediaPostId);
    }
  } else {
    console.log("Skipping test user seeding: DATABASE_URL is not local");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  // postgres.js keeps its connection open, which would otherwise keep this one-shot
  // script's process alive forever after the work above is done.
  .finally(() => process.exit());

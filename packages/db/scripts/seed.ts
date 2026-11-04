import { randomUUID } from "node:crypto";
import { getPublicUrl, uploadObjectDirect } from "@repo/utils/storage";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../src";
import type { NotificationType, TiptapDoc } from "../src/schema";
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

function heading(level: 2 | 3, text: string): TiptapDoc {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}

function paragraph(text: string): TiptapDoc {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function bulletList(items: string[]): TiptapDoc {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  };
}

function blockquote(text: string): TiptapDoc {
  return { type: "blockquote", content: [paragraph(text)] };
}

const longArticleBody: TiptapDoc[] = [
  paragraph(
    "This blog's editor and reader are both built on Tiptap, a headless wrapper around ProseMirror. Every post is stored as a ProseMirror document tree, serialized to JSON, rather than as an HTML blob or a Markdown string. That single decision quietly shapes a lot of what became possible later, including a feature that has nothing to do with writing at all: study mode, a personal highlighting and note-taking layer readers can turn on for any article."
  ),
  heading(2, "Why Not Just Store HTML"),
  paragraph(
    "The obvious alternative to a structured document format is to let the editor serialize straight to HTML and store that string in the database. It works, right up until you need to do anything besides display it verbatim. Extracting a table of contents from a blob of HTML means re-parsing markup with regular expressions or a DOM parser at read time. Rendering the same content in a smaller, read-only preview means fighting the editor's own inline styles. And any feature that needs to reason about the document's structure, like counting headings, extracting plain text for search indexing, or figuring out where a heading actually starts, ends up re-implementing a tiny HTML parser from scratch."
  ),
  paragraph(
    "A ProseMirror document, by contrast, is already a tree of typed nodes: doc, heading, paragraph, bulletList, image, and so on, each with explicit attributes. Walking that tree to extract headings, count characters, or flatten it to plain text is a short recursive function, not a parsing project. The `extractHeadings` helper that powers this article's own table of contents in the sidebar is about a dozen lines long specifically because the input is already structured."
  ),
  heading(2, "Choosing Tiptap Over Raw ProseMirror"),
  paragraph(
    "ProseMirror itself is a low-level toolkit: a document model, a transaction system, and a view layer, with no batteries included. Tiptap sits on top of it and packages the common pieces, marks, extensions, a React binding, and a starter kit of nodes, into something that doesn't require writing a schema by hand before the first paragraph can be typed. For a single-author blog editor, that tradeoff was an easy call. A few reasons stood out in particular:"
  ),
  bulletList([
    "The extension system means the exact same list of nodes and marks (StarterKit, images, a custom video node, character counting) can be reused for both the writer's editor and the read-only renderer, so the two never drift apart.",
    "Extensions can register arbitrary ProseMirror plugins, which is what eventually made it possible to overlay per-reader highlights on top of a shared, read-only document without touching the document itself.",
    "The React bindings (useEditor, EditorContent) make mounting either an editable or a non-editable instance a one-line difference in configuration, not two separate code paths.",
  ]),
  heading(2, "A Document Shared By Every Reader"),
  paragraph(
    "Here's the detail that made study mode interesting rather than trivial: a post's contentJson is one row in one table, fetched by every visitor who opens that post. It's the same document for the author re-reading their own writing, for a logged-out visitor, and for a signed-in reader who wants to mark up a paragraph to come back to later. Naively, adding highlighting would mean writing marks directly into that shared document, which immediately raises an uncomfortable question: whose highlight is it, and why would every other reader suddenly see it too?"
  ),
  blockquote(
    "The moment a feature is personal rather than public, it has no business living inside the one document everyone shares."
  ),
  paragraph(
    "The fix follows directly from treating the editor as a rendering surface rather than as the source of truth. A ProseMirror view can be decorated: given a set of ranges, it can paint background colors, add classes, or attach click handlers to specific spans of text, entirely at render time, without those decorations ever being written into the document the editor was initialized with. Reload the page and the decorations vanish unless something re-applies them from outside. That's exactly the property a private, per-reader annotation layer needs: computed fresh for whoever is looking, from data that lives in its own table, keyed to that one reader."
  ),
  heading(2, "The Part That Isn't Free: Anchoring"),
  paragraph(
    "Decorations solve where to draw a highlight, but not where a highlight still is after the underlying content has changed. A post can be edited after someone highlights a sentence in it. Storing a highlight as raw character offsets into the document breaks the instant a single character is added anywhere before it. The more durable approach, borrowed from web annotation tools that have solved this exact problem for plain HTML pages, is to store the highlighted text itself, plus a little surrounding context, rather than its coordinates. Finding it again becomes a text search instead of a position lookup: look for the quoted text, and if it appears more than once, use the saved context on either side to pick the right occurrence."
  ),
  paragraph(
    "It's not bulletproof. If a highlighted sentence gets rewritten entirely, the search comes up empty, and the honest answer is to say so rather than silently guessing at the wrong paragraph. A highlight that can no longer find its anchor should still show up wherever a reader's notes are listed, just marked as orphaned, instead of disappearing outright and quietly discarding a note someone wrote."
  ),
  heading(2, "What This Adds Up To"),
  paragraph(
    "None of this required touching how posts are written or how the underlying editor works. It required treating the reading view as something that can be decorated independently of what's stored, and treating a highlight's location as a description of text rather than a coordinate in a specific version of a document. Both of those ideas exist because the content was structured JSON from the start, not a wall of HTML that happened to render correctly in a browser."
  ),
];

const blogSeedPosts: {
  title: string;
  excerptText: string;
  categorySlug: string;
  tagNames: string[];
  body?: TiptapDoc[];
}[] = [
  {
    title: "Welcome to the Blog",
    excerptText:
      "This is the first post on this blog. More posts about software engineering, side projects, and lessons learned are coming soon.",
    categorySlug: "notes",
    tagNames: [],
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
  {
    title: "Building a Rich Text Editor for a Personal Blog",
    excerptText:
      "Notes on Tiptap, ProseMirror, and why storing posts as structured JSON instead of HTML is what eventually made a private, per-reader highlighting and note-taking layer possible without ever touching the shared document.",
    categorySlug: "engineering",
    tagNames: ["typescript", "tiptap", "editor"],
    body: longArticleBody,
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
        content: seedPost.body ?? [paragraph(seedPost.excerptText)],
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
const countFormattingFixturePosts: {
  title: string;
  excerptText: string;
  categorySlug: string;
  reactionCount: number;
  commentCount: number;
  viewCount: number;
}[] = [
  {
    title: "Count Fixture: Plain Digits",
    excerptText:
      "Counts below 1,000 render as-is. Use this post to check the ungrouped, unsuffixed case.",
    categorySlug: "notes",
    reactionCount: 999,
    commentCount: 7,
    viewCount: 128,
  },
  {
    title: "Count Fixture: Grouped Thousands",
    excerptText:
      "Counts between 1,000 and 9,999 stay exact but gain a thousands separator. This is the last bracket before compact notation kicks in.",
    categorySlug: "notes",
    reactionCount: 9_999,
    commentCount: 1_024,
    viewCount: 4_512,
  },
  {
    title: "Count Fixture: Compact Thousands",
    excerptText:
      "At 10,000 the formatter switches to compact notation, so these render as 12K and 87K.",
    categorySlug: "notes",
    reactionCount: 12_400,
    commentCount: 87_500,
    viewCount: 250_000,
  },
  {
    title: "Count Fixture: Millions",
    excerptText:
      "Values under ten keep one decimal place, so 1,240,000 renders as 1.2M while 34,000,000 renders as 34M.",
    categorySlug: "notes",
    reactionCount: 1_240_000,
    commentCount: 34_000_000,
    viewCount: 512_000_000,
  },
  {
    title: "Count Fixture: Billions",
    excerptText:
      "The largest bracket an integer column can hold. Trillions are supported by the formatter but exceed Postgres int4.",
    categorySlug: "notes",
    reactionCount: 1_900_000_000,
    commentCount: 2_000_000_000,
    viewCount: 2_100_000_000,
  },
];

async function seedCountFormattingFixtures(adminId: string) {
  for (const fixture of countFormattingFixturePosts) {
    const counts = {
      reactionCount: fixture.reactionCount,
      commentCount: fixture.commentCount,
      viewCount: fixture.viewCount,
    };

    const existingPost = await db.query.post.findFirst({
      where: eq(post.title, fixture.title),
    });

    if (existingPost) {
      await db.update(post).set(counts).where(eq(post.id, existingPost.id));
      console.log(`Reset count fixture: ${fixture.title}`);
      continue;
    }

    const postCategory = await db.query.category.findFirst({
      where: eq(category.slug, fixture.categorySlug),
    });

    await db.insert(post).values({
      id: randomUUID(),
      authorId: adminId,
      categoryId: postCategory?.id ?? null,
      title: fixture.title,
      slug: await uniqueSlug(fixture.title),
      excerptText: fixture.excerptText,
      contentJson: { type: "doc", content: [paragraph(fixture.excerptText)] },
      published: true,
      ...counts,
    });

    console.log(`Created count fixture: ${fixture.title}`);
  }
}

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

    await seedCountFormattingFixtures(adminId);
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

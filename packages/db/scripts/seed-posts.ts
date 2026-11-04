import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../src";
import type { TiptapDoc } from "../src/schema";
import { category, post, user } from "../src/schema";

const POST_COUNT = 120;
const MINUTES_BETWEEN_POSTS = 45;
const TITLE_PREFIX = "Seed Feed Post";

const TOPICS = [
  "Refactoring the auth flow",
  "Notes on database indexing",
  "A weekend with WebSockets",
  "Debugging a flaky CI pipeline",
  "Thoughts on component composition",
  "Migrating to server actions",
  "Caching strategies that actually work",
  "What I learned pairing this week",
  "A short note on error boundaries",
  "Revisiting the onboarding flow",
  "Why we moved to cursor pagination",
  "Small wins from a slow week",
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

async function main() {
  const isLocalDatabase = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "");
  if (!isLocalDatabase) {
    throw new Error(
      "seed-posts is a dev-only script and refuses to run against a non-local DATABASE_URL"
    );
  }

  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL must be set — run `pnpm seed` first to create the admin account");
  }

  const admin = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (!admin) {
    throw new Error(`No user found for ADMIN_EMAIL=${email} — run \`pnpm seed\` first`);
  }

  const categories = await db.query.category.findMany();

  let created = 0;
  let skipped = 0;
  const now = Date.now();

  for (let i = 0; i < POST_COUNT; i++) {
    const topic = TOPICS[i % TOPICS.length];
    const title = `${TITLE_PREFIX} #${i + 1}: ${topic}`;

    const existing = await db.query.post.findFirst({ where: eq(post.title, title) });
    if (existing) {
      skipped += 1;
      continue;
    }

    const excerptText = `Seed post ${i + 1} of ${POST_COUNT}, generated to exercise infinite scrolling on the blog feed.`;
    const body: TiptapDoc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: excerptText }] },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `This is placeholder content for "${topic}", seed post number ${i + 1}.`,
            },
          ],
        },
      ],
    };

    const seedCategory = categories.length ? categories[i % categories.length] : undefined;
    const createdAt = new Date(now - i * MINUTES_BETWEEN_POSTS * 60 * 1000);

    await db.insert(post).values({
      id: randomUUID(),
      authorId: admin.id,
      categoryId: seedCategory?.id ?? null,
      title,
      slug: await uniqueSlug(title),
      excerptText,
      contentJson: body,
      published: true,
      createdAt,
      updatedAt: createdAt,
    });

    created += 1;
  }

  console.log(`Created ${created} seed posts (${skipped} already existed).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  // postgres.js keeps its connection open, which would otherwise keep this one-shot
  // script's process alive forever after the work above is done.
  .finally(() => process.exit());

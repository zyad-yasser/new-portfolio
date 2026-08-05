import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "../src";
import { account, post, user } from "../src/schema";

const blogSeedPosts = [
  {
    title: "Welcome to the Blog",
    content:
      "This is the first post on this blog. More posts about software engineering, side projects, and lessons learned are coming soon.",
  },
  {
    title: "Building a Monorepo with Turborepo and pnpm",
    content:
      "Notes on structuring a multi-app Turborepo workspace: shared UI, shared auth, and a shared database layer consumed by several independent Next.js apps.",
  },
  {
    title: "Two Better Auth Instances, One Database",
    content:
      "Why splitting authentication into an admin instance and a public instance, each with its own secret, is a clean way to keep a single-owner admin app and a public multi-user app on the same Postgres tables without trusting each other's sessions.",
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

  for (const seedPost of blogSeedPosts) {
    const existingPost = await db.query.post.findFirst({
      where: eq(post.title, seedPost.title),
    });

    if (existingPost) {
      console.log(`Blog post already exists: ${seedPost.title}`);
      continue;
    }

    const slug = await uniqueSlug(seedPost.title);

    await db.insert(post).values({
      id: randomUUID(),
      authorId: adminId,
      title: seedPost.title,
      slug,
      content: seedPost.content,
      published: true,
    });

    console.log(`Created blog post: ${seedPost.title}`);
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

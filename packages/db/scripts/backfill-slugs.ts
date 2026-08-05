import { asc, eq } from "drizzle-orm";
import { db } from "../src";
import { post } from "../src/schema";

function slugifyBase(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const posts = await db.query.post.findMany({ orderBy: asc(post.createdAt) });
  const usedSlugs = new Set<string>();
  let changed = 0;

  for (const row of posts) {
    const base = slugifyBase(row.title) || "post";
    let candidate = base;
    let suffix = 1;

    while (usedSlugs.has(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    usedSlugs.add(candidate);

    if (candidate !== row.slug) {
      await db.update(post).set({ slug: candidate }).where(eq(post.id, row.id));
      console.log(`${row.slug} -> ${candidate}`);
      changed += 1;
    }
  }

  console.log(`Reslugified ${changed}/${posts.length} posts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());

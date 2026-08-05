import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../src";
import { userProfile } from "../src/schema";

function slugifyBase(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueUsername(seed: string) {
  const base = slugifyBase(seed) || "user";
  let candidate = base;
  let suffix = 1;

  while (await db.query.userProfile.findFirst({ where: eq(userProfile.username, candidate) })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

async function main() {
  const users = await db.query.user.findMany({ with: { profile: true } });
  let created = 0;

  for (const row of users) {
    if (row.profile) {
      continue;
    }

    const seed = row.name.trim() || row.email.split("@")[0] || "user";
    const username = await uniqueUsername(seed);

    await db.insert(userProfile).values({
      userId: row.id,
      username,
    });

    console.log(`Backfilled username for ${row.email}: ${username}`);
    created += 1;
  }

  console.log(`Backfilled ${created} user(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());

import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "../src";
import { account, user } from "../src/schema";

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

  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  const userId = randomUUID();
  const hash = await hashPassword(password);

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: false,
    role: "admin",
  });

  await db.insert(account).values({
    id: randomUUID(),
    userId,
    providerId: "credential",
    accountId: userId,
    password: hash,
  });

  console.log(`Created admin account: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  // postgres.js keeps its connection open, which would otherwise keep this one-shot
  // script's process alive forever after the work above is done.
  .finally(() => process.exit());

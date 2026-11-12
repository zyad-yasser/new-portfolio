import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isLocalDatabase } from "../test-utils/local-database";

type Harness = typeof import("../test-utils/harness");

describe.skipIf(!isLocalDatabase())("admin protectedProcedure", () => {
  let h: Harness;

  beforeAll(async () => {
    h = await import("../test-utils/harness");
  });

  afterAll(async () => {
    await h?.cleanupTestUsers();
  });

  it("rejects a session whose role is user", async () => {
    const regular = await h.createTestUser({ role: "user" });
    await expect(h.adminCaller(regular).me()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an anonymous caller", async () => {
    await expect(h.adminCaller(null).me()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("allows a session whose role is admin", async () => {
    const admin = await h.createTestUser({ role: "admin" });
    await expect(h.adminCaller(admin).me()).resolves.toMatchObject({ id: admin.id, role: "admin" });
  });
});

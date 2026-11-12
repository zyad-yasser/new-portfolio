import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isLocalDatabase } from "../../test-utils/local-database";

type Harness = typeof import("../../test-utils/harness");
type TestUser = import("../../test-utils/harness").TestUser;

describe.skipIf(!isLocalDatabase())("feed.following pagination", () => {
  let h: Harness;
  let reader: TestUser;
  let writer: TestUser;

  beforeAll(async () => {
    h = await import("../../test-utils/harness");
    reader = await h.createTestUser();
    writer = await h.createTestUser();
  });

  afterAll(async () => {
    await h?.cleanupTestUsers();
  });

  it("walks every page past the first without errors or duplicates", async () => {
    const posts = [];
    for (let i = 0; i < 4; i++) {
      posts.push(await h.insertPost({ authorId: writer.id, published: true }));
    }
    await h.publicCaller(reader).follow.follow({ userId: writer.id });

    const seen: string[] = [];
    let cursor: { activityAt: Date; sortKey: string } | undefined;
    for (let page = 0; page < 10; page++) {
      const result = await h.publicCaller(reader).feed.following({ limit: 1, cursor });
      seen.push(...result.items.map((item) => item.post.id));
      if (!result.nextCursor) {
        break;
      }
      cursor = result.nextCursor;
    }

    expect(new Set(seen).size).toBe(seen.length);
    expect(seen.sort()).toEqual(posts.map((p) => p.id).sort());
  });
});

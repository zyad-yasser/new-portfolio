import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isLocalDatabase, listItems } from "../../test-utils/local-database";

type Harness = typeof import("../../test-utils/harness");
type TestUser = import("../../test-utils/harness").TestUser;

describe.skipIf(!isLocalDatabase())("public router authorization", () => {
  let h: Harness;
  let author: TestUser;
  let stranger: TestUser;
  let commenter: TestUser;
  let unverified: TestUser;

  beforeAll(async () => {
    h = await import("../../test-utils/harness");
    author = await h.createTestUser();
    stranger = await h.createTestUser();
    commenter = await h.createTestUser();
    unverified = await h.createTestUser({ emailVerified: false });
  });

  afterAll(async () => {
    await h?.cleanupTestUsers();
  });

  describe("post ownership", () => {
    it("rejects update by a non-owner and allows the owner", async () => {
      const target = await h.insertPost({ authorId: author.id, published: true });

      await expect(
        h.publicCaller(stranger).post.update({ id: target.id, title: "hijacked" })
      ).rejects.toMatchObject({ code: "NOT_FOUND" });

      const updated = await h.publicCaller(author).post.update({ id: target.id, title: "renamed" });
      expect(updated.title).toBe("renamed");
    });

    it("rejects delete by a non-owner and allows the owner", async () => {
      const target = await h.insertPost({ authorId: author.id, published: true });

      await expect(h.publicCaller(stranger).post.delete({ id: target.id })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });

      await expect(h.publicCaller(author).post.delete({ id: target.id })).resolves.toEqual({
        id: target.id,
      });
    });

    it("does not let a non-owner change publish state", async () => {
      const target = await h.insertPost({ authorId: author.id, published: false });

      const strangerOutcome = await h
        .publicCaller(stranger)
        .post.setPublished({ id: target.id, published: true })
        .then(
          (value) => ({ value, code: null }),
          (error: { code?: string }) => ({ value: null, code: error.code ?? "UNKNOWN" })
        );
      expect(strangerOutcome.value).toBeNull();
      expect([null, "NOT_FOUND", "FORBIDDEN"]).toContain(strangerOutcome.code);

      await expect(
        h.publicCaller(stranger).post.getBySlug({ slug: target.slug })
      ).rejects.toMatchObject({ code: "NOT_FOUND" });

      const ownerResult = await h
        .publicCaller(author)
        .post.setPublished({ id: target.id, published: true });
      expect(ownerResult?.published).toBe(true);
    });

    it("hides an unpublished post from non-owners in getBySlug but not from the owner", async () => {
      const draft = await h.insertPost({ authorId: author.id, published: false });

      await expect(
        h.publicCaller(stranger).post.getBySlug({ slug: draft.slug })
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
      await expect(h.publicCaller(null).post.getBySlug({ slug: draft.slug })).rejects.toMatchObject(
        { code: "NOT_FOUND" }
      );

      const own = await h.publicCaller(author).post.getBySlug({ slug: draft.slug });
      expect(own.id).toBe(draft.id);
    });
  });

  describe("draft visibility through side routes", () => {
    it("returns NOT_FOUND for every side route on another user's draft", async () => {
      const draft = await h.insertPost({ authorId: author.id, published: false });
      const caller = h.publicCaller(stranger);

      await expect(caller.bookmark.toggle({ postId: draft.id })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      await expect(caller.reaction.react({ postId: draft.id, type: "like" })).rejects.toMatchObject(
        { code: "NOT_FOUND" }
      );
      await expect(caller.comment.create({ postId: draft.id, body: "peek" })).rejects.toMatchObject(
        { code: "NOT_FOUND" }
      );
      await expect(caller.comment.listByPost({ postId: draft.id })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      await expect(caller.reaction.summary({ postId: draft.id })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      await expect(
        h.publicCaller(null).reaction.summary({ postId: draft.id })
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("drops a post from bookmark.mine once it is unpublished", async () => {
      const target = await h.insertPost({ authorId: author.id, published: true });
      const reader = h.publicCaller(stranger);

      await expect(reader.bookmark.toggle({ postId: target.id })).resolves.toEqual({
        bookmarked: true,
      });
      const before = listItems(await reader.bookmark.mine());
      expect(before.map((row) => row.id)).toContain(target.id);

      await h.publicCaller(author).post.setPublished({ id: target.id, published: false });

      const after = listItems(await reader.bookmark.mine());
      expect(after.map((row) => row.id)).not.toContain(target.id);
    });

    it("nulls out quotedPost when the quoted post is unpublished", async () => {
      const original = await h.insertPost({ authorId: author.id, published: true });
      const quote = await h
        .publicCaller(stranger)
        .post.createQuote({ quotedPostId: original.id, contentJson: h.tiptapDoc });

      const visible = await h.publicCaller(commenter).post.getBySlug({ slug: quote.slug });
      expect(visible.quotedPost?.id).toBe(original.id);

      await h.publicCaller(author).post.setPublished({ id: original.id, published: false });

      const hidden = await h.publicCaller(commenter).post.getBySlug({ slug: quote.slug });
      expect(hidden.quotedPost).toBeNull();
    });
  });

  describe("comment authorization", () => {
    it("forbids deleting a comment by someone who is neither its author nor the post author", async () => {
      const target = await h.insertPost({ authorId: author.id, published: true });
      const created = await h.insertComment({ postId: target.id, authorId: commenter.id });

      await expect(
        h.publicCaller(stranger).comment.delete({ id: created.id })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });

      await expect(h.publicCaller(author).comment.delete({ id: created.id })).resolves.toEqual({
        id: created.id,
      });
    });

    it("returns NOT_FOUND when updating a deleted comment", async () => {
      const target = await h.insertPost({ authorId: author.id, published: true });
      const deleted = await h.insertComment({
        postId: target.id,
        authorId: commenter.id,
        deleted: true,
      });

      await expect(
        h.publicCaller(commenter).comment.update({ id: deleted.id, body: "revived" })
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("verifiedProcedure", () => {
    it("forbids an unverified user from creating a post", async () => {
      await expect(
        h.publicCaller(unverified).post.create({ title: "nope", contentJson: h.tiptapDoc })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("rejects anonymous callers with UNAUTHORIZED", async () => {
      await expect(
        h.publicCaller(null).post.create({ title: "nope", contentJson: h.tiptapDoc })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });
  });

  describe("media.confirm key validation", () => {
    it("forbids a key under another user's prefix", async () => {
      await expect(
        h.publicCaller(stranger).media.confirm({
          key: `media/${author.id}/${randomUUID()}.png`,
          originalName: "x.png",
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("forbids path traversal out of the caller's prefix", async () => {
      await expect(
        h.publicCaller(stranger).media.confirm({
          key: `media/${stranger.id}/../x/${randomUUID()}.png`,
          originalName: "x.png",
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
  });

  describe("blocking", () => {
    it("forbids a blocked user from commenting on the blocker's post", async () => {
      const blocker = await h.createTestUser();
      const blocked = await h.createTestUser();
      const target = await h.insertPost({ authorId: blocker.id, published: true });

      await h.publicCaller(blocker).block.block({ userId: blocked.id });

      await expect(
        h.publicCaller(blocked).comment.create({ postId: target.id, body: "hi" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
  });
});

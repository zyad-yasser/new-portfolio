import { relations } from "drizzle-orm";
import { user } from "./auth";
import { category, comment, post, postReaction, postTag, tag, userBlock } from "./blog";

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [post.categoryId],
    references: [category.id],
  }),
  postTags: many(postTag),
  comments: many(comment),
  reactions: many(postReaction),
}));

export const userRelations = relations(user, ({ many }) => ({
  posts: many(post),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  posts: many(post),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  postTags: many(postTag),
}));

export const postTagRelations = relations(postTag, ({ one }) => ({
  post: one(post, {
    fields: [postTag.postId],
    references: [post.id],
  }),
  tag: one(tag, {
    fields: [postTag.tagId],
    references: [tag.id],
  }),
}));

export const userBlockRelations = relations(userBlock, ({ one }) => ({
  blocker: one(user, {
    fields: [userBlock.blockerId],
    references: [user.id],
    relationName: "blocking",
  }),
  blocked: one(user, {
    fields: [userBlock.blockedId],
    references: [user.id],
    relationName: "blockedBy",
  }),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
  author: one(user, {
    fields: [comment.authorId],
    references: [user.id],
  }),
  parent: one(comment, {
    fields: [comment.parentCommentId],
    references: [comment.id],
    relationName: "replies",
  }),
  replies: many(comment, { relationName: "replies" }),
}));

export const postReactionRelations = relations(postReaction, ({ one }) => ({
  post: one(post, {
    fields: [postReaction.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [postReaction.userId],
    references: [user.id],
  }),
}));

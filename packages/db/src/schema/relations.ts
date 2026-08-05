import { relations } from "drizzle-orm";
import { user } from "./auth";
import { category, post, postTag, tag } from "./blog";

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

import { relations } from "drizzle-orm";
import { user } from "./auth";
import { post } from "./blog";

export const postRelations = relations(post, ({ one }) => ({
  author: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  posts: many(post),
}));

import { relations } from "drizzle-orm";
import { user } from "./auth";
import {
  category,
  comment,
  post,
  postBookmark,
  postReaction,
  postTag,
  tag,
  userBlock,
  userFollow,
  userProfile,
} from "./blog";

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

export const userRelations = relations(user, ({ many, one }) => ({
  posts: many(post),
  profile: one(userProfile),
  following: many(userFollow, { relationName: "followingList" }),
  followers: many(userFollow, { relationName: "followerList" }),
  bookmarks: many(postBookmark),
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

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}));

export const userFollowRelations = relations(userFollow, ({ one }) => ({
  follower: one(user, {
    fields: [userFollow.followerId],
    references: [user.id],
    relationName: "followingList",
  }),
  following: one(user, {
    fields: [userFollow.followingId],
    references: [user.id],
    relationName: "followerList",
  }),
}));

export const postBookmarkRelations = relations(postBookmark, ({ one }) => ({
  user: one(user, {
    fields: [postBookmark.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [postBookmark.postId],
    references: [post.id],
  }),
}));

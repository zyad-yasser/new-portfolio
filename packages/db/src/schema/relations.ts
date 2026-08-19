import { relations } from "drizzle-orm";
import { user } from "./auth";
import {
  category,
  comment,
  media,
  mediaFolder,
  notification,
  post,
  postBookmark,
  postHighlight,
  postImageAnnotation,
  postReaction,
  postReshare,
  postTag,
  postVideoComment,
  series,
  tag,
  userBlock,
  userFollow,
  userProfile,
  userStorageQuota,
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
  series: one(series, {
    fields: [post.seriesId],
    references: [series.id],
  }),
  quotedPost: one(post, {
    fields: [post.quotedPostId],
    references: [post.id],
    relationName: "quotes",
  }),
  postTags: many(postTag),
  comments: many(comment),
  reactions: many(postReaction),
  reshares: many(postReshare),
  highlights: many(postHighlight),
  videoComments: many(postVideoComment),
  imageAnnotations: many(postImageAnnotation),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  posts: many(post),
  profile: one(userProfile),
  following: many(userFollow, { relationName: "followingList" }),
  followers: many(userFollow, { relationName: "followerList" }),
  bookmarks: many(postBookmark),
  reshares: many(postReshare),
  media: many(media),
  series: many(series),
  notificationsReceived: many(notification, { relationName: "notificationsReceived" }),
  notificationsSent: many(notification, { relationName: "notificationsSent" }),
  storageQuota: one(userStorageQuota),
  highlights: many(postHighlight),
  videoComments: many(postVideoComment),
  imageAnnotations: many(postImageAnnotation),
}));

export const seriesRelations = relations(series, ({ one, many }) => ({
  author: one(user, {
    fields: [series.authorId],
    references: [user.id],
  }),
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

export const postHighlightRelations = relations(postHighlight, ({ one }) => ({
  post: one(post, {
    fields: [postHighlight.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [postHighlight.userId],
    references: [user.id],
  }),
}));

export const postVideoCommentRelations = relations(postVideoComment, ({ one }) => ({
  post: one(post, {
    fields: [postVideoComment.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [postVideoComment.userId],
    references: [user.id],
  }),
}));

export const postImageAnnotationRelations = relations(postImageAnnotation, ({ one }) => ({
  post: one(post, {
    fields: [postImageAnnotation.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [postImageAnnotation.userId],
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

export const postReshareRelations = relations(postReshare, ({ one }) => ({
  user: one(user, {
    fields: [postReshare.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [postReshare.postId],
    references: [post.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  owner: one(user, {
    fields: [media.ownerId],
    references: [user.id],
  }),
  folder: one(mediaFolder, {
    fields: [media.folderId],
    references: [mediaFolder.id],
  }),
}));

export const mediaFolderRelations = relations(mediaFolder, ({ one, many }) => ({
  owner: one(user, {
    fields: [mediaFolder.ownerId],
    references: [user.id],
  }),
  parent: one(mediaFolder, {
    fields: [mediaFolder.parentId],
    references: [mediaFolder.id],
    relationName: "folderTree",
  }),
  children: many(mediaFolder, { relationName: "folderTree" }),
  media: many(media),
}));

export const userStorageQuotaRelations = relations(userStorageQuota, ({ one }) => ({
  owner: one(user, {
    fields: [userStorageQuota.ownerId],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  recipient: one(user, {
    fields: [notification.recipientId],
    references: [user.id],
    relationName: "notificationsReceived",
  }),
  actor: one(user, {
    fields: [notification.actorId],
    references: [user.id],
    relationName: "notificationsSent",
  }),
  post: one(post, {
    fields: [notification.postId],
    references: [post.id],
  }),
  comment: one(comment, {
    fields: [notification.commentId],
    references: [comment.id],
  }),
}));

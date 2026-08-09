import { Heart, MessageCircle, Reply, UserPlus } from "lucide-react";

export type NotificationItem = {
  id: string;
  type: "follow" | "comment" | "reply" | "reaction" | "mention";
  readAt: Date | string | null;
  createdAt: Date | string;
  actor: {
    id: string;
    name: string;
    image: string | null;
    profile: { username: string } | null;
  } | null;
  post: { slug: string; title: string } | null;
};

export const NOTIFICATION_TYPE_ICON = {
  follow: UserPlus,
  comment: MessageCircle,
  reply: Reply,
  reaction: Heart,
  mention: MessageCircle,
} as const;

export function notificationText(n: NotificationItem) {
  const actorName = n.actor?.name ?? "Someone";
  switch (n.type) {
    case "follow":
      return `${actorName} started following you`;
    case "comment":
      return `${actorName} commented on "${n.post?.title ?? "your post"}"`;
    case "reply":
      return `${actorName} replied to your comment on "${n.post?.title ?? "a post"}"`;
    case "reaction":
      return `${actorName} reacted to "${n.post?.title ?? "your post"}"`;
    case "mention":
      return `${actorName} mentioned you in "${n.post?.title ?? "a post"}"`;
  }
}

export function notificationHref(n: NotificationItem) {
  if (n.type === "follow") {
    return n.actor?.profile ? `/u/${n.actor.profile.username}` : "/";
  }
  return n.post ? `/post/${n.post.slug}` : "/";
}

export function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
